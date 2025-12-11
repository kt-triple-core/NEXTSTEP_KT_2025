import { NextResponse } from 'next/server'
import { supabase } from '@/shared/libs/supabaseClient'
import axios from 'axios'

export const GET = async (req: Request) => {
  try {
    const { searchParams } = new URL(req.url)
    const keyword = searchParams.get('keyword')?.trim()

    // keyword 없으면 early return
    if (!keyword) {
      return NextResponse.json({ source: 'none', data: [] })
    }

    // -------------------------------
    // 1) Supabase DB 검색
    // -------------------------------
    const { data: dbData } = await supabase
      .from('techs')
      .select('*')
      .or(`name.ilike.%${keyword}%,description.ilike.%${keyword}%`)
    // ilike는 대소문자 구분 없는 부분 일치 검색

    // DB에서 데이터 찾은 경우
    if (dbData && dbData.length > 0) {
      // 점수 계산
      const scoredData = dbData.map((item) => {
        let score = 0

        const lowerKeyword = keyword.toLowerCase()
        const lowerName = item.name.toLowerCase()
        const lowerDesc = item.description?.toLowerCase() || ''

        if (lowerName === lowerKeyword) score += 100 // 완전 일치 -> 사용자가 특정 기술 명을 정확하게 입력한 경우
        if (lowerName.startsWith(lowerKeyword)) score += 50 // 핵심기술/패키지의 변형이나 파생 기술(접두사 일치)
        if (lowerName.includes(lowerKeyword)) score += 30 // 이름 어딘가에 포함되는 경우
        if (lowerDesc.includes(lowerKeyword)) score += 10 // 설명에 포함되는 경우

        score += (item.usage_count || 0) * 0.1 // 사용자 인기도 가중치

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
    const aiResponse = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: `사용자가 "${keyword}"를 입력했습니다.
              기술이면 name/description/img JSON으로 출력.`,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    )

    // GPT 응답 JSON 파싱
    const aiData = JSON.parse(aiResponse.data.choices[0].message.content)

    return NextResponse.json({
      source: 'ai',
      data: [aiData],
    })
  } catch (error) {
    return NextResponse.json(
      { error: '검색 중 오류 발생', data: [] },
      { status: 500 }
    )
  }
}
