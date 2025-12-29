'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

interface Article {
  article_id: string
  source: string
  title: string
  published_at: string
}

const CommunityNewsList = () => {
  const searchParams = useSearchParams()
  const listId = searchParams.get('list')
  const router = useRouter()

  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!listId) return

    const fetchArticles = async () => {
      setLoading(true)
      const res = await fetch(`/api/community/news?list=${listId}`)
      const data = await res.json()
      setArticles(data)
      setLoading(false)
    }

    fetchArticles()
  }, [listId])

  if (loading) {
    return <p className="text-foreground-light">Loading...</p>
  }

  if (!articles.length) {
    return <p className="text-foreground-light">No articles found.</p>
  }

  return (
    <div className="scrollbar-hide flex h-full flex-col overflow-y-auto">
      <div className="flex flex-col divide-y divide-gray-200">
        {articles.map((article) => (
          <button
            key={article.article_id}
            onClick={() => router.push(`/community/news/${article.article_id}`)}
            className="flex w-full cursor-pointer items-center justify-between gap-20 py-14 text-left transition hover:bg-gray-50"
          >
            <div className="text-12 w-80">
              <p className="bg-primary rounded-md py-5 text-center">
                {article.source}
              </p>
            </div>
            {/* 제목 */}
            <p className="text-14 text-foreground flex-1 truncate font-medium">
              {article.title}
            </p>

            {/* 오른쪽 정보 */}
            <div className="text-12 text-foreground-light flex shrink-0 items-center gap-16">
              <span>{new Date(article.published_at).toLocaleDateString()}</span>
              {/* <span>💬 0</span> */}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default CommunityNewsList
