import { Button } from '@/shared/ui'
import { useDeleteWorkspace } from '../model'
import { toast } from 'sonner'
import AlertModal from '@/shared/ui/AlertModal'
import { useWorkspaceStore } from '@/widgets/workspace/model'
import { useRouter } from 'next/navigation'

interface DeleteWorkspaceModalProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  workspaceId: string
}

const DeleteWorkspaceModal = ({
  isOpen,
  setIsOpen,
  workspaceId,
}: DeleteWorkspaceModalProps) => {
  const router = useRouter()
  const { deleteWorkspace, isSaving } = useDeleteWorkspace()
  const { workspaceId: currentWorkspaceId, setWorkspaceId } =
    useWorkspaceStore()

  const handleDelete = () => {
    deleteWorkspace(workspaceId, {
      onSuccess: (data) => {
        toast.success('워크스페이스가 삭제되었습니다.')

        // 현재 보고 있는 워크스페이스를 삭제했을 경우
        if (currentWorkspaceId === data.workspaceId) {
          setWorkspaceId(null)
          router.push('/')
        }
      },
      onError: (e) => {
        toast.error(e.message)
      },
    })

    // AlertModal 닫기
    setIsOpen(false)
  }

  return (
    <AlertModal
      open={isOpen}
      onOpenChange={setIsOpen}
      title="워크스페이스 삭제"
      titleClassName="text-center"
      className="px-10 pt-20 pb-10"
      footer={
        <>
          <Button onClick={() => setIsOpen(false)} className="px-20 py-8">
            취소
          </Button>
          <Button
            variant="accent"
            onClick={handleDelete}
            className="px-20 py-8"
          >
            {isSaving ? '삭제 중...' : '삭제'}
          </Button>
        </>
      }
      footerClassName="flex sm:justify-center gap-10"
    />
  )
}

export default DeleteWorkspaceModal
