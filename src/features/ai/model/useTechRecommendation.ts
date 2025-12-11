// useTechRecommendation.ts

import { useState, useCallback } from 'react'

interface TechItem {
  name: string
  description: string
  icon_url: string | null
  // 필요한 다른 필드 추가 가능
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
  clearRecommendations: () => void // 추천 상태 초기화 함수
}

const useTechRecommendation = (): UseRecommendationReturn => {
  const [recommendationData, setRecommendationData] =
    useState<RecommendationResponse | null>(null)
  const [recommendationIsLoading, setRecommendationIsLoading] = useState(false)
  const [recommendationError, setRecommendationError] = useState<string | null>(
    null
  )

  const fetchRecommendations = useCallback(async (techName: string) => {
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
      setRecommendationData(result)
    } catch (err) {
      setRecommendationError(
        err instanceof Error ? err.message : '알 수 없는 추천 오류'
      )
      setRecommendationData(null)
    } finally {
      setRecommendationIsLoading(false)
    }
  }, [])

  const clearRecommendations = useCallback(() => {
    setRecommendationData(null)
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
