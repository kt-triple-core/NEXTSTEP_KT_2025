import { useDeleteNodeLink } from '../model'
import { toast } from 'sonner'
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
  links,
}: DeleteNodeLinkButtonProps) => {
  const setNodeLinks = useWorkspaceStore((s) => s.setNodeLinks)

  const { deleteNodeLink, isDeleting } = useDeleteNodeLink()
  const handleDelete = () => {
    if (!techId) return
    deleteNodeLink(
      { nodeLinkId },
      {
        onSuccess: (data) => {
          setNodeLinks(techId, [
            ...links.filter((link) => link.nodeLinkId !== data.nodeLinkId),
          ])
          toast.success('자료가 삭제되었습니다.')
        },
        onError: (err) => {
          console.log(err)
          toast.error(
            err instanceof Error
              ? err.message
              : '자료 삭제 중 오류가 발생했습니다.'
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

export default DeleteNodeLinkButton
