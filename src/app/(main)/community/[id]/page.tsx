'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Close } from '@/shared/ui/icon'
import CommunitySidebar from '@/widgets/community/ui/CommunitySidebar'
import { useOpen } from '@/shared/model'
import { ReactFlow, Background, BackgroundVariant } from '@xyflow/react'
import '@xyflow/react/dist/style.css'

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

export default function CommunityDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { isOpen, toggleOpen } = useOpen()

  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)

  // ✅ 카드그리드랑 동일한 방식
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch('/api/community/posts')
        const json = await res.json()

        const list: Post[] = Array.isArray(json) ? json : []
        const found = list.find((p) => p.posts_id === id)

        setPost(found ?? null)
      } catch (e) {
        console.error(e)
        setPost(null)
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [id])

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
              <button className="bg-secondary rounded-lg px-12 py-6">
                <ChevronLeft />
              </button>
              <button className="bg-secondary rounded-lg px-12 py-6">
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

            {/* ===== 워크스페이스 (카드랑 동일 데이터) ===== */}
            {/* ===== 워크스페이스 (CommunityCard와 동일 렌더링) ===== */}
            <div
              className="relative mb-24 h-420 w-full overflow-hidden rounded-xl"
              style={{ backgroundColor: '#1f2937' }} // 카드 dark 기준
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
                <Background variant={BackgroundVariant.Lines} color="#374151" />
              </ReactFlow>

              {/* 우측 하단 버튼 */}
              <div className="absolute right-24 bottom-16 flex flex-col gap-8">
                <button className="bg-accent rounded-lg px-16 py-8 text-sm text-white">
                  이미지로 저장하기
                </button>
                <button className="bg-accent rounded-lg px-16 py-8 text-sm text-white">
                  내 워크스페이스에 불러오기
                </button>
                <button className="bg-accent flex h-48 w-48 items-center justify-center rounded-full text-xl text-white">
                  +
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
