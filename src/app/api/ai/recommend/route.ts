import { NextResponse } from 'next/server'
import axios from 'axios'
import { supabase } from '@/shared/libs/supabaseClient' // Supabase 클라이언트 경로 확인

// 환경 변수 설정
const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_MODEL = 'gemini-2.5-flash'
// AI 상세 정보 요청 타임아웃 (초과 시 503/Timeout 오류 방지)
const AXIOS_TIMEOUT = 10000 // 10초

interface TechItem {
  tech_id?: string
  name: string
  description: string
  icon_url: string | null
  isNew?: boolean
}

export const POST = async (req: Request) => {
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
    } // -------------------------------
    // 1. Gemini AI 호출: 추천 기술 이름 리스트만 요청 (영문 원본 요청으로 수정 )
    // -------------------------------

    const aiPrompt = `"${techName}" 기술과 시너지가 가장 좋거나 함께 자주 사용되는 기술 3가지의 이름을 JSON 배열 형식으로 나열해주세요. 이름은 **번역되지 않은 영문 원본**을 사용해야 하며, 어떤 추가 설명도 없이 이름만 포함해야 합니다.

    스키마: ["Tech Name 1", "Tech Name 2", "Tech Name 3"]`

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
    let recommendedNames: string[] = []
    try {
      recommendedNames = JSON.parse(responseText)
      if (!Array.isArray(recommendedNames)) recommendedNames = []
    } catch (e) {
      console.error('AI 응답 JSON 파싱 실패 (1단계):', responseText)
      return NextResponse.json({ source: 'ai_recommendation', data: [] })
    }

    if (recommendedNames.length === 0) {
      return NextResponse.json({ source: 'ai_recommendation', data: [] })
    } // -------------------------------
    // 2. Supabase DB 조회 및 맵 생성
    // -------------------------------
    // AI가 반환한 영문 이름으로 DB 조회 시도

    const dbQuery = recommendedNames.map((name) => `name.eq.${name}`).join(',')

    const { data: dbData } = await supabase
      .from('techs')
      .select('tech_id, name, description, icon_url')
      .or(dbQuery)
      .limit(recommendedNames.length)

    const dbMap = new Map(
      dbData?.map((item) => [item.name.toLowerCase(), item])
    ) // -------------------------------
    // 3. 최종 데이터 구성 및 AI 상세 정보 요청 (병렬 처리)
    // -------------------------------

    const detailRequests = recommendedNames.map(async (name) => {
      const lowerName = name.toLowerCase()
      const dbItem = dbMap.get(lowerName)

      if (dbItem) {
        // A. DB에 있는 경우: DB 데이터를 사용
        return { ...dbItem, isNew: false } as TechItem
      } else {
        // B. DB에 없는 경우: AI에게 상세 정보 요청 ( 올바른 detailPrompt 사용 )

        const detailPrompt = `"${name}" 기술에 대해 name, description, icon_url을 포함하는 JSON 객체를 반환해주세요.
    
        규칙:
        1. 'name' 필드는 "${name}" 그대로 **영문 원본**을 사용해야 합니다. 절대 번역하지 마세요.
        2. 'description' 필드는 **한국어 문장**으로 작성하되, 기술명 등의 핵심 고유 명사(예: 'React', 'Next.js', 'Vercel')는 **영문 그대로** 사용하여 영한 혼합 스타일을 유지해주세요. 설명은 2줄 이내로 간결하게 요약해야 합니다.
        3. 'icon_url'은 로고의 직접 링크(URL)이어야 합니다. 없는 경우 null을 사용하세요.`

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

          if (aiDetail.name) {
            return {
              name: aiDetail.name,
              description: aiDetail.description || 'AI가 생성한 설명입니다.',
              icon_url: aiDetail.icon_url || null,
              isNew: true,
            } as TechItem
          }
        } catch (e: any) {
          console.warn(
            `[WARN] ${name} 상세 정보 요청 실패 (Timeout 또는 503):`,
            e.message
          )
          return null
        }
      }
      return null
    }) // 모든 요청을 병렬로 실행하고 결과만 필터링합니다.

    const results = await Promise.all(detailRequests)
    const finalData = results.filter((item) => item !== null) as TechItem[]

    return NextResponse.json({
      source: 'ai_recommendation',
      data: finalData,
    })
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.error?.message || error.message || '알 수 없는 오류'
    console.error(' [CRITICAL] 추천 검색 중 최종 오류 발생:', errorMessage)

    return NextResponse.json(
      { error: `API 통신 오류: ${errorMessage}` },
      { status: 500 }
    )
  }
}
