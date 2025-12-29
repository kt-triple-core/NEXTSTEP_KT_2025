import { api } from '@/shared/libs/axios'

const getWorkspace = async (workspaceId: string) => {
  const response = await api.get(`/workspaces/${workspaceId}`, {
    validateStatus: (status) => status < 500,
  })

  // 해당 워크스페이스가 없을 때
  if (response.status === 404) {
    throw new Error('Workspace not found')
  }

  return response.data.content
}

export default getWorkspace
