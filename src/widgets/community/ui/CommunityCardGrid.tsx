'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import CommunityCard from './CommunityCard'
import { PostWithRoadmap } from '@/features/community/model/types'

// listId가 있으면 분야별로 없으면 전체 게시글을 불러옴
interface CommunityCardGridProps {
  listId?: string | null
}

const CommunityCardGrid = ({ listId }: CommunityCardGridProps) => {
  const router = useRouter()
  const [posts, setPosts] = useState<PostWithRoadmap[]>([])
  const [loading, setLoading] = useState(true)

  //listId가 변경되면 게시글 목록 API 다시 호출 (사이드바에서 카테고리 바꿀 때 자동으로 갱신됨)
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true)

        const res = await fetch(
          listId
            ? `/api/community/posts?list=${listId}`
            : `/api/community/posts`
        )

        const json = await res.json()

        const list: PostWithRoadmap[] = Array.isArray(json) ? json : []
        setPosts(list)
      } catch (e) {
        console.error(e)
        setPosts([])
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [listId])

  // 로딩 중
  if (loading) {
    return (
      <p className="text-foreground-light py-40 text-center">불러오는 중...</p>
    )
  }

  // 해당 list에 글이 없는 경우
  if (posts.length === 0) {
    return (
      <p className="text-foreground-light py-40 text-center">
        아직 등록된 글이 없습니다.
      </p>
    )
  }

  return (
    <div className="grid gap-150 md:grid-cols-2 xl:grid-cols-2">
      {posts
        .filter((post) => post.author)
        .map((post) => (
        <CommunityCard
          key={post.post_id}
          title={post.title}
          nodes={post.roadmap.nodes}
          edges={post.roadmap.edges}
          authorId={post.author?.user_id ?? null}
          userName={post.author?.name ?? null}
          userImage={post.author?.avatar ?? null}
          decorations={post.author?.decorations ?? null}
          onClick={() => {
            router.push(`/community/${post.post_id}?list=${listId}`)
          }}
        />
      ))}
    </div>
  )
}
export default CommunityCardGrid
