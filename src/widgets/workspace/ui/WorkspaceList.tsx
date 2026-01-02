import { useGetWorkspaceList } from '@/features/workspace/getWorkspaceList/model'
import { useOpen } from '@/shared/model'
import { Button } from '@/shared/ui'
import { List } from '@/shared/ui/icon'
import { WorkspaceListItem } from '../model/types'
import { formatKoreaTime } from '@/shared/libs/formatKoreaTime'
import { useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import ListDropdownMenu from './ListDropdownMenu'
import { useWorkspaceStore } from '../model'
import { usePreventNavigation } from '@/shared/model/usePreventNavigation'

const WorkspaceList = () => {
  const { isOpen, toggleOpen } = useOpen()
  const { status } = useSession()
  const { data } = useGetWorkspaceList({
    enabled: status === 'authenticated',
  })

  const searchParams = useSearchParams()
  const currentWorkspaceId = searchParams.get('workspace')

  const isEdited = useWorkspaceStore((s) => s.isEdited)
  const { safeNavigate } = usePreventNavigation({
    when: isEdited,
    message:
      '저장하지 않은 변경사항이 있습니다. 워크스페이스를 전환하시겠습니까?',
  })

  // workspaceId를 쿼리에 넣는 함수
  const handleSelectWorkspace = (id: string | null) => {
    const query = new URLSearchParams(window.location.search)
    if (id) {
      query.set('workspace', id)
    } else {
      query.delete('workspace')
    }
    safeNavigate(`${window.location.pathname}?${query.toString()}`)
  }

  return (
    <>
      <div className="absolute top-10 left-10">
        <Button
          variant="primary"
          className="h-50 w-50 shrink-0"
          onClick={toggleOpen}
        >
          <List />
        </Button>
      </div>
      <div className={`absolute top-70 bottom-10 left-10 w-0`}>
        <div
          className={`bg-primary scrollbar-hide ${isOpen ? 'h-full' : 'h-0'} w-250 overflow-y-auto rounded-md transition-[height]`}
        >
          <div className="flex flex-col justify-between gap-10 p-10">
            <div
              className={`w-full rounded-lg p-10 hover:cursor-pointer ${currentWorkspaceId === null ? 'bg-accent text-white' : 'bg-secondary'}`}
              onClick={() => handleSelectWorkspace(null)}
            >
              빈 워크스페이스
            </div>
            {data &&
              data.map((item: WorkspaceListItem) => (
                <div
                  className={`flex h-80 w-full flex-col justify-between rounded-lg p-10 hover:cursor-pointer ${item.workspaceId === currentWorkspaceId ? 'bg-accent text-white' : 'bg-secondary'}`}
                  key={item.workspaceId + '-' + item.title}
                  onClick={() => handleSelectWorkspace(item.workspaceId)}
                >
                  <div className="flex items-center justify-between">
                    <p className="line-clamp-1">{item.title}</p>
                    <ListDropdownMenu
                      title={item.title}
                      workspaceId={item.workspaceId}
                    />
                  </div>
                  <p className="text-12 text-start">
                    {formatKoreaTime(item.updatedAt, 'date')}
                  </p>
                </div>
              ))}
          </div>
        </div>
      </div>
    </>
  )
}

export default WorkspaceList
