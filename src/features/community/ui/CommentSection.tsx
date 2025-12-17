// features/comment/ui/CommentSection.tsx
'use client'

import CommentForm from './CommentForm'
import CommentItem from './CommentItem'
import { useComments } from '../model/useComments'

interface Props {
  articleId: string
}

const CommentSection = ({ articleId }: Props) => {
  const {
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
  } = useComments(articleId)

  const totalComments = comments.reduce(
    (acc, c) => acc + 1 + (c.replies?.length || 0),
    0
  )

  return (
    <div className="flex flex-col gap-12">
      <p className="font-semibold">댓글 ({totalComments})</p>

      {/* 댓글 작성 */}
      <CommentForm
        value={newComment}
        onChange={setNewComment}
        onSubmit={handleAddComment}
      />

      {/* 댓글 목록 */}
      <div className="flex flex-col gap-16">
        {comments.length === 0 ? (
          <p className="text-foreground-light text-sm">아직 댓글이 없습니다.</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.comment_id} className="flex flex-col gap-12">
              {/* 부모 댓글 */}
              <CommentItem
                comment={comment}
                currentUserId={currentUserId}
                editingComment={editingComment}
                editContent={editContent}
                replyingTo={replyingTo}
                replyContent={replyContent}
                onEdit={(id, content) => {
                  setEditingComment(id)
                  setEditContent(content)
                }}
                onCancelEdit={() => {
                  setEditingComment(null)
                  setEditContent('')
                }}
                onSaveEdit={handleEditComment}
                onDelete={handleDeleteComment}
                onReply={setReplyingTo}
                onCancelReply={() => {
                  setReplyingTo(null)
                  setReplyContent('')
                }}
                onSaveReply={handleAddReply}
                onEditContentChange={setEditContent}
                onReplyContentChange={setReplyContent}
              />

              {/* 답글 목록 */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="ml-52 flex flex-col gap-12">
                  {comment.replies.map((reply) => (
                    <CommentItem
                      key={reply.comment_id}
                      comment={reply}
                      currentUserId={currentUserId}
                      isReply
                      editingComment={editingComment}
                      editContent={editContent}
                      replyingTo={replyingTo}
                      replyContent={replyContent}
                      onEdit={(id, content) => {
                        setEditingComment(id)
                        setEditContent(content)
                      }}
                      onCancelEdit={() => {
                        setEditingComment(null)
                        setEditContent('')
                      }}
                      onSaveEdit={handleEditComment}
                      onDelete={handleDeleteComment}
                      onReply={setReplyingTo}
                      onCancelReply={() => {
                        setReplyingTo(null)
                        setReplyContent('')
                      }}
                      onSaveReply={handleAddReply}
                      onEditContentChange={setEditContent}
                      onReplyContentChange={setReplyContent}
                    />
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default CommentSection
