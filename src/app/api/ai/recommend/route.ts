import { NextResponse } from 'next/server'
import axios from 'axios'
import { supabase } from '@/shared/libs/supabaseClient'

// 환경 변수 설정
const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_MODEL = 'gemini-2.5-flash'
const AXIOS_TIMEOUT = 10000 // 10초

interface TechItem {
  tech_id?: string
  name: string
  description: string
  icon_url: string | null
  isNew?: boolean
}

export const POST = async (req: Request) => {
  // API KEY 없으면 500 (실제 서버 설정 오류)
  if (!GEMINI_API_KEY) {
    console.error('⛔️ [CRITICAL ERROR] GEMINI_API_KEY가 설정되지 않았습니다.')
    return NextResponse.json(
      { error: 'Server configuration error: GEMINI_API_KEY is missing' },
      { status: 500 }
    )
  }

  try {
    const { techName } = await req.json()

    if (!techName) {
      return NextResponse.json(
        { error: 'techName is required' },
        { status: 400 }
      )
    }

    // console.log('💡 AI 추천 시작:', techName)

    // -------------------------------
    // 1. Gemini AI 호출: 추천 기술 이름 리스트만 요청
    // -------------------------------
    const aiPrompt = `"${techName}" 기술과 시너지가 가장 좋거나 함께 자주 사용되는 **실제로 존재하는** 기술 3가지의 이름을 JSON 배열 형식으로 나열해주세요.

중요한 규칙:
1. 반드시 **실제로 존재하고 널리 사용되는** 기술만 추천
2. 이름은 **번역되지 않은 영문 원본** 사용
3. 추상적이거나 일반적인 용어(예: "Related Technology", "Backend Framework") 사용 금지
4. 구체적인 기술명만 포함 (예: "Express.js", "PostgreSQL", "Docker")

스키마: ["Tech Name 1", "Tech Name 2", "Tech Name 3"]

예시:
- React와 함께 사용: ["Next.js", "TypeScript", "Tailwind CSS"]
- Node.js와 함께 사용: ["Express.js", "MongoDB", "Redis"]`

    let recommendedNames: string[] = []

    try {
      const aiResponse = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
        {
          contents: [{ role: 'user', parts: [{ text: aiPrompt }] }],
          generationConfig: { responseMimeType: 'application/json' },
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: AXIOS_TIMEOUT,
        }
      )

      const responseText =
        aiResponse.data.candidates?.[0]?.content?.parts?.[0]?.text || '[]'

      try {
        recommendedNames = JSON.parse(responseText)
        if (!Array.isArray(recommendedNames)) recommendedNames = []
      } catch (e) {
        console.error('⚠️ AI 응답 JSON 파싱 실패 (1단계):', responseText)
      }
    } catch (aiError: any) {
      // console.warn('⚠️ AI 추천 이름 요청 실패:', aiError.message)
      // AI 호출 실패해도 200으로 반환 (빈 결과)
      return NextResponse.json({
        source: 'ai_recommendation',
        data: [],
        message: '추천 결과를 가져올 수 없습니다.',
      })
    }

    // 추천 결과가 없으면 빈 배열 반환 (200 OK)
    if (recommendedNames.length === 0) {
      // console.log('ℹ️ AI 추천 결과 없음')
      return NextResponse.json({
        source: 'ai_recommendation',
        data: [],
        message: '추천 결과가 없습니다.',
      })
    }

    // console.log('✅ AI 추천 이름:', recommendedNames)

    // -------------------------------
    // 2. Supabase DB 조회 및 맵 생성
    // -------------------------------
    const dbQuery = recommendedNames.map((name) => `name.eq.${name}`).join(',')

    const { data: dbData, error: dbError } = await supabase
      .from('techs')
      .select('tech_id, name, description, icon_url')
      .or(dbQuery)
      .limit(recommendedNames.length)

    // DB 조회 실패 시 (실제 DB 오류만 500으로)
    if (dbError) {
      console.error('❌ DB 조회 실패:', dbError)
      return NextResponse.json(
        {
          error: 'DB 조회 실패',
          message: dbError.message,
        },
        { status: 500 }
      )
    }

    const dbMap = new Map(
      dbData?.map((item) => [item.name.toLowerCase(), item])
    )

    // console.log('📊 DB에서 찾은 기술:', dbData?.length || 0, '개')

    // -------------------------------
    // 3. 최종 데이터 구성 및 AI 상세 정보 요청 (병렬 처리)
    // -------------------------------
    const detailRequests = recommendedNames.map(async (name) => {
      const lowerName = name.toLowerCase()
      const dbItem = dbMap.get(lowerName)

      if (dbItem) {
        // A. DB에 있는 경우: DB 데이터를 사용
        return { ...dbItem, isNew: false } as TechItem
      } else {
        // B. DB에 없는 경우: AI에게 상세 정보 요청
        const detailPrompt = `"${name}"이 실제로 존재하는 기술 스택인지 확인하고, 존재한다면 다음 JSON 형식으로 반환해주세요:

{
  "exists": true,
  "name": "기술명 (영문 원본)",
  "description": "간단한 설명 (한국어, 2줄 이내)",
  "icon_url": "로고 URL 또는 null"
}

만약 "${name}"이 실제로 존재하지 않거나 일반적으로 알려진 기술 스택이 아니라면:

{
  "exists": false
}

규칙:
1. 'name' 필드는 "${name}" 그대로 **영문 원본**을 사용
2. 'description'은 **한국어 문장**으로 작성하되, 기술명은 영문 그대로 사용
3. 'icon_url'은 실제 로고의 직접 링크(URL)만 사용, 없으면 null
4. 존재 여부가 확실하지 않으면 exists: false를 반환`

        try {
          const detailResponse = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
            {
              contents: [{ role: 'user', parts: [{ text: detailPrompt }] }],
              generationConfig: { responseMimeType: 'application/json' },
            },
            {
              headers: { 'Content-Type': 'application/json' },
              timeout: AXIOS_TIMEOUT,
            }
          )

          const aiDetailText =
            detailResponse.data.candidates?.[0]?.content?.parts?.[0]?.text ||
            '{}'
          const aiDetail = JSON.parse(aiDetailText)

          // exists가 false이거나 없으면 null 반환
          if (!aiDetail.exists || !aiDetail.name) {
            // console.log(`ℹ️ ${name}은(는) 유효한 기술이 아님`)
            return null
          }

          return {
            name: aiDetail.name,
            description: aiDetail.description || 'AI가 생성한 설명입니다.',
            icon_url: aiDetail.icon_url || null,
            isNew: true,
          } as TechItem
        } catch (e: any) {
          // console.warn(`⚠️ [WARN] ${name} 상세 정보 요청 실패:`, e.message)
          return null
        }
      }
      return null
    })

    // 모든 요청을 병렬로 실행하고 결과만 필터링
    const results = await Promise.all(detailRequests)
    const finalData = results.filter((item) => item !== null) as TechItem[]

    // console.log('✅ 최종 추천 결과:', finalData.length, '개')

    return NextResponse.json({
      source: 'ai_recommendation',
      data: finalData,
    })
  } catch (error: any) {
    // 예상치 못한 전체 오류만 500으로 처리
    const errorMessage =
      error.response?.data?.error?.message || error.message || '알 수 없는 오류'
    // console.error('❌ [CRITICAL] 추천 검색 중 최종 오류 발생:', errorMessage)

    return NextResponse.json(
      // { error: `서버 오류가 발생했습니다: ${errorMessage}` },
      { status: 500 }
    )
  }
}
