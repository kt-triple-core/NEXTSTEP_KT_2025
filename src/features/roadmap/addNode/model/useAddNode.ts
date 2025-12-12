'use client'
import {
  EDGE_STYLE,
  NODE_STYLE,
  useWorkspaceStore,
} from '@/widgets/workspace/model'
import { MarkerType } from '@xyflow/react'

const useAddNode = () => {
  const { nodes, edges, selectedNode, setNodes, setEdges, addingPosition } =
    useWorkspaceStore()

  const add = () => {
    // 선택된 노드가 없으면 X
    if (!selectedNode) return
    // 루트 노드의 부모에 노드 추가 X
    if (selectedNode === '1' && addingPosition === 'preceding') return

    const newId = `${[...nodes].length + 1}`
    const newNode = {
      id: newId,
      data: { label: `새 노드 ${newId}` },
      position: { x: 0, y: 0 },
      style: { ...NODE_STYLE.default },
    }
    setNodes([...nodes, newNode])

    // 공통 엣지 스타일
    const edgeStyle = {
      type: 'default',
      animated: true,
      style: {
        stroke: EDGE_STYLE.stroke,
        strokeWidth: EDGE_STYLE.strokeWidth,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: EDGE_STYLE.markerEndColor,
      },
    }

    // 자식에 추가
    if (addingPosition === 'following') {
      const newEdge = {
        id: `e${selectedNode}-${newId}`,
        source: selectedNode,
        target: newId,
        ...edgeStyle,
      }
      setEdges([...edges, newEdge])
    }

    // 부모에 추가
    // P -> C 에서 P -> N -> C가 되는 과정
    // 기존 P -> C 연결을 끊고,
    // 새롭게 P -> N, N -> C 연결을 생성
    if (addingPosition === 'preceding') {
      // 1. target이 selectedNode인 엣지 찾기 (기존 부모 노드와 선택된 노드를 이어주는 엣지)
      const targetEdge = edges.find((edge) => edge.target === selectedNode)

      // 2. 해당 엣지의 source를 찾기 (기존 부모 노드의 id값)
      const parentId = targetEdge?.source
      if (!parentId) return

      // 3. 기존 엣지 삭제
      const filteredEdges = edges.filter((edge) => edge.target !== selectedNode)

      // 4. source -> new_id 의 엣지 생성
      const newEdge1 = {
        id: `e${parentId}-${newId}`,
        source: parentId,
        target: newId,
        ...edgeStyle,
      }

      // 5. new_id -> selectedNode 의 엣지 생성
      const newEdge2 = {
        id: `e${newId}-${selectedNode}`,
        source: newId,
        target: selectedNode,
        ...edgeStyle,
      }

      // 6. 엣지 저장
      setEdges([...filteredEdges, newEdge1, newEdge2])
    }
  }

  return { add }
}

export default useAddNode
