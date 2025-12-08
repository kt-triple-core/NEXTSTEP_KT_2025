import { Edge } from '@xyflow/react'

const findDescendants = (nodeId: string, edges: Edge[]): Set<string> => {
  const descendants = new Set([nodeId])

  // 재귀로 모든 후손 찾기
  const findChildren = (id: string) => {
    edges.forEach((edge) => {
      if (edge.source === id && !descendants.has(edge.target)) {
        descendants.add(edge.target)
        findChildren(edge.target)
      }
    })
  }

  findChildren(nodeId)
  return descendants
}

export default findDescendants
