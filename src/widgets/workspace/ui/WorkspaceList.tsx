import { useOpen } from '@/shared/model'
import { Button } from '@/shared/ui'
import { List } from '@/shared/ui/icon'

const DATA = [
  { workspaceId: 1, title: '프론트엔드 로드맵1', updatedAt: '2025-12-11' },
  { workspaceId: 2, title: '프론트엔드 로드맵2', updatedAt: '2025-12-11' },
  { workspaceId: 3, title: '프론트엔드 로드맵3', updatedAt: '2025-12-12' },
  { workspaceId: 4, title: '프론트엔드 로드맵4', updatedAt: '2025-12-12' },
]
const WorkspaceList = () => {
  const { isOpen, toggleOpen } = useOpen()

  return (
    <div className="absolute top-10 bottom-10 left-10 flex w-200 flex-col gap-10">
      <Button
        variant="primary"
        className="h-50 w-50 shrink-0"
        onClick={toggleOpen}
      >
        <List />
      </Button>
      <div
        className={`bg-primary overflow-y-auto rounded-md ${isOpen ? 'h-full border-y-2' : 'h-0'} scrollbar-hide border-primary transition-[height]`}
      >
        <div className="flex flex-col gap-10 p-10">
          {DATA.map((item) => (
            <div
              className="bg-secondary h-100 w-full rounded-lg hover:cursor-pointer"
              key={item.workspaceId}
            ></div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default WorkspaceList
