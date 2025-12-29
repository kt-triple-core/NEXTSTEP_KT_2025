import { api } from '@/shared/libs/axios'

interface deleteNodeTroubleshootingParams {
  nodeTroubleshootingId: string
}

const deleteNodeTroubleshooting = async (
  params: deleteNodeTroubleshootingParams
) => {
  const { data } = await api.delete('/nodes/troubleshooting', {
    params: { ...params },
  })
  return data.content
}

export default deleteNodeTroubleshooting
