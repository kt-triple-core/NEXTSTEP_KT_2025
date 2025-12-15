import { useWorkspaceStore } from '@/widgets/workspace/model'
import { CustomNode } from '@/widgets/workspace/model/types'
import { NodeMouseHandler } from '@xyflow/react'
import { useCallback } from 'react'

// 특정 노드를 선택
const useSelectNode = () => {
  const { selectedNode, setSelectedNode } = useWorkspaceStore()
  const onNodeClick: NodeMouseHandler<CustomNode> = useCallback(
    (event, node) => {
      // start 노드는 선택 X
      if (node.id === '1') return
      // 이미 선택된 노드를 선택
      if (node.id === selectedNode?.id) {
        setSelectedNode(null)
        return
      }
      setSelectedNode(node)
    },
    [selectedNode, setSelectedNode]
  )
  return { onNodeClick }
}

export default useSelectNode
