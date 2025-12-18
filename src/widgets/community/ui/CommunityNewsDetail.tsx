'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  ChevronLeft,
  ChevronRight,
  Close,
  ExternalLink,
} from '@/shared/ui/icon'
import CommunitySidebar from './CommunitySidebar'
import CommentSection from '@/features/community/ui/CommentSection'

interface Article {
  article_id: string
  title: string
  summary: string
  source: string
  published_at: string
  link: string
  list: string
}

interface Props {
  articleId: string
  isOpen: boolean
  toggleOpen: () => void
}

const CommunityNewsDetail = ({ articleId, isOpen, toggleOpen }: Props) => {
  const [article, setArticle] = useState<Article | null>(null)
  const [listArticles, setListArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchArticleAndList = async () => {
      try {
        setLoading(true)

        // 현재 글 가져오기
        const res = await fetch(`/api/community/news/${articleId}`)
        if (!res.ok) throw new Error('Failed to fetch article')
        const data: Article = await res.json()
        setArticle(data)

        // 같은 리스트 내 글 가져오기
        const listRes = await fetch(`/api/community/news?list=${data.list}`)
        if (listRes.ok) {
          const listData = await listRes.json()
          setListArticles(Array.isArray(listData) ? listData : [])
        }
      } catch (err) {
        console.error(err)
        toast.error('게시글을 불러오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchArticleAndList()
  }, [articleId])

  // 링크 복사
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast.success('현재 페이지 링크가 복사되었습니다!')
    } catch {
      toast.error('링크 복사에 실패했습니다.')
    }
  }

  if (loading) return <p className="text-foreground-light p-40">Loading...</p>
  if (!article) return <p className="p-40 text-red-500">Article not found</p>

  // 현재 글 위치 계산
  const currentIndex = Array.isArray(listArticles)
    ? listArticles.findIndex((a) => a.article_id === article.article_id)
    : -1

  const prevId =
    currentIndex > 0 ? listArticles[currentIndex - 1].article_id : null
  const nextId =
    currentIndex >= 0 && currentIndex < listArticles.length - 1
      ? listArticles[currentIndex + 1].article_id
      : null

  return (
    <div className="flex h-[calc(100vh-80px)] overflow-hidden">
      {/* 메인 콘텐츠 영역 */}
      <div className="flex-1 overflow-y-auto px-40 py-40">
        <div className="bg-primary mx-auto w-full max-w-1200 rounded-xl">
          {/* 헤더 */}
          <div className="point-gradient flex items-center justify-between rounded-tl-xl rounded-tr-xl px-24 py-12">
            <div className="flex gap-8">
              {/* 이전 글 */}
              <button
                disabled={!prevId}
                onClick={() =>
                  prevId && router.push(`/community/news/${prevId}`)
                }
                className={`bg-secondary text-foreground hover:bg-secondary/70 cursor-pointer rounded-lg px-12 py-6 shadow-sm transition-colors ${
                  !prevId ? 'cursor-not-allowed opacity-50' : ''
                }`}
              >
                <ChevronLeft />
              </button>

              {/* 다음 글 */}
              <button
                disabled={!nextId}
                onClick={() =>
                  nextId && router.push(`/community/news/${nextId}`)
                }
                className={`bg-secondary text-foreground hover:bg-secondary/70 cursor-pointer rounded-lg px-12 py-6 shadow-sm transition-colors ${
                  !nextId ? 'cursor-not-allowed opacity-50' : ''
                }`}
              >
                <ChevronRight />
              </button>
            </div>

            <div className="flex gap-8">
              {/* 링크 복사 */}
              <button
                onClick={handleCopyLink}
                className="bg-secondary text-foreground hover:bg-secondary/70 cursor-pointer rounded-lg px-12 py-6 shadow-sm transition-colors"
              >
                <ExternalLink />
              </button>

              {/* 닫기 */}
              <button
                onClick={() =>
                  router.push(`/community?list=${article.list}&tab=news`)
                }
                className="bg-secondary text-foreground hover:bg-secondary/70 cursor-pointer rounded-lg px-12 py-6 shadow-sm transition-colors"
              >
                <Close />
              </button>
            </div>
          </div>

          {/* 본문 */}
          <div className="p-24 pb-60">
            <div className="rounded-x0 mb-20 flex items-center gap-10 px-20 py-10">
              <div className="flex w-full items-center justify-between">
                <p className="text-lg font-semibold">{article.title}</p>
                <div className="text-foreground-light flex flex-col justify-end text-right text-sm">
                  <p>
                    {article.source}
                    <br />
                    {new Date(article.published_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="relative mb-24">
              <div className="bg-secondary w-full rounded-xl p-24">
                <p className="text-foreground text-sm leading-relaxed whitespace-pre-wrap">
                  {article.summary}
                </p>
              </div>
            </div>

            {/* 댓글 */}
            <CommentSection articleId={articleId} />
          </div>
        </div>
      </div>

      {/* 사이드바 */}
      <CommunitySidebar isOpen={isOpen} toggleOpen={toggleOpen} />
    </div>
  )
}

export default CommunityNewsDetail
