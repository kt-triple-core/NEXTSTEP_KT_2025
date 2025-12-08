import { NODE_STYLE } from '@/widgets/workspace/model'
import { Node } from '@xyflow/react'
import { useCallback } from 'react'

const useSelectNode = (
  selectedNode: string | null,
  setSelectedNode: (id: string | null) => void,
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>
) => {
  const selectNode = useCallback(
    (nodeId: string) => {
      let selectedNodeId = null
      if (selectedNode === nodeId) {
        setSelectedNode(null)
      } else {
        setSelectedNode(nodeId)
        selectedNodeId = nodeId
      }

      // 모든 노드의 스타일 초기화
      // 해당 노드 id는 선택 스타일 적용
      setNodes((node) =>
        node.map((n) => ({
          ...n,
          style: {
            ...n.style,
            border:
              n.id === selectedNodeId
                ? NODE_STYLE.selected.border
                : NODE_STYLE.default.border,
          },
        }))
      )
    },
    [selectedNode, setSelectedNode, setNodes]
  )
  return { selectNode }
}

export default useSelectNode
