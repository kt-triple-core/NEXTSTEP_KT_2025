import { useWorkspaceStore } from '@/widgets/workspace/model'
import { addEdge, OnConnect } from '@xyflow/react'
import { useCallback } from 'react'

// 서로 다른 노드를 엣지로 연결
const useConnectNodes = () => {
  const { setEdges } = useWorkspaceStore()
  const onConnect: OnConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges]
  )

  return { onConnect }
}

export default useConnectNodes
