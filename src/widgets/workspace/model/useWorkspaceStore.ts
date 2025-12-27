import { create } from 'zustand'
import {
  applyEdgeChanges,
  applyNodeChanges,
  Edge,
  EdgeChange,
  NodeChange,
} from '@xyflow/react'
import { initialNodes } from './constants'
import {
  CustomNodeType,
  NodeLink,
  NodeMemo,
  NodeTroubleshooting,
  WorkspaceData,
} from './types'

type WorkspaceStore = {
  // ReactFlow의 노드와 엣지
  nodes: CustomNodeType[]
  edges: Edge[]
  setNodes: (
    nodes: CustomNodeType[] | ((nodes: CustomNodeType[]) => CustomNodeType[])
  ) => void
  setEdges: (edges: Edge[] | ((edges: Edge[]) => Edge[])) => void
  onNodesChange: (changes: NodeChange<CustomNodeType>[]) => void
  onEdgesChange: (changes: EdgeChange[]) => void

  // 선택된 노드
  selectedNode: CustomNodeType | null
  setSelectedNode: (node: CustomNodeType | null) => void

  // 현재 워크스페이스 정보
  workspaceId: string | null
  setWorkspaceId: (id: string | null) => void
  workspaceTitle: string | null
  setWorkspaceTitle: (title: string | null) => void
  lastSaved: Date | null
  setLastSaved: (date: Date | null) => void

  // 노드별 데이터
  nodeMemos: Record<string, NodeMemo>
  nodeLinks: Record<string, NodeLink[]>
  nodeTroubleshootings: Record<string, NodeTroubleshooting[]>
  setNodeMemos: (techId: string, memo: NodeMemo) => void
  setNodeLinks: (techId: string, links: NodeLink[]) => void
  setNodeTroubleshootings: (
    techId: string,
    troubleshootings: NodeTroubleshooting[]
  ) => void

  // 특정 techId의 데이터 가져오기
  getNodeMemo: (techId: string | null) => NodeMemo | null
  getNodeLinks: (techId: string | null) => NodeLink[]
  getNodeTroubleshootings: (techId: string | null) => NodeTroubleshooting[]

  // store 초기화
  initializeWithData: (data: WorkspaceData) => void
  resetToEmpty: () => void
}

const useWorkspaceStore = create<WorkspaceStore>((set, get) => ({
  nodes: initialNodes,
  edges: [],

  setNodes: (nodes) =>
    set({ nodes: typeof nodes === 'function' ? nodes(get().nodes) : nodes }),
  setEdges: (edges) =>
    set({ edges: typeof edges === 'function' ? edges(get().edges) : edges }),

  onNodesChange: (changes) =>
    set((state) => ({
      nodes: applyNodeChanges<CustomNodeType>(changes, state.nodes),
    })),
  onEdgesChange: (changes) =>
    set((state) => ({
      edges: applyEdgeChanges(changes, state.edges),
    })),

  selectedNode: null,
  setSelectedNode: (node) =>
    set((state) => ({
      selectedNode: node,
      nodes: state.nodes.map((n) => ({
        ...n,
        selected: n.id === node?.id,
        style: {
          ...n.style,
          border:
            n.id === node?.id
              ? '1px solid var(--color-accent)'
              : '1px solid  var(--color-primary)',
        },
      })),
    })),

  workspaceId: null,
  setWorkspaceId: (id) => set({ workspaceId: id }),
  workspaceTitle: '새 워크스페이스',
  setWorkspaceTitle: (title) => set({ workspaceTitle: title }),
  lastSaved: null,
  setLastSaved: (date) => set({ lastSaved: date }),

  nodeMemos: {},
  nodeLinks: {},
  nodeTroubleshootings: {},

  setNodeMemos: (techId: string, memo: NodeMemo) =>
    set((state) => ({
      nodeMemos: {
        ...state.nodeMemos,
        [techId]: memo,
      },
    })),

  setNodeLinks: (techId: string, links: NodeLink[]) =>
    set((state) => ({
      nodeLinks: {
        ...state.nodeLinks,
        [techId]: links,
      },
    })),

  setNodeTroubleshootings: (
    techId: string,
    troubleshootings: NodeTroubleshooting[]
  ) =>
    set((state) => ({
      nodeTroubleshootings: {
        ...state.nodeTroubleshootings,
        [techId]: troubleshootings,
      },
    })),

  getNodeMemo: (techId) => {
    if (!techId) return null
    return get().nodeMemos[techId] || null
  },
  getNodeLinks: (techId) => {
    if (!techId) return []
    return get().nodeLinks[techId] || []
  },
  getNodeTroubleshootings: (techId) => {
    if (!techId) return []
    return get().nodeTroubleshootings[techId] || []
  },

  initializeWithData: (data) =>
    set({
      workspaceId: data.workspaceId,
      workspaceTitle: data.title,
      nodes: data.nodes || initialNodes,
      edges: data.edges || [],
      lastSaved: new Date(data.updatedAt),
      nodeMemos: data.memos || {},
      nodeLinks: data.links || {},
      nodeTroubleshootings: data.troubleshootings || {},
    }),

  // 빈 워크스페이스로 리셋
  resetToEmpty: () =>
    set({
      nodes: initialNodes,
      edges: [],
      workspaceId: null,
      workspaceTitle: '새 워크스페이스',
      lastSaved: null,
      selectedNode: null,
      nodeMemos: {},
      nodeLinks: {},
      nodeTroubleshootings: {},
    }),
}))

export default useWorkspaceStore
