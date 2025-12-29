import { api } from '@/shared/libs/axios'

interface postNodeTroubleshootingParams {
  techId: string
  troubleshooting: string
}

const postNodeTroubleshooting = async (
  params: postNodeTroubleshootingParams
) => {
  const { data } = await api.post('/nodes/troubleshooting', params)
  return data.content
}

export default postNodeTroubleshooting
