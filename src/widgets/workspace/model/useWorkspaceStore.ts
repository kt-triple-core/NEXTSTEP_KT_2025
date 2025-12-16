import { create } from 'zustand'
import {
  applyEdgeChanges,
  applyNodeChanges,
  Edge,
  EdgeChange,
  NodeChange,
} from '@xyflow/react'
import { initialNodes } from './constants'
import { CustomNode } from './types'

type WorkspaceStore = {
  // ReactFlow의 노드와 엣지
  nodes: CustomNode[]
  edges: Edge[]
  setNodes: (
    nodes: CustomNode[] | ((nodes: CustomNode[]) => CustomNode[])
  ) => void
  setEdges: (edges: Edge[] | ((edges: Edge[]) => Edge[])) => void
  onNodesChange: (changes: NodeChange<CustomNode>[]) => void
  onEdgesChange: (changes: EdgeChange[]) => void

  // 선택된 노드
  selectedNode: CustomNode | null
  setSelectedNode: (node: CustomNode | null) => void

  // 현재 워크스페이스 정보
  workspaceId: string | null
  setWorkspaceId: (id: string | null) => void
  workspaceTitle: string | null
  setWorkspaceTitle: (title: string | null) => void
  lastSaved: Date | null
  setLastSaved: (date: Date | null) => void
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
      nodes: applyNodeChanges<CustomNode>(changes, state.nodes),
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
}))

export default useWorkspaceStore
