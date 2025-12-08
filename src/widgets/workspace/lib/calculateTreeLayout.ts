import { Edge, Node } from '@xyflow/react'

const LAYOUT_CONFIG = {
  nodeWidth: 100,
  nodeHeight: 50,
  horizontalSpacing: 150,
  verticalSpacing: 100,
  rootX: 0,
  rootY: 0,
}

// 트리 재배치
const calculateTreeLayout = (nodes: Node[], edges: Edge[]): Node[] => {
  // 부모-자식 관계 맵 생성
  const childrenMap: Record<string, string[]> = {}
  edges.forEach((edge) => {
    if (!childrenMap[edge.source]) {
      childrenMap[edge.source] = []
    }
    childrenMap[edge.source].push(edge.target)
  })

  // 루트 노드 찾기
  const childNodes = new Set(edges.map((e) => e.target))
  const rootNode = nodes.find((n) => !childNodes.has(n.id))

  if (!rootNode) return nodes

  // 서브트리 너비 계산
  // 해당 노드를 루트로 하는 서브 트리가 차지하는 너비
  // 재귀를 통해 리프 노드들의 너비부터 계산
  const calculateSubtreeWidth = (nodeId: string): number => {
    const children = childrenMap[nodeId] || []
    // 리프 노드의 경우에는 최소 너비 보장
    if (children.length === 0) {
      return LAYOUT_CONFIG.horizontalSpacing
    }
    return children.reduce(
      (sum, childId) => sum + calculateSubtreeWidth(childId),
      0
    )
  }

  // 노드 배치
  const positionedNodes: Node[] = []

  const positionNode = (nodeId: string, x: number, y: number) => {
    // 현재 노드
    const node = nodes.find((n) => n.id === nodeId)
    if (!node) return

    // 현재 노드 위치 설정
    positionedNodes.push({
      ...node,
      position: { x, y },
      width: LAYOUT_CONFIG.nodeWidth,
      height: LAYOUT_CONFIG.nodeHeight,
    })

    // 자식 노드 탐색
    const children = childrenMap[nodeId] || []
    if (children.length === 0) return

    const childWidths = children.map((childId) =>
      calculateSubtreeWidth(childId)
    )
    const totalWidth = childWidths.reduce((sum, w) => sum + w, 0)

    let currentX = x - totalWidth / 2
    children.forEach((childId, index) => {
      const childWidth = childWidths[index]
      positionNode(
        childId,
        currentX + childWidth / 2,
        y + LAYOUT_CONFIG.verticalSpacing
      )
      currentX += childWidth
    })
  }

  positionNode(rootNode.id, LAYOUT_CONFIG.rootX, LAYOUT_CONFIG.rootY)

  return positionedNodes
}

export default calculateTreeLayout
