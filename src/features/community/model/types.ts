export type CommunityTabKey = 'post' | 'news'

export type PostWithRoadmap = {
  post_id: string
  content: string
  title: string
  like_count: any
  roadmap_id: string
  created_at: string
  updated_at: string
  roadmap: {
    roadmap_id: string
    user_id: string
    nodes: any[]
    edges: any[]
    visibility: 'private' | 'public'
    status: any
  }
  users: {
    user_id: string
    name: string
    avatar: string
  }
}
