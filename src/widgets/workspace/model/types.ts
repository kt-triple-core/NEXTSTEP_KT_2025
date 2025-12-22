import { Edge, Node } from '@xyflow/react'

export type CustomNodeDataType = {
  label: string | null
  iconUrl?: string
}

export type CustomNodeType = Node<CustomNodeDataType>

// 워크스페이스 정보 타입
export type WorkspaceData = {
  workspaceId: string
  title: string
  nodes: CustomNodeType[]
  edges: Edge[]
  updatedAt: string
}

// 워크스페이스 리스트 아이템 타입
export type WorkspaceListItem = {
  workspaceId: string
  title: string
  updatedAt: string
}
