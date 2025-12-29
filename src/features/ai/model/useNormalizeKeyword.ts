import { useQuery } from '@tanstack/react-query'

export const useNormalizeKeyword = (keyword: string) => {
  return useQuery({
    queryKey: ['normalizeKeyword', keyword.trim().toLowerCase()],
    queryFn: async () => {
      if (!keyword.trim()) return keyword

      const response = await fetch('/api/ai/normalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: keyword.trim() }),
      })

      if (!response.ok) {
        return keyword.toLowerCase()
      }

      const { normalizedKeyword } = await response.json()
      return normalizedKeyword || keyword.toLowerCase()
    },
    enabled: !!keyword,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  })
}
