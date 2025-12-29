'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/shared/libs/axios'
import { useNormalizeKeyword } from './useNormalizeKeyword'

const useSearchSimilar = (keyword: string) => {
  // 1단계: 검색어 정규화 (React Query로 캐싱)
  const { data: normalizedKeyword, isLoading: isNormalizing } =
    useNormalizeKeyword(keyword)

  // 2단계: 정규화된 키워드로 검색
  const searchQuery = useQuery({
    queryKey: ['searchSimilar', normalizedKeyword],
    queryFn: async () => {
      if (!normalizedKeyword) return null

      const { data } = await api.get(
        `/ai/search?keyword=${encodeURIComponent(normalizedKeyword)}`
      )

      return data
    },
    enabled: !!normalizedKeyword && !isNormalizing,
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
    refetchOnWindowFocus: false,
  })

  return {
    ...searchQuery,
    isLoading: isNormalizing || searchQuery.isLoading,
  }
}

export default useSearchSimilar
