// [경로] features/community/model/useComments.ts
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  fetchComments,
  fetchCurrentUser,
  createComment,
  updateComment,
  deleteComment,
  CommentType,
} from './../api/commentApi'

export const useComments = (postId: string, type: CommentType = 'news') => {
  const queryClient = useQueryClient()

  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [editingComment, setEditingComment] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')

  // 댓글 목록 조회
  const {
    data: comments = [],
    isLoading: isLoadingComments,
    error: commentsError,
  } = useQuery({
    queryKey: ['comments', postId, type],
    queryFn: () => fetchComments(postId, type),
    staleTime: 1000 * 60, // 1분
  })

  // 현재 사용자 조회
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: fetchCurrentUser,
    staleTime: 1000 * 60 * 5, // 5분
  })

  const currentUserId = currentUser?.user_id || ''

  // 댓글 작성 mutation
  const createCommentMutation = useMutation({
    mutationFn: (content: string) =>
      createComment(postId, type, {
        content,
        post_id: postId,
        user_id: currentUserId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId, type] })
      setNewComment('')
      toast.success('댓글이 작성되었습니다.')
    },
    onError: () => {
      toast.error('댓글 작성에 실패했습니다.')
    },
  })

  // 답글 작성 mutation
  const createReplyMutation = useMutation({
    mutationFn: ({
      parentId,
      content,
    }: {
      parentId: string
      content: string
    }) =>
      createComment(postId, type, {
        content,
        post_id: postId,
        parent_comment_id: parentId,
        user_id: currentUserId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId, type] })
      setReplyContent('')
      setReplyingTo(null)
      toast.success('답글이 작성되었습니다.')
    },
    onError: () => {
      toast.error('답글 작성에 실패했습니다.')
    },
  })

  // 댓글 수정 mutation
  const updateCommentMutation = useMutation({
    mutationFn: ({
      commentId,
      content,
    }: {
      commentId: string
      content: string
    }) =>
      updateComment(postId, type, commentId, {
        content,
        user_id: currentUserId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId, type] })
      setEditContent('')
      setEditingComment(null)
      toast.success('댓글이 수정되었습니다.')
    },
    onError: () => {
      toast.error('댓글 수정에 실패했습니다.')
    },
  })

  // 댓글 삭제 mutation
  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) =>
      deleteComment(postId, type, commentId, { user_id: currentUserId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId, type] })
      toast.success('댓글이 삭제되었습니다.')
    },
    onError: () => {
      toast.error('댓글 삭제에 실패했습니다.')
    },
  })

  // 핸들러 함수들
  const handleAddComment = () => {
    if (!newComment.trim()) return

    if (!currentUserId) {
      toast.error('로그인이 필요합니다.')
      return
    }

    createCommentMutation.mutate(newComment)
  }

  const handleAddReply = (parentId: string) => {
    if (!replyContent.trim()) return

    if (!currentUserId) {
      toast.error('로그인이 필요합니다.')
      return
    }

    createReplyMutation.mutate({ parentId, content: replyContent })
  }

  const handleEditComment = (commentId: string) => {
    if (!editContent.trim()) return

    updateCommentMutation.mutate({ commentId, content: editContent })
  }

  const handleDeleteComment = (commentId: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    deleteCommentMutation.mutate(commentId)
  }

  return {
    // 데이터
    comments,
    currentUserId,
    isLoadingComments,
    commentsError,

    // 상태
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

    // 액션
    handleAddComment,
    handleAddReply,
    handleEditComment,
    handleDeleteComment,

    // 로딩 상태
    isCreatingComment: createCommentMutation.isPending,
    isCreatingReply: createReplyMutation.isPending,
    isUpdatingComment: updateCommentMutation.isPending,
    isDeletingComment: deleteCommentMutation.isPending,
  }
}
