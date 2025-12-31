'use client'

import ProfileAvatar from '@/shared/ui/profile/ProfileAvatar'

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
  user?: User | null
  replies?: Comment[]
}

interface Props {
  comment: Comment
  currentUserId: string
  isReply?: boolean
  editingComment: string | null
  editContent: string
  replyingTo: string | null
  replyContent: string
  onEdit: (commentId: string, content: string) => void
  onCancelEdit: () => void
  onSaveEdit: (commentId: string) => void
  onDelete: (commentId: string) => void
  onReply: (commentId: string) => void
  onCancelReply: () => void
  onSaveReply: (parentId: string) => void
  onEditContentChange: (content: string) => void
  onReplyContentChange: (content: string) => void
}

const CommentItem = ({
  comment,
  currentUserId,
  isReply = false,
  editingComment,
  editContent,
  replyingTo,
  replyContent,
  onEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  onReply,
  onCancelReply,
  onSaveReply,
  onEditContentChange,
  onReplyContentChange,
}: Props) => {
  // user가 없으면 기본값 사용
  const userName = comment.user?.name || '익명'
  const userAvatar = comment.user?.avatar || null
  const userExperience = comment.user?.experience

  return (
    <div className="bg-secondary flex gap-12 rounded-lg p-16">
      {/* 프로필 이미지 */}
      <div className="flex-shrink-0">
        <ProfileAvatar
          name={userName}
          image={userAvatar}
          size={isReply ? 32 : 40}
        />
      </div>

      {/* 댓글 내용 */}
      <div className="flex flex-1 flex-col gap-8">
        <div className="flex items-center gap-8">
          <span className="text-sm font-medium">{userName}</span>
          {userExperience && (
            <span className="text-foreground-light text-xs">
              {userExperience.field} {userExperience.year}년차
            </span>
          )}
          <span className="text-foreground-light text-xs">
            {new Date(comment.created_at).toLocaleDateString()}
          </span>
        </div>

        {editingComment === comment.comment_id ? (
          <div className="flex flex-col gap-8">
            <textarea
              value={editContent}
              onChange={(e) => onEditContentChange(e.target.value)}
              className="bg-primary text-foreground w-full resize-none rounded-lg border-none p-12 text-sm outline-none"
              rows={isReply ? 2 : 3}
            />
            <div className="flex gap-8">
              <button
                onClick={() => onSaveEdit(comment.comment_id)}
                className="bg-primary text-foreground hover:bg-primary/70 rounded-lg px-12 py-6 text-xs transition-colors"
              >
                수정 완료
              </button>
              <button
                onClick={onCancelEdit}
                className="text-foreground-light hover:text-foreground rounded-lg px-12 py-6 text-xs transition-colors"
              >
                취소
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-foreground text-sm">{comment.content}</p>
            <div className="flex gap-12 text-xs">
              {!isReply && (
                <button
                  onClick={() => onReply(comment.comment_id)}
                  className="text-foreground-light hover:text-foreground transition-colors"
                >
                  답글
                </button>
              )}
              {comment.user_id === currentUserId && (
                <>
                  <button
                    onClick={() => onEdit(comment.comment_id, comment.content)}
                    className="text-foreground-light hover:text-foreground transition-colors"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => onDelete(comment.comment_id)}
                    className="text-foreground-light hover:text-foreground transition-colors"
                  >
                    삭제
                  </button>
                </>
              )}
            </div>
          </>
        )}

        {/* 답글 작성 폼 */}
        {!isReply && replyingTo === comment.comment_id && (
          <div className="mt-8 flex flex-col gap-8">
            <textarea
              value={replyContent}
              onChange={(e) => onReplyContentChange(e.target.value)}
              placeholder="답글을 입력하세요"
              className="bg-primary text-foreground w-full resize-none rounded-lg border-none p-12 text-sm outline-none"
              rows={2}
            />
            <div className="flex gap-8">
              <button
                onClick={() => onSaveReply(comment.comment_id)}
                className="bg-primary text-foreground hover:bg-primary/70 rounded-lg px-12 py-6 text-xs transition-colors"
              >
                답글 작성
              </button>
              <button
                onClick={onCancelReply}
                className="text-foreground-light hover:text-foreground rounded-lg px-12 py-6 text-xs transition-colors"
              >
                취소
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CommentItem
