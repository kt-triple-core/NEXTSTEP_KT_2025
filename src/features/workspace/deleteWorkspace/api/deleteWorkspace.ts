import { api } from '@/shared/libs/axios'

const deleteWorkspace = async (workspaceId: string) => {
  // 워크스페이스 삭제
  const { data } = await api.delete(`/workspaces/${workspaceId}`)
  return data.content
}

export default deleteWorkspace
