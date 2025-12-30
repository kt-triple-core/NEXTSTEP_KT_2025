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
}: DeleteNodeTroubleshootingButtonProps) => {
  const removeNodeTroubleshooting = useWorkspaceStore(
    (s) => s.removeNodeTroubleshooting
  )
  if (!techId) return null

  return (
    <Button
      variant="secondary"
      className="opacity-0 transition-opacity group-hover:opacity-100"
      onClick={() => removeNodeTroubleshooting(techId, nodeTroubleshootingId)}
    >
      <Trash />
    </Button>
  )
}

export default DeleteNodeTroubleshootingButton
