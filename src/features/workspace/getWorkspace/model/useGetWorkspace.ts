import { useQuery } from '@tanstack/react-query'
import { getWorkspace } from '../api'

// workspaceId의 워크스페이스 정보를 가져오는 훅
const useGetWorkspace = (workspaceId: string | null) => {
  return useQuery({
    queryKey: ['workspace', workspaceId],
    queryFn: () => getWorkspace(workspaceId as string),
    enabled: !!workspaceId,
  })
}

export default useGetWorkspace
