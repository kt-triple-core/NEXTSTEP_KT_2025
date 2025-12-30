import { api } from '@/shared/libs/axios'
import {
  CustomNodeType,
  WorkspaceSnapshot,
} from '@/widgets/workspace/model/types'
import { Edge } from '@xyflow/react'

interface saveWorkspaceParams {
  workspaceId?: string // 있으면 PUT, 없으면 POST
  title: string
  nodes: CustomNodeType[]
  edges: Edge[]
  snapshot: WorkspaceSnapshot
}

const saveWorkspace = async (params: saveWorkspaceParams) => {
  const { workspaceId, ...body } = params

  // workspaceId 유무로 POST/PUT 분기
  if (workspaceId) {
    // 업데이트
    const { data } = await api.put(`/workspaces/${workspaceId}`, body)
    return data.content
  } else {
    // 새로 생성
    const { data } = await api.post('/workspaces', body)
    return data.content
  }
}

export default saveWorkspace
