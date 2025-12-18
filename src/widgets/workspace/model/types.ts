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

// 워크스페이스 리스트 아이템 타입
export type WorkspaceListItem = {
  workspaceId: string
  title: string
  updatedAt: string
}
