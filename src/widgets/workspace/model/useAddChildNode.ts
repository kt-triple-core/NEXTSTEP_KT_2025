import { useCallback, useRef } from 'react'
import { useWorkspaceStore, NODE_STYLE } from '../model'
import { CustomNodeType } from '../model/types'

interface TechItem {
  tech_id?: string
  name?: string
  icon_url?: string
}

/**
 * AI 추천 결과에서 선택된 노드의 자식 노드를 추가하는 훅
 *
 * @example
 * const { addChildNode, resetCounter } = useAddChildNode(selectedNode)
 *
 * // 추천 모드 진입 시
 * resetCounter()
 *
 * // 노드 추가 시
 * addChildNode(techItem)
 */
const useAddChildNode = (selectedNode: CustomNodeType | null) => {
  const { nodes, edges, setNodes, setEdges } = useWorkspaceStore()

  // 자식 노드 개수 추적 (위치 분산용)
  const childNodeCountRef = useRef<number>(0)

  // 추천 모드 진입 시 카운터 초기화
  const resetCounter = useCallback(() => {
    childNodeCountRef.current = 0
  }, [])

  // 자식 노드 추가 함수
  const addChildNode = useCallback(
    (techItem: TechItem) => {
      if (!selectedNode) {
        console.warn('선택된 노드가 없습니다.')
        return
      }

      // 1. 새로운 노드 ID 생성
      const newId = `${nodes.length + 1}`

      // 2. 위치 계산 - 아래쪽으로만 펼쳐지도록 배치
      const childIndex = childNodeCountRef.current
      const baseOffsetY = 150 // 부모로부터 아래로 150px
      const horizontalSpacing = 180 // 좌우 간격

      // 중앙을 기준으로 좌우로 번갈아 배치
      // 0번째: 중앙, 1번째: 왼쪽, 2번째: 오른쪽, 3번째: 더 왼쪽, 4번째: 더 오른쪽...
      let offsetX = 0
      if (childIndex > 0) {
        const isLeft = childIndex % 2 === 1
        const distance = Math.ceil(childIndex / 2) * horizontalSpacing
        offsetX = isLeft ? -distance : distance
      }

      const offsetY = baseOffsetY

      // 3. 새 노드 생성
      const newNode: CustomNodeType = {
        id: newId,
        type: 'custom',
        position: {
          x: selectedNode.position.x + offsetX,
          y: selectedNode.position.y + offsetY,
        },
        data: {
          techId: techItem.tech_id || null,
          label: techItem.name || '새 노드',
          iconUrl: techItem.icon_url || null,
        },
        style: { ...NODE_STYLE.default },
      }

      // 4. 새로운 엣지 생성 (선택된 노드 → 새 노드)
      const newEdge = {
        id: `e${selectedNode.id}-${newId}`,
        source: selectedNode.id,
        target: newId,
        animated: true,
      }

      // 5. 상태 업데이트
      setNodes((nds) => [...nds, newNode])
      setEdges((eds) => [...eds, newEdge])

      // 6. 자식 노드 카운터 증가
      childNodeCountRef.current += 1

      console.log(`하위 노드 추가: ${techItem.name} (위치: ${childIndex}번째)`)
    },
    [selectedNode, nodes, edges, setNodes, setEdges]
  )

  return {
    addChildNode,
    resetCounter,
  }
}

export default useAddChildNode
