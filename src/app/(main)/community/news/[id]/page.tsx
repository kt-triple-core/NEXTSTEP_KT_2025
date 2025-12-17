'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { ChevronLeft, ChevronRight, Close } from '@/shared/ui/icon'
import ExternalLink from '@/shared/ui/icon/ExternalLink'
import CommunitySidebar from '@/widgets/community/ui/CommunitySidebar'
import { useOpen } from '@/shared/model'

interface Article {
  title: string
  summary: string
  source: string
  published_at: string
  link: string
}

export default function CommunityNewsDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const { isOpen, toggleOpen } = useOpen()

  useEffect(() => {
    if (!id) return

    const fetchArticle = async () => {
      const res = await fetch(`/api/community/news/${id}`)
      const data = await res.json()
      setArticle(data)
      setLoading(false)
    }

    fetchArticle()
  }, [id])

  if (loading) {
    return <p className="text-foreground-light p-40">Loading...</p>
  }

  if (!article) {
    return <p className="p-40 text-red-500">Article not found</p>
  }

  return (
    <div className="flex">
      <div className="flex w-full justify-center px-40 py-40">
        <div className="bg-primary w-full max-w-1200 rounded-xl">
          <div className="point-gradient flex items-center justify-between rounded-tl-xl rounded-tr-xl px-24 py-12">
            <div className="flex gap-8">
              <button className="bg-secondary text-foreground hover:bg-secondary/70 rounded-lg px-12 py-6 shadow-sm transition-colors">
                <ChevronLeft />
              </button>
              <button className="bg-secondary text-foreground hover:bg-secondary/70 rounded-lg px-12 py-6 shadow-sm transition-colors">
                <ChevronRight />
              </button>
            </div>
            <div className="flex gap-8">
              <button className="bg-secondary text-foreground hover:bg-secondary/70 rounded-lg px-12 py-6 shadow-sm transition-colors">
                <ExternalLink />
              </button>
              <button className="bg-secondary text-foreground hover:bg-secondary/70 rounded-lg px-12 py-6 shadow-sm transition-colors">
                <Close />
              </button>
            </div>
          </div>
          <div className="p-24">
            <div className="rounded-x0 mb-20 flex items-center gap-10 px-20 py-10">
              <div className="flex w-full items-center justify-between">
                <p className="text-lg font-semibold">{article.title}</p>
                <div className="text-foreground-light flex flex-col justify-end text-sm">
                  <p className="text-right">
                    {article.source}
                    <br />
                    {new Date(article.published_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="relative mb-24">
              <div className="bg-secondary min-h-420 w-full rounded-xl p-24 pb-60">
                <p className="text-foreground text-sm leading-relaxed whitespace-pre-wrap">
                  {article.summary}
                </p>
              </div>
              <div className="absolute right-24 bottom-16 flex flex-col gap-8">
                <a
                  href={article.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-accent hover:bg-accent/90 rounded-lg px-16 py-8 text-sm text-white shadow transition-colors"
                >
                  원문 보러가기
                </a>
              </div>
            </div>

            <div className="flex flex-col gap-12">
              <p className="font-semibold">댓글 (0)</p>
              <p className="text-foreground-light text-sm">
                아직 댓글이 없습니다.
              </p>
            </div>
          </div>
        </div>
      </div>
      <CommunitySidebar isOpen={isOpen} toggleOpen={toggleOpen} />
    </div>
  )
}
