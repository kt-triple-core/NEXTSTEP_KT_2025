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
}

const useWorkspaceStore = create<WorkspaceStore>((set, get) => ({
  nodes: initialNodes,
  edges: [],

  onNodesChange: (changes) =>
    set((state) => ({
      nodes: applyNodeChanges<CustomNode>(changes, state.nodes),
    })),
  onEdgesChange: (changes) =>
    set((state) => ({
      edges: applyEdgeChanges(changes, state.edges),
    })),

  setNodes: (nodes) =>
    set({ nodes: typeof nodes === 'function' ? nodes(get().nodes) : nodes }),
  setEdges: (edges) =>
    set({ edges: typeof edges === 'function' ? edges(get().edges) : edges }),

  selectedNode: null,
  setSelectedNode: (id) => set({ selectedNode: id }),
}))

export default useWorkspaceStore
