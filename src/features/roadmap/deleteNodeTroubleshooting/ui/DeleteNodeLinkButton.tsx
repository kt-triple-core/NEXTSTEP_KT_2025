import { useDeleteNodeTroubleshooting } from '../model'
import { toast } from 'sonner'
import { Button } from '@/shared/ui'
import { useWorkspaceStore } from '@/widgets/workspace/model'
import Trash from '@/shared/ui/icon/Trash'
import { NodeTroubleshooting } from '@/widgets/workspace/model/types'

interface DeleteNodeTroubleshootingButtonProps {
  techId: string | null
  nodeTroubleshootingId: string
  troubleshootings: NodeTroubleshooting[]
}

const DeleteNodeTroubleshootingButton = ({
  techId,
  nodeTroubleshootingId,
  troubleshootings,
}: DeleteNodeTroubleshootingButtonProps) => {
  const setNodeTroubleshootings = useWorkspaceStore(
    (s) => s.setNodeTroubleshootings
  )

  const { deleteNodeTroubleshooting, isDeleting } =
    useDeleteNodeTroubleshooting()
  const handleDelete = () => {
    if (!techId) return
    deleteNodeTroubleshooting(
      { nodeTroubleshootingId },
      {
        onSuccess: (data) => {
          setNodeTroubleshootings(techId, [
            ...troubleshootings.filter(
              (troubleshooting) =>
                troubleshooting.nodeTroubleshootingId !==
                data.nodeTroubleshootingId
            ),
          ])
          toast.success('트러블슈팅이 삭제되었습니다.')
        },
        onError: (err) => {
          console.log(err)
          toast.error(
            err instanceof Error
              ? err.message
              : '트러블 슈팅 삭제 중 오류가 발생했습니다.'
          )
        },
      }
    )
  }

  return (
    <Button
      variant="secondary"
      className="opacity-0 transition-opacity group-hover:opacity-100"
      onClick={handleDelete}
      disabled={isDeleting}
    >
      <Trash />
    </Button>
  )
}

export default DeleteNodeTroubleshootingButton
