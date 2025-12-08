'use client'

import { create } from 'zustand'
import { Node, Edge } from '@xyflow/react'

interface WorkspaceStore {
  nodes: Node[]
  edges: Edge[]
  selectedNode: string | null

  setNodes: (nodes: Node[]) => void
  setEdges: (edges: Edge[]) => void
  selectNode: (id: string | null) => void
}

const useWorkspaceStore = create<WorkspaceStore>((set) => ({
  nodes: [],
  edges: [],
  selectedNode: null,

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  selectNode: (id) => set({ selectedNode: id }),
}))

export default useWorkspaceStore
