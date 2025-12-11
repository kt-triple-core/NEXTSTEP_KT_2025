'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/shared/libs/axios'

// ⭐ keyword 기반 기술 검색 훅
// - keyword 변화 시 자동 검색
// - API: /ai/search

//  * - 역할: 입력된 keyword로 유사 기술 검색을 수행하고 결과를 캐싱/관리한다.
//  * - 입력: keyword: string
//  * - 출력: React Query 객체 (data, isLoading, isError, refetch 등)

const useSearchSimilar = (keyword: string) => {
  return useQuery({
    // 리액트 쿼리 사용 -> 해당 쿼리를 식별하고 캐싱 / 재사용 / 갱신 규칙을 적용하는 고유 키
    // 쿼리키가 같으면 리액트 쿼리는 결과를 재사용하고 키가 바뀌면 새로운 네트워크 요청을 보낸다 (중복 요청 방지)
    // queryKey: ['searchSimilar', keyword], // 캐싱/리턴키
    queryKey: ['searchSimilar', keyword.trim().toLowerCase()], // 이렇게 수정하는 것이 더 낫다 -> React/react 입력해도 같은 캐시를 사용한다
    queryFn: async () => {
      // keyword 없으면 null 반환
      if (!keyword || keyword.trim() === '') return null

      // 서버 API 호출 -> /ai/search?keyword=...
      const { data } = await api.get(
        `/ai/search?keyword=${encodeURIComponent(keyword)}`
      )

      return data
    },

    enabled: !!keyword, // keyword 있을 때만 실행
    staleTime: 60 * 1000, // 1분 캐싱
    refetchOnWindowFocus: false, // 포커스시 재요청 방지
  })
}

export default useSearchSimilar
