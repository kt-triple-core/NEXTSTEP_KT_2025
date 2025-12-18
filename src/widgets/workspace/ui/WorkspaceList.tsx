import { useGetWorkspaceList } from '@/features/workspace/getWorkspaceList/model'
import { useOpen } from '@/shared/model'
import { Button } from '@/shared/ui'
import { List } from '@/shared/ui/icon'
import { WorkspaceListItem } from '../model/types'
import { formatKoreaTime } from '@/shared/libs/formatKoreaTime'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'

const WorkspaceList = () => {
  const { isOpen, toggleOpen } = useOpen()
  const { status } = useSession()
  const { data } = useGetWorkspaceList({
    enabled: status === 'authenticated',
  })

  const searchParams = useSearchParams()
  const currentWorkspaceId = searchParams.get('workspace')

  const router = useRouter()

  // workspaceId를 쿼리에 넣는 함수
  const handleSelectWorkspace = (id: string | null) => {
    const query = new URLSearchParams(window.location.search)
    if (id) {
      query.set('workspace', id)
    } else {
      query.delete('workspace')
    }
    router.push(`${window.location.pathname}?${query.toString()}`)
  }

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
        <div className="flex flex-col justify-between gap-10 p-10">
          <div
            className={`w-full rounded-lg p-10 hover:cursor-pointer ${currentWorkspaceId === null ? 'bg-accent' : 'bg-secondary'}`}
            onClick={() => handleSelectWorkspace(null)}
          >
            빈 워크스페이스
          </div>
          {data &&
            data.map((item: WorkspaceListItem) => (
              <div
                className={`flex h-80 w-full flex-col justify-between rounded-lg p-10 hover:cursor-pointer ${item.workspaceId === currentWorkspaceId ? 'bg-accent' : 'bg-secondary'}`}
                key={item.workspaceId}
                onClick={() => handleSelectWorkspace(item.workspaceId)}
              >
                <p>{item.title}</p>
                <p className="text-12 text-end">
                  {formatKoreaTime(item.updatedAt, 'date')}
                </p>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}

export default WorkspaceList
