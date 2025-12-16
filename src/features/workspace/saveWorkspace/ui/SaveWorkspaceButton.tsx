import { Button } from '@/shared/ui'
import { useSession } from 'next-auth/react'
import { useSaveWorkspace } from '../model'

const SaveWorkspaceButton = () => {
  const { status } = useSession()
  const { saveWorkspace } = useSaveWorkspace()
  const handleSave = () => {
    // 로그인 여부 확인
    if (status !== 'authenticated') return

    saveWorkspace()
  }
  return (
    <Button
      variant="accent"
      onClick={handleSave}
      className="text-12 h-full px-20"
    >
      저장
    </Button>
  )
}

export default SaveWorkspaceButton
