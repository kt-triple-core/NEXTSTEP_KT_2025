import { Edge, Node } from '@xyflow/react'

type CustomNodeData = {
  label: string
}

export type CustomNode = Node<CustomNodeData>

// 워크스페이스 정보 타입
export type WorkspaceData = {
  workspaceId: string
  title: string
  nodes: CustomNode[]
  edges: Edge[]
  updatedAt: string
}
