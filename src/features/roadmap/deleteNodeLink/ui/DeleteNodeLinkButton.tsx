import { Button } from '@/shared/ui'
import { useWorkspaceStore } from '@/widgets/workspace/model'
import Trash from '@/shared/ui/icon/Trash'
import { NodeLink } from '@/widgets/workspace/model/types'

interface DeleteNodeLinkButtonProps {
  techId: string | null
  nodeLinkId: string
  links: NodeLink[]
}

const DeleteNodeLinkButton = ({
  techId,
  nodeLinkId,
}: DeleteNodeLinkButtonProps) => {
  const removeNodeLink = useWorkspaceStore((s) => s.removeNodeLink)
  if (!techId) return null

  return (
    <Button
      variant="secondary"
      className="opacity-0 transition-opacity group-hover:opacity-100"
      onClick={() => removeNodeLink(techId, nodeLinkId)}
    >
      <Trash />
    </Button>
  )
}

export default DeleteNodeLinkButton
