import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreVertical } from '@/shared/ui/icon'
import { useOpen } from '@/shared/model'
import { UpdateWorkspaceTitleModal } from '@/features/workspace/updateWorkspaceTitle/ui'
import { DeleteWorkspaceModal } from '@/features/workspace/deleteWorkspace/ui'

const ListDropdownMenu = ({
  title,
  workspaceId,
}: {
  title: string
  workspaceId: string
}) => {
  const { isOpen, setIsOpen } = useOpen()
  const { isOpen: isOpenTitleEdit, setIsOpen: setIsOpenTitleEdit } = useOpen()
  const { isOpen: isOpenDelete, setIsOpen: setIsOpenDelete } = useOpen()

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <button className="hover:bg-primary rounded-full p-4 hover:cursor-pointer">
            <MoreVertical />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem
            className="focus:bg-primary h-35 px-5"
            onSelect={() => setIsOpenTitleEdit(true)}
          >
            이름 변경
          </DropdownMenuItem>
          <DropdownMenuItem
            className="focus:bg-primary h-35 px-5"
            onSelect={() => setIsOpenDelete(true)}
          >
            삭제
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {/* 워크스페이스 이름 변경 모달 */}
      <UpdateWorkspaceTitleModal
        isOpen={isOpenTitleEdit}
        setIsOpen={setIsOpenTitleEdit}
        title={title}
        workspaceId={workspaceId}
      />
      {/* 워크스페이스 삭제 알림 모달 */}
      <DeleteWorkspaceModal
        isOpen={isOpenDelete}
        setIsOpen={setIsOpenDelete}
        workspaceId={workspaceId}
      />
    </div>
  )
}

export default ListDropdownMenu
