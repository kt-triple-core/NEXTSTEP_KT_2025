import { Edge, Node } from '@xyflow/react'

export type CustomNodeDataType = {
  techId: string | null
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
  memos: Record<string, NodeMemo>
  links: Record<string, NodeLink[]>
  troubleshootings: Record<string, NodeTroubleshooting[]>
}

// 워크스페이스 리스트 아이템 타입
export type WorkspaceListItem = {
  workspaceId: string
  title: string
  updatedAt: string
}

export type WorkspaceSnapshot = {
  memos: Record<string, NodeMemo>
  links: Record<string, NodeLink[]>
  troubleshootings: Record<string, NodeTroubleshooting[]>
}

export type NodeMemo = {
  memo: string
}

export type NodeLink = {
  nodeLinkId: string
  url: string
  title: string
  createdAt: string
  updatedAt: string
}

export type NodeTroubleshooting = {
  nodeTroubleshootingId: string
  troubleshooting: string
  createdAt: string
  updatedAt: string
}
