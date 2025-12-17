'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight, Close } from '@/shared/ui/icon'
import CommunitySidebar from '@/widgets/community/ui/CommunitySidebar'
import { useOpen } from '@/shared/model'
import { ReactFlow, Background, BackgroundVariant } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useThemeStore } from '@/features/theme/model'
import { Plus } from 'lucide-react'

type Post = {
  posts_id: string
  title: string
  nodes: any[]
  edges: any[]
  users?: {
    name?: string | null
  }
  created_at?: string
}

const CommunityPage = () => {
  const { id } = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const listId = searchParams.get('list')
  const [resolvedListId, setResolvedListId] = useState<string | null>(null)
  const router = useRouter()
  const { isOpen, toggleOpen } = useOpen()

  const [posts, setPosts] = useState<Post[]>([])
  const [post, setPost] = useState<Post | null>(null)
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [loading, setLoading] = useState(true)
  const [isActionOpen, setIsActionOpen] = useState(false)

  const { theme } = useThemeStore()
  const isDark = theme === 'dark'

  const bgColor = isDark ? '#1f2937' : '#e5e5e5'
  const gridColor = isDark ? '#374151' : '#d1d5db'

  // 분야 기준으로 카드 목록 fetch
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true)

        const res = await fetch(
          resolvedListId
            ? `/api/community/posts?list=${resolvedListId}`
            : `/api/community/posts`
        )

        const json = await res.json()
        const list: Post[] = Array.isArray(json) ? json : []

        setPosts(list)

        const idx = list.findIndex((p) => p.posts_id === id)
        setCurrentIndex(idx)
        setPost(list[idx] ?? null)
      } catch (e) {
        console.error(e)
        setPost(null)
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [id, resolvedListId])

  useEffect(() => {
    if (!listId) {
      setResolvedListId(null)
      return
    }

    const resolveListId = async () => {
      try {
        const res = await fetch('/api/community/lists')
        const lists = await res.json()

        const matched = lists.find(
          (l: any) =>
            l.list_id === listId ||
            l.name.toLowerCase() === listId.toLowerCase()
        )

        setResolvedListId(matched?.list_id ?? null)
      } catch (e) {
        console.error(e)
        setResolvedListId(null)
      }
    }

    resolveListId()
  }, [listId])

  const goPrev = () => {
    if (currentIndex > 0) {
      router.push(
        `/community/${posts[currentIndex - 1].posts_id}?list=${resolvedListId}`
      )
    }
  }

  const goNext = () => {
    if (currentIndex < posts.length - 1) {
      router.push(
        `/community/${posts[currentIndex + 1].posts_id}?list=${resolvedListId}`
      )
    }
  }

  if (loading) {
    return <p className="py-40 text-center">불러오는 중...</p>
  }

  if (!post) {
    return <p className="py-40 text-center">글을 찾을 수 없습니다.</p>
  }

  return (
    <div className="flex">
      <div className="flex w-full justify-center px-40 py-40">
        <div className="bg-primary w-full max-w-1200 rounded-xl">
          {/* ===== 상단 헤더 ===== */}
          <div className="point-gradient flex items-center justify-between rounded-tl-xl rounded-tr-xl px-24 py-12">
            <div className="flex gap-8">
              <button
                onClick={goPrev}
                disabled={currentIndex <= 0}
                className={`rounded-lg px-12 py-6 ${
                  currentIndex <= 0
                    ? 'bg-secondary/40 cursor-not-allowed'
                    : 'bg-secondary'
                }`}
              >
                <ChevronLeft />
              </button>

              <button
                onClick={goNext}
                disabled={currentIndex >= posts.length - 1}
                className={`rounded-lg px-12 py-6 ${
                  currentIndex >= posts.length - 1
                    ? 'bg-secondary/40 cursor-not-allowed'
                    : 'bg-secondary'
                }`}
              >
                <ChevronRight />
              </button>
            </div>

            <button
              className="bg-secondary rounded-lg px-12 py-6"
              onClick={() => router.push('/community')}
            >
              <Close />
            </button>
          </div>

          {/* ===== 본문 ===== */}
          <div className="p-24">
            {/* 제목 + 메타 */}
            <div className="mb-20 flex items-center justify-between">
              <p className="text-lg font-semibold">{post.title}</p>
              <p className="text-foreground-light text-right text-sm">
                {post.users?.name ?? '익명'}
                <br />
                {post.created_at?.slice(0, 10)}
              </p>
            </div>

            {/* ===== 워크스페이스 ===== */}
            <div
              className="relative mb-24 h-420 w-full overflow-hidden rounded-xl"
              style={{ backgroundColor: bgColor }}
            >
              <ReactFlow
                nodes={post.nodes ?? []}
                edges={post.edges ?? []}
                fitView
                fitViewOptions={{ padding: 0.4 }}
                nodesDraggable={false}
                nodesConnectable={false}
                zoomOnScroll={false}
                zoomOnDoubleClick={false}
                panOnScroll={false}
                panOnDrag={false}
                proOptions={{ hideAttribution: true }}
                className="h-full w-full"
              >
                <Background
                  variant={BackgroundVariant.Lines}
                  color={gridColor}
                />
              </ReactFlow>

              {/* 우측 하단 버튼 */}
              <div className="absolute right-12 bottom-16 flex flex-col items-end gap-8">
                {/* 액션 버튼들 (토글) */}
                {isActionOpen && (
                  <div className="flex flex-col gap-8">
                    <button className="bg-accent rounded-lg px-16 py-8 text-sm text-white shadow-lg">
                      이미지로 저장하기
                    </button>
                    <button className="bg-accent rounded-lg px-16 py-8 text-sm text-white shadow-lg">
                      내 워크스페이스에 불러오기
                    </button>
                  </div>
                )}

                {/* + 버튼 */}
                <button
                  onClick={() => setIsActionOpen((prev) => !prev)}
                  className="bg-accent flex h-50 w-50 items-center justify-center rounded-full shadow-xl transition-transform hover:scale-105"
                >
                  <Plus size={24} className="text-white" />
                </button>
              </div>
            </div>

            {/* 댓글 */}
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
export default CommunityPage
