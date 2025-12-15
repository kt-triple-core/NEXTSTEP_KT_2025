import { create } from 'zustand'
import { Edge } from '@xyflow/react'
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

  // 선택된 노드
  selectedNode: CustomNode | null
  setSelectedNode: (node: CustomNode | null) => void
}

const useWorkspaceStore = create<WorkspaceStore>((set, get) => ({
  nodes: initialNodes,
  edges: [],

  setNodes: (nodes) =>
    set({ nodes: typeof nodes === 'function' ? nodes(get().nodes) : nodes }),
  setEdges: (edges) =>
    set({ edges: typeof edges === 'function' ? edges(get().edges) : edges }),

  selectedNode: null,
  setSelectedNode: (id) => set({ selectedNode: id }),
}))

export default useWorkspaceStore
