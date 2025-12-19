import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreVertical } from '@/shared/ui/icon'
import { useOpen } from '@/shared/model'

const ListDropdownMenu = () => {
  const { isOpen, setIsOpen } = useOpen()

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <button className="hover:bg-primary rounded-full p-4 hover:cursor-pointer">
            <MoreVertical />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem className="focus:bg-primary h-35 px-5">
            이름 변경
          </DropdownMenuItem>
          <DropdownMenuItem className="focus:bg-primary h-35 px-5">
            삭제
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export default ListDropdownMenu
