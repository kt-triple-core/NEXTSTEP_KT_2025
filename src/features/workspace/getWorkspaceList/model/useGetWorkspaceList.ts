import { useQuery } from '@tanstack/react-query'
import { getWorkspaceList } from '../api'

// workspaceId의 워크스페이스 정보를 가져오는 훅
const useGetWorkspaceList = () => {
  return useQuery({
    queryKey: ['workspace-list'],
    queryFn: getWorkspaceList,
  })
}

export default useGetWorkspaceList
