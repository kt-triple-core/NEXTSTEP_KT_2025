import { api } from '@/shared/libs/axios'

const getWorkspaceList = async () => {
  const { data } = await api.get(`/workspace/list`)
  return data.content
}

export default getWorkspaceList
