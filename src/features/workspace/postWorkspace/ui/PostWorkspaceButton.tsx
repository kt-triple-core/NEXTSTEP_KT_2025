import { Button } from '@/shared/ui'
import { useSession } from 'next-auth/react'
import { usePostWorkspace } from '../model'

const PostWorkspaceButton = () => {
  const { status } = useSession()
  const { postWorkspace } = usePostWorkspace()
  const handleSave = () => {
    // 로그인 여부 확인
    if (status !== 'authenticated') return

    postWorkspace()
  }
  return (
    <Button
      variant="accent"
      onClick={handleSave}
      className="text-12 h-full px-20"
    >
      게시
    </Button>
  )
}

export default PostWorkspaceButton
