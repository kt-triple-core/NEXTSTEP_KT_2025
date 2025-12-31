// widgets/community/ui/CommunityDetail.tsx

'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight, Close } from '@/shared/ui/icon'
import CommunitySidebar from '@/widgets/community/ui/CommunitySidebar'
import { ReactFlow, Background, BackgroundVariant } from '@xyflow/react'
import type { ReactFlowInstance } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useThemeStore } from '@/features/theme/model'
import { Plus } from 'lucide-react'
import CommunityCommentSection from '@/widgets/community/comments/CommunityCommentSection'
import { exportWorkspaceAsImage } from '@/features/community/model/exportWorkspaceAsImage'
import { PostWithRoadmap } from '@/features/community/model/types'
import CustomNode from '@/widgets/workspace/ui/CustomNode'

interface CommunityDetailProps {
  postId: string
  isOpen: boolean
  toggleOpen: () => void
}

export default function CommunityDetail({
  postId,
  isOpen,
  toggleOpen,
}: CommunityDetailProps) {
  const searchParams = useSearchParams()
  const listId = searchParams.get('list')
  const [resolvedListId, setResolvedListId] = useState<string | null>(null)
  const router = useRouter()

  const [posts, setPosts] = useState<PostWithRoadmap[]>([])
  const [post, setPost] = useState<PostWithRoadmap | null>(null)
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [loading, setLoading] = useState(true)
  const [isActionOpen, setIsActionOpen] = useState(false)
  const [isCapturing, setIsCapturing] = useState(false)

  const { theme } = useThemeStore()
  const isDark = theme === 'dark'
  const bgColor = isDark ? '#1f2937' : '#e5e5e5'

  const workspaceRef = useRef<HTMLDivElement>(null)
  const [rf, setRf] = useState<ReactFlowInstance | null>(null)

  // 좋아요 UI용 state
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)

  useEffect(() => {
    if (!post) return
    setLikeCount(post.like_count ?? 0)
  }, [post])

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
        const list: PostWithRoadmap[] = Array.isArray(json) ? json : []

        setPosts(list)

        const idx = list.findIndex((p) => p.post_id === postId)
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
  }, [postId, resolvedListId])

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
      const prevPost = posts[currentIndex - 1]
      router.push(`/community/${prevPost.post_id}?list=${resolvedListId}`)
    }
  }

  const goNext = () => {
    if (currentIndex < posts.length - 1) {
      const nextPost = posts[currentIndex + 1]
      router.push(`/community/${nextPost.post_id}?list=${resolvedListId}`)
    }
  }

  const toggleLike = async () => {
    if (!post) return

    const res = await fetch('/api/community/posts/like', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId: post.post_id }),
    })

    const json = await res.json()

    setLiked(json.liked)
    setLikeCount((prev) => (json.liked ? prev + 1 : prev - 1))
  }

  const handleExportImage = async () => {
    if (!workspaceRef.current || !rf || !post) return

    setIsCapturing(true)
    await new Promise((r) => setTimeout(r, 50))

    await exportWorkspaceAsImage({
      container: workspaceRef.current,
      rf,
      fileName: post.title,
      backgroundColor: bgColor,
    })

    setIsCapturing(false)
  }

  // 닫기 버튼 핸들러 (뉴스와 동일한 로직)
  const handleClose = () => {
    if (resolvedListId) {
      router.push(`/community?list=${resolvedListId}&tab=post`)
    } else {
      router.push('/community?tab=post')
    }
  }

  const nodeTypes = {
    custom: CustomNode,
  }

  console.log(post, '포스트내용')

  if (loading) return <p className="py-40 text-center">불러오는 중...</p>
  if (!post) return <p className="py-40 text-center">글을 찾을 수 없습니다.</p>

  return (
    <div className="flex">
      <div className="flex w-full justify-center px-40 py-40">
        <div className="bg-primary w-full max-w-1200 rounded-xl">
          <div className="point-gradient flex items-center justify-between rounded-tl-xl rounded-tr-xl px-24 py-12">
            {/* 좌측 이전 / 다음 */}
            <div className="flex gap-8">
              <button
                onClick={goPrev}
                disabled={currentIndex <= 0}
                className={`rounded-lg px-12 py-6 ${
                  currentIndex <= 0
                    ? 'bg-secondary/40 cursor-not-allowed'
                    : 'bg-secondary hover:bg-secondary/70 transition-colors'
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
                    : 'bg-secondary hover:bg-secondary/70 transition-colors'
                }`}
              >
                <ChevronRight />
              </button>
            </div>

            {/* 우측 좋아요 + 닫기 */}
            <div className="flex items-center gap-8">
              {/* 좋아요 버튼 */}
              <button
                onClick={toggleLike}
                className={`flex items-center gap-6 rounded-lg px-12 py-4 transition ${
                  liked
                    ? 'bg-red-500 text-white'
                    : 'bg-secondary text-foreground hover:bg-secondary/70'
                }`}
              >
                <span className="text-m">{liked ? '❤️' : '🤍'}</span>
                <span className="text-sm font-semibold">{likeCount}</span>
              </button>

              {/* 닫기 버튼 */}
              <button
                className="bg-secondary text-foreground hover:bg-secondary/70 cursor-pointer rounded-lg px-12 py-6 shadow-sm transition-colors"
                onClick={handleClose}
              >
                <Close />
              </button>
            </div>
          </div>

          <div className="relative p-24">
            <div className="relative mb-20 flex items-center justify-between">
              <div className="flex items-center gap-10 text-sm">
                <div className="flex h-40 w-40 items-center justify-center overflow-hidden rounded-full">
                  <img
                    className="h-full w-full object-cover"
                    src={post.users?.avatar}
                    alt="profile"
                  />
                </div>
                <p>{post.users?.name ?? '익명'}</p>
                <p className="text-foreground-light text-xs">
                  {post.users?.experiences
                    ?.map((exp) => `${exp.field} ${exp.year}년차`)
                    .join(', ')}
                </p>
              </div>

              <p className="absolute inset-x-0 text-center text-lg font-semibold">
                {post.title}
              </p>

              <p className="text-foreground-light text-sm">
                {' '}
                {post.created_at?.slice(0, 10)}
              </p>
            </div>

            <style>
              {`
               .react-flow__node {
                 padding: 0;
                 display: flex;
                 justify-content: center;
                 align-items: center;
               }
               
               .react-flow__handle {
                 width: 4px;
                 height: 4px;
                 min-width: 4px;
                 min-height: 4px;
                 background-color: #000;
                 border: none;
               }
               .dark .react-flow__handle {
                 background-color: #fff;
                 border: none;
               }
               .react-flow__handle-top {
                 top: -3px;
                 left: 50%;
                 transform: translateX(-50%)
               }
               .react-flow__handle-bottom {
                 bottom: -3px;
                 left: 50%;
                 transform: translateX(-50%)
               }
             `}
            </style>
            <div
              className="relative mb-24 h-420 w-full overflow-hidden rounded-xl"
              style={{ backgroundColor: bgColor }}
            >
              <ReactFlow
                ref={workspaceRef}
                onInit={setRf}
                nodes={post.roadmap.nodes ?? []}
                edges={post.roadmap.edges ?? []}
                fitView
                fitViewOptions={{ padding: 0.4 }}
                nodesDraggable={false}
                nodesConnectable={false}
                elementsSelectable={false}
                zoomOnScroll={false}
                zoomOnDoubleClick={false}
                panOnScroll={false}
                panOnDrag={false}
                proOptions={{ hideAttribution: true }}
                nodeTypes={nodeTypes}
                className="h-full w-full"
              >
                <Background
                  variant={BackgroundVariant.Lines}
                  gap={24}
                  size={1}
                  color={isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'}
                />
              </ReactFlow>

              {!isCapturing && (
                <div className="workspace-action absolute right-12 bottom-16 flex flex-col items-end gap-8">
                  {isActionOpen && (
                    <div className="flex flex-col gap-8">
                      <button
                        onClick={handleExportImage}
                        className="bg-accent rounded-lg px-16 py-8 text-sm text-white shadow-lg"
                      >
                        이미지로 저장하기
                      </button>

                      <button className="bg-accent rounded-lg px-16 py-8 text-sm text-white shadow-lg">
                        내 워크스페이스에 불러오기
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => setIsActionOpen((prev) => !prev)}
                    className="bg-accent flex h-50 w-50 items-center justify-center rounded-full shadow-xl transition-transform hover:scale-105"
                  >
                    <Plus size={24} className="text-white" />
                  </button>
                </div>
              )}
            </div>

            <div>
              <p>{post.content}</p>
            </div>

            <CommunityCommentSection postId={post.post_id} />
          </div>
        </div>
      </div>

      <CommunitySidebar isOpen={isOpen} toggleOpen={toggleOpen} />
    </div>
  )
}
