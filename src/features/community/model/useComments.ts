// features/comment/hooks/useComments.ts
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

interface User {
  user_id: string
  name: string
  avatar?: string
  experience?: {
    field: string
    year: number
  }
}

interface Comment {
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

export const useComments = (articleId: string) => {
  const [comments, setComments] = useState<Comment[]>([])
  const [currentUserId, setCurrentUserId] = useState<string>('')
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [editingComment, setEditingComment] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')

  useEffect(() => {
    fetchComments()
    fetchCurrentUser()
  }, [articleId])

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch('/api/users/me')
      if (res.ok) {
        const userData = await res.json()
        console.log('User data:', userData)
        setCurrentUserId(userData.user_id)
      } else {
        console.error('Failed to fetch user, status:', res.status)
      }
    } catch (err) {
      console.error('Failed to fetch user:', err)
    }
  }

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/community/news/${articleId}/comments`)
      if (!res.ok) {
        setComments([])
        return
      }

      const data = await res.json()
      console.log('Fetched comments:', data) // 디버깅

      // 댓글을 부모-자식 구조로 변환
      const parentComments = data.filter((c: Comment) => !c.parent_comment_id)
      const childComments = data.filter((c: Comment) => c.parent_comment_id)

      const commentsWithReplies = parentComments.map((parent: Comment) => ({
        ...parent,
        replies: childComments.filter(
          (child: Comment) => child.parent_comment_id === parent.comment_id
        ),
      }))

      console.log('Processed comments:', commentsWithReplies) // 디버깅
      setComments(commentsWithReplies)
    } catch (err) {
      console.error('Failed to fetch comments:', err)
      setComments([])
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return

    console.log('Current user ID:', currentUserId)

    if (!currentUserId) {
      toast.error('로그인이 필요합니다.')
      return
    }

    try {
      const res = await fetch(`/api/community/news/${articleId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newComment,
          post_id: articleId,
          user_id: currentUserId,
        }),
      })

      if (!res.ok) throw new Error('Failed to add comment')

      setNewComment('')
      await fetchComments()
      toast.success('댓글이 작성되었습니다.')
    } catch (err) {
      console.error(err)
      toast.error('댓글 작성에 실패했습니다.')
    }
  }

  const handleAddReply = async (parentId: string) => {
    if (!replyContent.trim()) return

    if (!currentUserId) {
      toast.error('로그인이 필요합니다.')
      return
    }

    try {
      const res = await fetch(`/api/community/news/${articleId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: replyContent,
          post_id: articleId,
          parent_comment_id: parentId,
          user_id: currentUserId,
        }),
      })

      if (!res.ok) throw new Error('Failed to add reply')

      setReplyContent('')
      setReplyingTo(null)
      await fetchComments()
      toast.success('답글이 작성되었습니다.')
    } catch (err) {
      console.error(err)
      toast.error('답글 작성에 실패했습니다.')
    }
  }

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim()) return

    try {
      const res = await fetch(
        `/api/community/news/${articleId}/comments/${commentId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: editContent,
            user_id: currentUserId,
          }),
        }
      )

      if (!res.ok) throw new Error('Failed to edit comment')

      setEditContent('')
      setEditingComment(null)
      await fetchComments()
      toast.success('댓글이 수정되었습니다.')
    } catch (err) {
      console.error(err)
      toast.error('댓글 수정에 실패했습니다.')
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    try {
      const res = await fetch(
        `/api/community/news/${articleId}/comments/${commentId}`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: currentUserId }),
        }
      )

      if (!res.ok) throw new Error('Failed to delete comment')

      await fetchComments()
      toast.success('댓글이 삭제되었습니다.')
    } catch (err) {
      console.error(err)
      toast.error('댓글 삭제에 실패했습니다.')
    }
  }

  return {
    comments,
    currentUserId,
    newComment,
    setNewComment,
    replyingTo,
    setReplyingTo,
    replyContent,
    setReplyContent,
    editingComment,
    setEditingComment,
    editContent,
    setEditContent,
    handleAddComment,
    handleAddReply,
    handleEditComment,
    handleDeleteComment,
  }
}
