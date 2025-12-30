'use client'

import { useEffect, useState } from 'react'

type BoardStat = {
  board: string
  posts: number
  comments: number
  likes: number
  updatedAt: string
}

export default function BoardStats() {
  const [data, setData] = useState<BoardStat[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/board-stats')
      .then((res) => res.json())
      .then((json) => setData(json))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="text-14 text-foreground-light">
        게시판 데이터 불러오는 중…
      </div>
    )
  }

  return (
    <div>
      <h3 className="text-16 text-foreground mb-12 font-semibold">
        게시판별 데이터
      </h3>

      <div className="custom-scroll border-border overflow-auto rounded-2xl border">
        <div className="bg-background-light text-12 text-foreground-light grid grid-cols-5 px-16 py-10 font-semibold">
          <div>게시판</div>
          <div>게시글</div>
          <div>댓글</div>
          <div>좋아요</div>
          <div>업데이트</div>
        </div>

        {data.map((row) => (
          <div
            key={row.board}
            className="border-border text-14 text-foreground grid grid-cols-5 border-t px-16 py-12"
          >
            <div>{row.board}</div>
            <div>{row.posts}</div>
            <div>{row.comments}</div>
            <div>{row.likes}</div>
            <div className="text-foreground-light">
              {row.updatedAt.slice(0, 10)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
