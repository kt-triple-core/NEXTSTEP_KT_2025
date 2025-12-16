'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import CommunityCard from './CommunityCard'

type Post = {
  posts_id: string
  title: string
  nodes: any[]
  edges: any[]
}

export default function CommunityCardGrid() {
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])

  useEffect(() => {
    const fetchPosts = async () => {
      const res = await fetch('/api/community/posts')
      const json = await res.json()
      setPosts(json.data)
    }

    fetchPosts()
  }, [])

  return (
    <div className="grid gap-150 md:grid-cols-2 xl:grid-cols-2">
      {posts.map((post) => (
        <CommunityCard
          key={post.posts_id}
          title={post.title}
          nodes={post.nodes}
          edges={post.edges}
          onClick={() => {
            router.push(`/community/${post.posts_id}`)
          }}
        />
      ))}
    </div>
  )
}
