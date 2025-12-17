'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import CommunityCard from './CommunityCard'

type Post = {
  posts_id: string
  title: string
  nodes: any[]
  edges: any[]
  users?: {
    user_id: string
    name?: string | null
    avatar?: string | null
  }
}

interface CommunityCardGridProps {
  listId?: string | null
}

export default function CommunityCardGrid({ listId }: CommunityCardGridProps) {
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

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

        // ✅ 무조건 배열로 보정
        const list: Post[] = Array.isArray(json) ? json : []
        setPosts(list)
      } catch (e) {
        console.error(e)
        setPosts([])
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [listId]) // ⭐ listId 바뀔 때마다 다시 fetch

  // 🔹 로딩 중
  if (loading) {
    return (
      <p className="text-foreground-light py-40 text-center">불러오는 중...</p>
    )
  }

  // 🔹 해당 list에 글이 없는 경우
  if (posts.length === 0) {
    return (
      <p className="text-foreground-light py-40 text-center">
        아직 등록된 글이 없습니다.
      </p>
    )
  }

  return (
    <div className="grid gap-150 md:grid-cols-2 xl:grid-cols-2">
      {posts.map((post) => (
        <CommunityCard
          key={post.posts_id}
          title={post.title}
          nodes={post.nodes}
          edges={post.edges}
          userName={post.users?.name}
          userImage={post.users?.avatar}
          onClick={() => {
            router.push(`/community/${post.posts_id}`)
          }}
        />
      ))}
    </div>
  )
}
