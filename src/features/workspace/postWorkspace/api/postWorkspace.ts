import { api } from '@/shared/libs/axios'
import { CustomNode } from '@/widgets/workspace/model/types'
import { Edge } from '@xyflow/react'

interface postWorkspaceParams {
  workspaceId?: string // 있으면 PUT, 없으면 POST
  title: string
  content: string | null
  nodes: CustomNode[]
  edges: Edge[]
  listId: string
}

const postWorkspace = async (params: postWorkspaceParams) => {
  const { data } = await api.post('/community/posts', params)
  return data.content
}

export default postWorkspace
