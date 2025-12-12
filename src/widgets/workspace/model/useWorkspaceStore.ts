import { create } from 'zustand'
import { Edge } from '@xyflow/react'
import { initialNodes } from './constants'
import { CustomNode } from './types'
import { AddingPositionType } from '@/features/roadmap/selectNode/model/types'

type WorkspaceStore = {
  // ReactFlow의 노드와 엣지
  nodes: CustomNode[]
  edges: Edge[]
  setNodes: React.Dispatch<React.SetStateAction<CustomNode[]>>
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>

  // 선택된 노드
  selectedNode: string | null
  setSelectedNode: (id: string | null) => void

  // 현재 노드에서 추가할 방향
  // preceding -> 부모에 추가(선행 학습)
  // following -> 자식에 추가(후행 학습)
  addingPosition: AddingPositionType
  setAddingPosition: (position: AddingPositionType) => void
}

const useWorkspaceStore = create<WorkspaceStore>((set, get) => ({
  nodes: initialNodes,
  edges: [],

  setNodes: (value) => {
    const newNodes = typeof value === 'function' ? value(get().nodes) : value
    set({ nodes: newNodes })
  },
  setEdges: (value) => {
    const newEdges = typeof value === 'function' ? value(get().edges) : value
    set({ edges: newEdges })
  },

  selectedNode: null,
  setSelectedNode: (id) => set({ selectedNode: id }),

  // 기본 추가 방향은 자식 방향
  addingPosition: 'following',
  setAddingPosition: (position) => {
    set({ addingPosition: position })
  },
}))

export default useWorkspaceStore
