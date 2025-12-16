import { serve } from 'https://deno.land/std@0.192.0/http/server.ts'
import Parser from 'https://esm.sh/rss-parser@3.13.0'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'media:content'],
      ['media:thumbnail', 'media:thumbnail'],
      ['enclosure', 'enclosure'],
    ],
  },
})

serve(async () => {
  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')

    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      throw new Error('Supabase env missing')
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

    console.log('✅ Starting news sync...')

    // lists 로드
    const { data: lists } = await supabase.from('lists').select('list_id, name')

    console.log('📋 Lists loaded:', lists?.length)

    const listMap = new Map<string, string>()
    lists?.forEach((l) => {
      listMap.set(l.name, l.list_id)
      console.log(`  - ${l.name} -> ${l.list_id}`)
    })

    const results = {
      korean_tech: { inserted: 0, skipped: 0, no_category: 0 },
      naver: { inserted: 0, skipped: 0, no_category: 0 },
    }

    // 한국 IT 뉴스 수집
    try {
      const result = await syncKoreanTech(supabase, listMap, ANTHROPIC_API_KEY)
      results.korean_tech = result
    } catch (e) {
      console.error('Korean tech sync failed:', e)
    }

    // Naver 수집
    try {
      const result = await syncNaverNews(supabase, listMap, ANTHROPIC_API_KEY)
      results.naver = result
    } catch (e) {
      console.error('Naver sync failed:', e)
    }

    return new Response(
      JSON.stringify({
        ok: true,
        timestamp: new Date().toISOString(),
        ...results,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (e) {
    console.error('SYNC ERROR:', e)
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 })
  }
})

async function syncKoreanTech(
  supabase: any,
  listMap: Map<string, string>,
  anthropicKey?: string
) {
  console.log('🇰🇷 Starting Korean Tech News sync...')

  const rssSources = [
    { name: 'ITWorld', url: 'https://www.itworld.co.kr/rss/news.xml' },
    { name: 'ZDNet', url: 'https://feeds.feedburner.com/zdkorea' },
    { name: 'Boannews', url: 'https://www.boannews.com/media/news_rss.xml' },
  ]

  let totalInserted = 0
  let totalSkipped = 0
  let totalNoCategory = 0

  for (const source of rssSources) {
    try {
      console.log(`📡 Fetching ${source.name}...`)

      const rssRes = await fetch(source.url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept-Charset': 'utf-8',
        },
      })

      if (!rssRes.ok) {
        console.error(`❌ ${source.name} HTTP ${rssRes.status}`)
        continue
      }

      // 인코딩 감지 및 디코딩
      const buffer = await rssRes.arrayBuffer()
      let text = ''

      // UTF-8 시도
      try {
        const decoder = new TextDecoder('utf-8', { fatal: true })
        text = decoder.decode(buffer)
      } catch {
        // UTF-8 실패시 EUC-KR 시도
        try {
          const decoder = new TextDecoder('euc-kr')
          text = decoder.decode(buffer)
          console.log(`📝 ${source.name}: Using EUC-KR encoding`)
        } catch {
          // 둘 다 실패시 기본 디코딩
          const decoder = new TextDecoder()
          text = decoder.decode(buffer)
          console.log(`📝 ${source.name}: Using default encoding`)
        }
      }
      console.log(`📥 ${source.name}: ${text.length} bytes`)

      const feed = await parser.parseString(text)
      const items = feed.items.slice(0, 20)

      console.log(`📰 ${source.name}: ${items.length} items`)

      let inserted = 0
      let skipped = 0
      let noCategory = 0

      for (const item of items) {
        if (!item.title || !item.link) continue

        // 📅 날짜 디버깅
        console.log('📅 Date fields:', {
          pubDate: item.pubDate,
          isoDate: item.isoDate,
          date: item.date,
          published: item.published,
        })

        // 중복 체크
        const { data: exists } = await supabase
          .from('articles')
          .select('article_id')
          .eq('link', item.link)
          .maybeSingle()

        if (exists) {
          skipped++
          continue
        }

        // 📅 날짜 파싱 (여러 필드 시도)
        const publishedAt =
          item.pubDate || item.isoDate || item.date || item.published
        const publishedAtISO = publishedAt
          ? new Date(publishedAt).toISOString()
          : null

        // 🖼️ 이미지 추출
        const imageUrl = extractImageUrl(item)

        // 🤖 AI로 카테고리 + 키워드 분석
        let category = null
        let keywords: string[] = []

        if (anthropicKey) {
          try {
            const aiResult = await analyzeWithAI(
              item.title,
              item.contentSnippet || '',
              anthropicKey,
              Array.from(listMap.keys())
            )
            category = aiResult.category
            keywords = aiResult.keywords
            console.log(`🤖 AI: [${category}] ${keywords.join(', ')}`)
          } catch (e) {
            console.error(
              'AI analysis failed, fallback to keyword matching:',
              e
            )
            category = classify(item.title + ' ' + (item.contentSnippet || ''))
            keywords = extractKeywords(
              item.title + ' ' + (item.contentSnippet || '')
            )
          }
        } else {
          // AI 없으면 기존 키워드 매칭 + 자동 키워드 추출
          category = classify(item.title + ' ' + (item.contentSnippet || ''))
          keywords = extractKeywords(
            item.title + ' ' + (item.contentSnippet || '')
          )
          console.log(`🔍 Keywords: ${keywords.join(', ')}`)
        }

        // 카테고리 없으면 스킵
        if (!category) {
          noCategory++
          console.log(`⏭️  No category: ${item.title.substring(0, 40)}...`)
          continue
        }

        const listId = listMap.get(category)

        // listId 없으면 스킵
        if (!listId) {
          noCategory++
          console.log(
            `⏭️  Category not found in DB: [${category}] ${item.title.substring(0, 40)}...`
          )
          continue
        }

        const { error } = await supabase.from('articles').insert({
          title: item.title,
          link: item.link,
          summary: item.contentSnippet ?? null,
          list: listId,
          source: source.name.toLowerCase(),
          published_at: publishedAtISO,
          image_url: imageUrl,
          keywords: keywords.length > 0 ? keywords : null,
        })

        if (error) {
          console.error(`❌ Insert error:`, error.message)
        } else {
          console.log(
            `✅ [${category}] ${item.title.substring(0, 40)}... | 🖼️ ${imageUrl ? 'Y' : 'N'} | 📅 ${publishedAtISO || 'NO_DATE'}`
          )
          inserted++
        }
      }

      console.log(
        `✅ ${source.name}: +${inserted}, skip ${skipped}, no_cat ${noCategory}`
      )
      totalInserted += inserted
      totalSkipped += skipped
      totalNoCategory += noCategory
    } catch (e) {
      console.error(`❌ ${source.name} error:`, e)
    }
  }

  return {
    inserted: totalInserted,
    skipped: totalSkipped,
    no_category: totalNoCategory,
  }
}

