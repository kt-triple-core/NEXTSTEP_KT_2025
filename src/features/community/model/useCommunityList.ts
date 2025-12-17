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
    staleTime: 1000 * 60 * 5,
  })
}
