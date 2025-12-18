'use client'

import { useQuery } from '@tanstack/react-query'

export interface Community {
  list_id: string
  name: string
}

export function useCommunityList() {
  return useQuery<Community[], Error>({
    queryKey: ['communityList'],
    queryFn: async () => {
      const res = await fetch('/api/community/lists')
      if (!res.ok) throw new Error('Failed to fetch community list')
      return res.json()
    },
    // 불필요하게 여러번 부르는 것을 방지하기 위해 5분간 캐싱
    staleTime: 1000 * 60 * 5,
  })
}