async function syncNaverNews(
  supabase: any,
  listMap: Map<string, string>,
  anthropicKey?: string
) {
  console.log('📰 Starting Naver News sync...')

  const rssUrl = 'https://news.naver.com/rss/main_section.xml?sid1=105'

  let inserted = 0
  let skipped = 0
  let noCategory = 0

  try {
    const rssRes = await fetch(rssUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept-Charset': 'utf-8',
      },
    })

    if (!rssRes.ok) {
      console.error(`❌ Naver HTTP ${rssRes.status}`)
      return { inserted, skipped, no_category: noCategory }
    }

    // 인코딩 감지 및 디코딩
    const buffer = await rssRes.arrayBuffer()
    let text = ''

    // UTF-8 시도
    try {
      const decoder = new TextDecoder('utf-8', { fatal: true })
      text = decoder.decode(buffer)
    } catch {
      // UTF-8 실패시 EUC-KR 시도
      try {
        const decoder = new TextDecoder('euc-kr')
        text = decoder.decode(buffer)
        console.log('📝 Naver: Using EUC-KR encoding')
      } catch {
        // 둘 다 실패시 기본 디코딩
        const decoder = new TextDecoder()
        text = decoder.decode(buffer)
        console.log('📝 Naver: Using default encoding')
      }
    }
    console.log(`📥 Naver: ${text.length} bytes`)

    const feed = await parser.parseString(text)
    const items = feed.items.slice(0, 20)

    console.log(`📰 Naver: ${items.length} items`)

    for (const item of items) {
      if (!item.title || !item.link) continue

      // 중복 체크
      const { data: exists } = await supabase
        .from('articles')
        .select('article_id')
        .eq('link', item.link)
        .maybeSingle()

      if (exists) {
        skipped++
        continue
      }

      // 📅 날짜 파싱
      const publishedAt = item.pubDate
        ? new Date(item.pubDate).toISOString()
        : null

      // 🖼️ 이미지 추출
      const imageUrl = extractImageUrl(item)

      // 🤖 AI로 카테고리 + 키워드 분석
      let category = null
      let keywords: string[] = []

      if (anthropicKey) {
        try {
          const aiResult = await analyzeWithAI(
            item.title,
            item.contentSnippet || '',
            anthropicKey,
            Array.from(listMap.keys())
          )
          category = aiResult.category
          keywords = aiResult.keywords
          console.log(`🤖 AI: [${category}] ${keywords.join(', ')}`)
        } catch (e) {
          console.error('AI analysis failed, fallback to keyword matching:', e)
          category = classify(item.title + ' ' + (item.contentSnippet || ''))
        }
      } else {
        // AI 없으면 기존 키워드 매칭
        category = classify(item.title + ' ' + (item.contentSnippet || ''))
      }

      // 카테고리 없으면 스킵
      if (!category) {
        noCategory++
        console.log(`⏭️  No category: ${item.title.substring(0, 40)}...`)
        continue
      }

      const listId = listMap.get(category)

      // listId 없으면 스킵
      if (!listId) {
        noCategory++
        console.log(
          `⏭️  Category not found in DB: [${category}] ${item.title.substring(0, 40)}...`
        )
        continue
      }

      const { error } = await supabase.from('articles').insert({
        title: item.title,
        link: item.link,
        summary: item.contentSnippet ?? null,
        list: listId,
        source: 'naver',
        published_at: publishedAt,
        image_url: imageUrl,
        keywords: keywords.length > 0 ? keywords : null,
      })

      if (error) {
        console.error(`❌ Insert error:`, error.message)
      } else {
        console.log(
          `✅ [${category}] ${item.title.substring(0, 40)}... | 🖼️ ${imageUrl ? 'Y' : 'N'} | 📅 ${publishedAt}`
        )
        inserted++
      }
    }

    console.log(`✅ Naver: +${inserted}, skip ${skipped}, no_cat ${noCategory}`)
  } catch (e) {
    console.error('❌ Naver error:', e)
  }

  return { inserted, skipped, no_category: noCategory }
}

