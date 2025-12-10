'use client'
import {
  EDGE_STYLE,
  NODE_STYLE,
  useWorkspaceStore,
} from '@/widgets/workspace/model'
import { MarkerType } from '@xyflow/react'

const useAddNode = () => {
  const { nodes, edges, selectedNode, setNodes, setEdges } = useWorkspaceStore()

  const add = () => {
    if (!selectedNode) return

    const id = `${[...nodes].length + 1}`
    const newNode = {
      id,
      data: { label: `새 노드 ${id}` },
      position: { x: 0, y: 0 },
      style: { ...NODE_STYLE.default },
    }

    const newEdge = {
      id: `e${selectedNode}-${id}`,
      source: selectedNode,
      target: id,
      type: 'default',
      animated: true,
      style: { stroke: EDGE_STYLE.stroke, strokeWidth: EDGE_STYLE.strokeWidth },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: EDGE_STYLE.markerEndColor,
      },
    }

    setNodes([...nodes, newNode])
    setEdges([...edges, newEdge])
  }

  return { add }
}

export default useAddNode
