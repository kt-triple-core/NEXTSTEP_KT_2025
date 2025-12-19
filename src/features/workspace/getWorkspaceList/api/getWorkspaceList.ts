import { api } from '@/shared/libs/axios'

const getWorkspaceList = async () => {
  const { data } = await api.get(`/workspaces/lists`)
  return data.content
}

export default getWorkspaceList
