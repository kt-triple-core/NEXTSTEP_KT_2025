'use client'

import { useCallback, useEffect, useState } from 'react'

type PointOnlyResponse = {
  point?: number
}

export function useMyPoint() {
  const [point, setPoint] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  const refetchPoint = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/users/quests', { method: 'GET' })
      if (!res.ok) {
        setPoint(0)
        return
      }

      const data = (await res.json()) as PointOnlyResponse
      setPoint(data.point ?? 0)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refetchPoint()
  }, [refetchPoint])

  return { point, setPoint, loading, refetchPoint }
}
