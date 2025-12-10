// src/app/api/search/route.ts
import { NextResponse } from 'next/server'
import { supabase } from '@/shared/libs/supabaseClient'
import axios from 'axios'

export const GET = async (req: Request) => {
  try {
    const { searchParams } = new URL(req.url)
    const keyword = searchParams.get('keyword')?.trim()

    if (!keyword) {
      return NextResponse.json({ source: 'none', data: [] })
    }

    // 1) DB 검색 — limit 제거!!!
    const { data: dbData, error } = await supabase
      .from('techs')
      .select('*')
      .or(`name.ilike.%${keyword}%,description.ilike.%${keyword}%`)
    // ❌ .limit(5) 절대 금지
    // 전체 가져와야 점수 계산이 가능함

    if (error) {
      return NextResponse.json(
        { error: 'DB 조회 실패', data: [] },
        { status: 500 }
      )
    }

    if (dbData && dbData.length > 0) {
      // 2) 점수 계산
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

      // 3) 점수 높은 순으로 정렬 후 top 5만 추출
      const topResults = scoredData
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)

      return NextResponse.json({
        source: 'db',
        data: topResults,
      })
    }

    // 4) DB에 없으면 AI로 검색
    const aiResponse = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: `
              사용자가 "${keyword}"를 입력했습니다.
              기술이면 name/description/img JSON으로 출력.
            `,
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

    const aiData = JSON.parse(aiResponse.data.choices[0].message.content)

    return NextResponse.json({ source: 'ai', data: [aiData] })
  } catch (error) {
    return NextResponse.json(
      { error: '검색 중 오류 발생', data: [] },
      { status: 500 }
    )
  }
}
