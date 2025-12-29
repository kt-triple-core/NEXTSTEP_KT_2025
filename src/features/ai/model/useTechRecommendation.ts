// useTechRecommendation.ts

import { useState, useCallback, useRef } from 'react'

interface TechItem {
  name: string
  description: string
  icon_url: string | null
  tech_id?: string
  usage_count?: number
  score?: number
  isNew?: boolean
}

interface RecommendationResponse {
  source: 'ai_recommendation'
  data: TechItem[]
}

interface UseRecommendationReturn {
  recommendationData: RecommendationResponse | null
  recommendationIsLoading: boolean
  recommendationError: string | null
  fetchRecommendations: (techName: string) => Promise<void>
  clearRecommendations: () => void
}

// 메모리 캐시: 같은 기술에 대한 추천 결과 저장
const recommendationCache = new Map<string, RecommendationResponse>()

const useTechRecommendation = (): UseRecommendationReturn => {
  const [recommendationData, setRecommendationData] =
    useState<RecommendationResponse | null>(null)
  const [recommendationIsLoading, setRecommendationIsLoading] = useState(false)
  const [recommendationError, setRecommendationError] = useState<string | null>(
    null
  )

  //  중복 호출 방지용 ref
  const currentRequestRef = useRef<string | null>(null)

  const fetchRecommendations = useCallback(async (techName: string) => {
    const cacheKey = techName.trim().toLowerCase()

    // 이미 같은 요청이 진행 중이면 무시
    if (currentRequestRef.current === cacheKey) {
      return
    }

    // 캐시에 있으면 바로 반환
    if (recommendationCache.has(cacheKey)) {
      setRecommendationData(recommendationCache.get(cacheKey)!)
      return
    }

    currentRequestRef.current = cacheKey
    setRecommendationIsLoading(true)
    setRecommendationError(null)

    try {
      const response = await fetch('/api/ai/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ techName }),
      })

      if (!response.ok) {
        throw new Error('기술 추천 API 호출 실패')
      }

      const result: RecommendationResponse = await response.json()

      // 캐시에 저장
      recommendationCache.set(cacheKey, result)
      setRecommendationData(result)

      // console.log('API 호출 완료 & 캐시 저장:', cacheKey)
    } catch (err) {
      setRecommendationError(
        err instanceof Error ? err.message : '알 수 없는 추천 오류'
      )
      setRecommendationData(null)
    } finally {
      setRecommendationIsLoading(false)
      currentRequestRef.current = null
    }
  }, [])

  const clearRecommendations = useCallback(() => {
    setRecommendationData(null)
    // 캐시는 유지 (다시 돌아왔을 때 빠르게 표시)
  }, [])

  return {
    recommendationData,
    recommendationIsLoading,
    recommendationError,
    fetchRecommendations,
    clearRecommendations,
  }
}

export default useTechRecommendation
