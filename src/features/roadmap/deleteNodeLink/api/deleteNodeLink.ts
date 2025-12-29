import { api } from '@/shared/libs/axios'

interface deleteNodeLinkParams {
  nodeLinkId: string
}

const deleteNodeLink = async (params: deleteNodeLinkParams) => {
  const { data } = await api.delete('/nodes/link', { params: { ...params } })
  return data.content
}

export default deleteNodeLink
