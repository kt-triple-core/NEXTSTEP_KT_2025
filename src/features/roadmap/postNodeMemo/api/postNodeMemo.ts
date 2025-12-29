import { api } from '@/shared/libs/axios'

interface postNodeMemoParams {
  techId: string
  memo: string
}

const postNodeMemo = async (params: postNodeMemoParams) => {
  const { data } = await api.post('/nodes/memo', params)
  return data.content
}

export default postNodeMemo