function classify(text: string): string | null {
  const lowerText = text.toLowerCase()

  // DB lists 테이블의 이름과 정확히 일치
  const categories = {
    Frontend: [
      'react',
      'vue',
      'angular',
      'svelte',
      'next.js',
      'nuxt',
      'typescript',
      'javascript',
      'css',
      'html',
      'tailwind',
      'frontend',
      'ui component',
      'jsx',
      'tsx',
      'webpack',
      'vite',
      '프론트엔드',
    ],
    Backend: [
      'node',
      'express',
      'nestjs',
      'django',
      'flask',
      'fastapi',
      'spring',
      'backend',
      'api',
      'restful',
      'graphql',
      'database',
      'postgresql',
      'mysql',
      'mongodb',
      'redis',
      'orm',
      '백엔드',
      '데이터베이스',
    ],
    AI: [
      'ai',
      'llm',
      'gpt',
      'claude',
      'gemini',
      'machine learning',
      'deep learning',
      'neural network',
      'transformer',
      'pytorch',
      'tensorflow',
      'chatbot',
      'openai',
      'anthropic',
      '인공지능',
      '머신러닝',
      '딥러닝',
    ],
    Infrastructure: [
      'kubernetes',
      'docker',
      'container',
      'devops',
      'ci/cd',
      'jenkins',
      'github actions',
      'terraform',
      'ansible',
      'nginx',
      'apache',
      '인프라',
      'k8s',
    ],
    Cloud: [
      'aws',
      'azure',
      'gcp',
      'google cloud',
      'cloud',
      's3',
      'lambda',
      'ec2',
      'cloudflare',
      'serverless',
      'vercel',
      'netlify',
      '클라우드',
    ],
    Security: [
      'security',
      'auth',
      'authentication',
      'jwt',
      'oauth',
      'encryption',
      'ssl',
      'tls',
      'vulnerability',
      'hack',
      'cyber',
      'penetration',
      '보안',
      '취약점',
      '해킹',
    ],
    'Product Management': [
      'product',
      'pm',
      'product manager',
      'roadmap',
      'agile',
      'scrum',
      'jira',
      'planning',
      'strategy',
      'user story',
      '기획',
      '프로덕트',
      '프로젝트 관리',
    ],
    'UI/UX Design': [
      'design',
      'ui',
      'ux',
      'user experience',
      'user interface',
      'figma',
      'sketch',
      'prototype',
      'wireframe',
      'mockup',
      '디자인',
      'ui/ux',
      '사용자 경험',
    ],
  }

  const scores: Record<string, number> = {}

  for (const [category, keywords] of Object.entries(categories)) {
    scores[category] = 0
    for (const keyword of keywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        scores[category]++
      }
    }
  }

  let maxScore = 0
  let bestCategory: string | null = null

  for (const [category, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score
      bestCategory = category
    }
  }

  // 최소 1개 이상 키워드 매칭되어야 분류
  return maxScore > 0 ? bestCategory : null
}

