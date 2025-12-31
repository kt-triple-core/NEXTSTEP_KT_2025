export type CommunityTabKey = 'post' | 'news'

type AccessoryPosition = 'top' | 'bottom-left' | 'bottom-right'

export type AvatarDecoration = {
  border?: {
    source: string | null
    style: string | null
    scale?: number | null
  } | null

  accessories?: Partial<
    Record<
      AccessoryPosition,
      {
        source: string | null
        style: string | null
        scale?: number | null
      }
    >
  >
}

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
  author: {
    user_id: string
    name: string
    avatar: string
    decorations: AvatarDecoration | null
  } | null
}
