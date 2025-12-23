import { api } from '@/shared/libs/axios'

interface postNodeLinkParams {
  techId: string
  linkTitle: string
  linkUrl: string
}

const postNodeLink = async (params: postNodeLinkParams) => {
  const { data } = await api.post('/nodes/link', params)
  return data.content
}

export default postNodeLink