// 🖼️ 이미지 URL 추출 (RSS + Jina 본문)
async function extractImageUrl(item: any): Promise<string | null> {
  // 1단계: RSS에서 먼저 찾기 (빠름)
  if (item.enclosure?.url) {
    return item.enclosure.url
  }

  if (item['media:content']?.$?.url) {
    return item['media:content'].$.url
  }

  if (item['media:thumbnail']?.$?.url) {
    return item['media:thumbnail'].$.url
  }

  if (item.content) {
    const imgMatch = item.content.match(/<img[^>]+src="([^">]+)"/)
    if (imgMatch) return imgMatch[1]
  }

  // 2단계: RSS에 없으면 Jina로 본문 스크래핑 (느림)
  if (item.link) {
    try {
      const jinaUrl = `https://r.jina.ai/${item.link}`
      const response = await fetch(jinaUrl, {
        headers: { 'X-Timeout': '5' }, // 5초 타임아웃
      })

      if (response.ok) {
        const markdown = await response.text()
        // 마크다운에서 첫 이미지 찾기
        const imgMatch = markdown.match(/!\[.*?\]\((https?:\/\/[^\)]+)\)/)
        if (imgMatch) {
          console.log(`🖼️  Jina found image: ${imgMatch[1]}`)
          return imgMatch[1]
        }
      }
    } catch (e) {
      console.error('Jina image fetch failed:', e)
    }
  }

  return null
}

// 🔍 키워드 자동 추출 (AI 없을 때)
function extractKeywords(text: string): string[] {
  const keywords: string[] = []
  const lowerText = text.toLowerCase()

  // 기술 스택 키워드
  const techKeywords = [
    'react',
    'vue',
    'angular',
    'typescript',
    'javascript',
    'python',
    'java',
    'node',
    'express',
    'django',
    'spring',
    'docker',
    'kubernetes',
    'aws',
    'azure',
    'gcp',
    'ai',
    'llm',
    'gpt',
    'claude',
    'openai',
    'security',
    '보안',
    '취약점',
    '해킹',
    'api',
    'database',
    '데이터베이스',
    'cloud',
    '클라우드',
    '인공지능',
    '머신러닝',
    'devops',
    'frontend',
    'backend',
  ]

  for (const keyword of techKeywords) {
    if (lowerText.includes(keyword)) {
      keywords.push(keyword)
    }
  }

  return keywords.slice(0, 5) // 최대 5개
}

// 🤖 AI로 카테고리 + 키워드 분석
async function analyzeWithAI(
  title: string,
  summary: string,
  apiKey: string,
  availableCategories: string[]
): Promise<{ category: string | null; keywords: string[] }> {
  if (!apiKey) {
    return { category: null, keywords: [] }
  }

  const prompt = `다음 IT 뉴스 기사를 분석해주세요:

제목: ${title}
요약: ${summary}

가능한 카테고리: ${availableCategories.join(', ')}

JSON 형식으로만 응답해주세요:
{
  "category": "가장 적합한 카테고리 1개 (위 목록 중에서만 선택, 없으면 null)",
  "keywords": ["핵심 키워드 3-5개 (한글)"]
}

규칙:
- category는 반드시 위 목록에 있는 것만 선택
- keywords는 기술 스택, 회사명, 핵심 개념 위주로
- 한글로 작성`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 500,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    })

    if (!response.ok) {
      throw new Error(`AI API failed: ${response.status}`)
    }

    const data = await response.json()
    const text = data.content[0].text

    // JSON 파싱 (백틱 제거)
    const jsonText = text.replace(/```json\n?|```\n?/g, '').trim()
    const result = JSON.parse(jsonText)

    return {
      category: result.category,
      keywords: result.keywords || [],
    }
  } catch (e) {
    console.error('AI analysis error:', e)
    return { category: null, keywords: [] }
  }
}
