'use client'

import { useComments } from '@/features/community/model/useComments'

interface Props {
  comment: any
  commentsHook: ReturnType<typeof useComments>
}

export default function CommunityCommentItem({ comment, commentsHook }: Props) {
  const {
    currentUserId,

    replyingTo,
    setReplyingTo,
    replyContent,
    setReplyContent,
    handleAddReply,

    editingComment,
    setEditingComment,
    editContent,
    setEditContent,
    handleEditComment,

    handleDeleteComment,
  } = commentsHook

  const isMine = comment.user_id === currentUserId
  const isEditing = editingComment === comment.comment_id
  const isReplying = replyingTo === comment.comment_id
  const isDeleted = comment.status === false
  const isReply = Boolean(comment.parent_comment_id)

  return (
    <div
      className={`border-border rounded-xl border p-16 ${
        isReply ? 'bg-color-card ml-24' : 'bg-color-card'
      }`}
    >
      <div className="flex gap-12">
        {/* 프로필 */}
        <div className="bg-muted flex h-36 w-36 shrink-0 items-center justify-center rounded-full text-xs">
          {comment.user?.avatar ? (
            <img
              src={comment.user.avatar}
              className="h-full w-full rounded-full object-cover"
              alt="profile"
            />
          ) : (
            '익명'
          )}
        </div>

        {/* 본문 */}
        <div className="flex-1">
          {/* 이름 + 경력 */}
          <div className="flex items-center gap-8">
            <span className="text-sm font-semibold">
              {comment.user?.name ?? '익명'}
            </span>
            {comment.user?.experience && (
              <span className="text-xs text-[var(--foreground-light)]">
                {comment.user.experience.field} · {comment.user.experience.year}
                년차
              </span>
            )}
          </div>

          {/* 내용 */}
          {isEditing ? (
            <div className="mt-8 flex gap-8">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="border-border bg-background flex-1 rounded-lg border p-12 text-sm"
              />
              <button
                onClick={() => handleEditComment(comment.comment_id)}
                className="text-accent text-sm"
              >
                저장
              </button>
            </div>
          ) : isDeleted ? (
            <p className="text-foreground-light mt-8 text-sm italic">
              삭제된 댓글입니다.
            </p>
          ) : (
            <p className="mt-8 text-sm leading-relaxed">{comment.content}</p>
          )}

          {/* 메타 */}
          <div className="text-foreground-light mt-8 flex items-center gap-12 text-xs">
            <span>{new Date(comment.created_at).toLocaleString()}</span>

            {!isDeleted && (
              <>
                <button onClick={() => setReplyingTo(comment.comment_id)}>
                  답글*
                </button>

                {isMine && (
                  <>
                    <button
                      onClick={() => {
                        setEditingComment(comment.comment_id)
                        setEditContent(comment.content)
                      }}
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDeleteComment(comment.comment_id)}
                    >
                      삭제
                    </button>
                  </>
                )}
              </>
            )}
          </div>

          {/* 대댓글 입력 */}
          {!isDeleted && isReplying && (
            <div className="border-border bg-background mt-12 rounded-lg border p-12">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="답글을 입력하세요"
                className="w-full resize-none bg-transparent text-sm outline-none"
              />
              <div className="mt-8 flex justify-end">
                <button
                  onClick={() => handleAddReply(comment.comment_id)}
                  className="text-accent text-sm"
                >
                  등록
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 대댓글 */}
      {comment.replies?.length > 0 && (
        <div className="mt-16 flex flex-col gap-12">
          {comment.replies.map((reply: any) => (
            <CommunityCommentItem
              key={reply.comment_id}
              comment={reply}
              commentsHook={commentsHook}
            />
          ))}
        </div>
      )}
    </div>
  )
}
