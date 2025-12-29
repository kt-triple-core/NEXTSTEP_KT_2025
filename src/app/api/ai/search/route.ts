// app/api/ai/search/route.ts

import { NextResponse } from 'next/server'
import { supabase } from '@/shared/libs/supabaseClient'
import axios from 'axios'

export const GET = async (req: Request) => {
  try {
    const { searchParams } = new URL(req.url)
    const keyword = searchParams.get('keyword')?.trim()

    console.log('🔍 검색 요청:', keyword)

    // keyword 없으면 early return
    if (!keyword) {
      return NextResponse.json({ source: 'none', data: [] })
    }

    // -------------------------------
    // 1) Supabase DB 검색
    // -------------------------------
    console.log('📊 DB 검색 시작...')

    const { data: dbData, error: dbError } = await supabase
      .from('techs')
      .select('*')
      .or(`name.ilike.%${keyword}%,description.ilike.%${keyword}%`)

    // 🔥 DB 에러 체크 추가
    if (dbError) {
      throw new Error(`DB 조회 실패: ${dbError.message}`)
    }

    // DB에서 데이터 찾은 경우
    if (dbData && dbData.length > 0) {
      // 점수 계산
      const scoredData = dbData.map((item) => {
        let score = 0

        const lowerKeyword = keyword.toLowerCase()
        const lowerName = item.name.toLowerCase()
        const lowerDesc = item.description?.toLowerCase() || ''

        if (lowerName === lowerKeyword) score += 100
        if (lowerName.startsWith(lowerKeyword)) score += 50
        if (lowerName.includes(lowerKeyword)) score += 30
        if (lowerDesc.includes(lowerKeyword)) score += 10
        score += (item.usage_count || 0) * 0.1

        return { ...item, score }
      })

      // 점수 높은 순으로 TOP 5 반환
      const topResults = scoredData
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)

      return NextResponse.json({
        source: 'db',
        data: topResults,
      })
    }

    // -------------------------------
    // 2) DB에 없으면 OpenAI 검색
    // -------------------------------
    // console.log('🤖 OpenAI 검색 시작...')

    const aiResponse = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: `사용자가 "${keyword}"를 입력했습니다.
이것이 기술 스택 이름이면 다음 형식의 JSON만 출력하세요:
{
  "name": "기술명",
  "description": "간단한 설명",
  "icon_url": "아이콘 URL 또는 null"
}

기술 스택이 아니면 빈 객체 {} 를 반환하세요.`,
          },
        ],
        temperature: 0,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    )

    const aiContent = aiResponse.data.choices[0].message.content.trim()

    // JSON 파싱 (마크다운 코드블록 제거)
    const cleanContent = aiContent.replace(/```json\n?|\n?```/g, '').trim()
    const aiData = JSON.parse(cleanContent)

    // 빈 객체면 결과 없음 처리
    if (Object.keys(aiData).length === 0) {
      return NextResponse.json({
        source: 'none',
        data: [],
        message: '검색 결과가 없습니다',
      })
    }

    return NextResponse.json({
      source: 'ai',
      data: [aiData],
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: '검색 중 오류 발생',
        message: error instanceof Error ? error.message : '알 수 없는 오류',
        data: [],
      },
      { status: 500 }
    )
  }
}
