// features/community/model/api/commentApi.ts

interface User {
  user_id: string
  name: string
  avatar?: string
  experience?: {
    field: string
    year: number
  }
}

export interface Comment {
  comment_id: string
  post_id: string
  user_id: string
  content: string
  parent_comment_id?: string
  created_at: string
  updated_at: string
  status: boolean
  user: User
  replies?: Comment[]
}

export type CommentType = 'news' | 'community'

interface CreateCommentDto {
  content: string
  post_id: string
  user_id: string
  parent_comment_id?: string
}

interface UpdateCommentDto {
  content: string
  user_id: string
}

interface DeleteCommentDto {
  user_id: string
}

// API 경로 헬퍼
const getApiPath = (postId: string, type: CommentType) => {
  return type === 'news'
    ? `/api/community/news/${postId}/comments`
    : `/api/community/posts/${postId}/comments`
}

// 댓글 목록 조회
export const fetchComments = async (
  postId: string,
  type: CommentType = 'news'
): Promise<Comment[]> => {
  const res = await fetch(getApiPath(postId, type))

  if (!res.ok) {
    throw new Error('Failed to fetch comments')
  }

  const data = await res.json()

  // 댓글을 부모-자식 구조로 변환
  const parentComments = data.filter((c: Comment) => !c.parent_comment_id)
  const childComments = data.filter((c: Comment) => c.parent_comment_id)

  const commentsWithReplies = parentComments.map((parent: Comment) => ({
    ...parent,
    replies: childComments.filter(
      (child: Comment) => child.parent_comment_id === parent.comment_id
    ),
  }))

  return commentsWithReplies
}

// 현재 사용자 조회
export const fetchCurrentUser = async () => {
  const res = await fetch('/api/users/me')

  if (!res.ok) {
    throw new Error('Failed to fetch user')
  }

  return res.json()
}

// 댓글 작성
export const createComment = async (
  postId: string,
  type: CommentType,
  dto: CreateCommentDto
) => {
  const res = await fetch(getApiPath(postId, type), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  })

  if (!res.ok) {
    throw new Error('Failed to create comment')
  }

  return res.json()
}

// 댓글 수정
export const updateComment = async (
  postId: string,
  type: CommentType,
  commentId: string,
  dto: UpdateCommentDto
) => {
  const res = await fetch(`${getApiPath(postId, type)}/${commentId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  })

  if (!res.ok) {
    throw new Error('Failed to update comment')
  }

  return res.json()
}

// 댓글 삭제
export const deleteComment = async (
  postId: string,
  type: CommentType,
  commentId: string,
  dto: DeleteCommentDto
) => {
  const res = await fetch(`${getApiPath(postId, type)}/${commentId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  })

  if (!res.ok) {
    throw new Error('Failed to delete comment')
  }

  return res.json()
}
