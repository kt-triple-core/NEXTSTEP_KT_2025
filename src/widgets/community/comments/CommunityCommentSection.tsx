'use client'

import { useComments } from '@/features/community/model/useComments'
import CommunityCommentItem from './CommunityCommentItem'
import CommunityCommentInput from './CommunityCommentInput'

export default function CommunityCommentSection({
  postId,
}: {
  postId: string
}) {
  // 훅 전체를 하나의 객체로 받는다
  const commentsHook = useComments(postId)

  const { comments, newComment, setNewComment, handleAddComment } = commentsHook

  return (
    <div className="mt-32">
      <p className="mb-12 font-semibold">댓글 ({comments.length})</p>

      {/* 댓글 입력 */}
      <CommunityCommentInput
        value={newComment}
        onChange={setNewComment}
        onSubmit={handleAddComment}
      />

      {/* 댓글 목록 */}
      <div className="mt-16 flex flex-col gap-12">
        {comments.map((comment) => (
          <CommunityCommentItem
            key={comment.comment_id}
            comment={comment}
            commentsHook={commentsHook} // 같은 훅 인스턴스 전달
          />
        ))}
      </div>
    </div>
  )
}
