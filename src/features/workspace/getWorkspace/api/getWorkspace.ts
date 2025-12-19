import { api } from '@/shared/libs/axios'

const getWorkspace = async (workspaceId: string) => {
  const { data } = await api.get(`/workspaces/${workspaceId}`)
  return data.content
}

export default getWorkspace
