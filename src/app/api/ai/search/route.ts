// src/app/api/search/route.ts
import { NextResponse } from 'next/server'
import { supabase } from '@/shared/libs/supabaseClient'

export const GET = async (req: Request) => {
  try {
    const { searchParams } = new URL(req.url)
    const keyword = searchParams.get('keyword') || ''

    // console.log('🔍 검색 키워드:', keyword)

    if (!keyword) {
      return NextResponse.json({ data: [] })
    }

    // DB 검색만 사용 (AI 비활성화)
    const { data: dbData, error: dbError } = await supabase
      .from('techs')
      .select('*')
      .or(`name.ilike.%${keyword}%,description.ilike.%${keyword}%`)
      .limit(20)

    // console.log('📊 DB 결과:', dbData?.length, '개')

    if (dbError) {
      // console.error('Supabase Error:', dbError)
      return NextResponse.json(
        {
          error: 'DB 조회 실패',
          data: [],
        },
        { status: 500 }
      )
    }

    if (!dbData || dbData.length === 0) {
      return NextResponse.json({
        source: 'db',
        message: '검색 결과가 없습니다. 다른 키워드로 시도해보세요.',
        data: [],
      })
    }

    // 유사도 점수 계산
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

    const topResults = scoredData.sort((a, b) => b.score - a.score).slice(0, 5)

    // console.log(
    //   '✅ 정렬된 결과:',
    //   topResults.map((r) => r.name)
    // )

    return NextResponse.json({
      source: 'db',
      data: topResults,
    })
  } catch (error) {
    // console.error('❌ API 에러:', error)
    return NextResponse.json(
      {
        error: '검색 중 오류가 발생했습니다',
        details: error instanceof Error ? error.message : '알 수 없는 오류',
        data: [],
      },
      { status: 500 }
    )
  }
}
