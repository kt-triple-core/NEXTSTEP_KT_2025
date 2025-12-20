import { Button } from '@/shared/ui'
import Modal from '@/shared/ui/Modal'
import { DialogClose } from '@radix-ui/react-dialog'
import { useState } from 'react'
import { useUpdateWorkspaceTitle } from '../model'
import { toast } from 'sonner'

interface UpdateWorkspaceTitleModalProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  title: string
  workspaceId: string
}

const UpdateWorkspaceTitleModal = ({
  isOpen,
  setIsOpen,
  title,
  workspaceId,
}: UpdateWorkspaceTitleModalProps) => {
  const [titleInput, setTitleInput] = useState<string>(title)
  const { updateWorkspaceTitle, isSaving } = useUpdateWorkspaceTitle()

  const handleUpdateTitle = () => {
    updateWorkspaceTitle(
      { workspaceTitle: titleInput, workspaceId },
      {
        onSuccess: () => {
          setIsOpen(false)
          setTitleInput('')
          toast.success('워크스페이스 이름이 변경되었습니다.')
        },
        onError: (e) => {
          toast.error(e.message)
        },
      }
    )
  }

  return (
    <Modal
      open={isOpen}
      onOpenChange={setIsOpen}
      title="워크스페이스 이름 변경"
      titleClassName="text-center"
      className="px-10 pt-20 pb-10"
      footer={
        <>
          <DialogClose asChild>
            <Button className="px-20 py-8">취소</Button>
          </DialogClose>
          <Button
            variant="accent"
            onClick={handleUpdateTitle}
            className="px-20 py-8"
            disabled={isSaving}
          >
            {isSaving ? '저장 중...' : '저장'}
          </Button>
        </>
      }
      footerClassName="flex sm:justify-center gap-10"
    >
      <input
        type="text"
        placeholder="워크스페이스 이름을 입력해주세요."
        value={titleInput}
        onChange={(e) => setTitleInput(e.target.value)}
        className="my-20 rounded-sm border border-gray-400 px-10 py-8 outline-none"
      />
    </Modal>
  )
}

export default UpdateWorkspaceTitleModal
