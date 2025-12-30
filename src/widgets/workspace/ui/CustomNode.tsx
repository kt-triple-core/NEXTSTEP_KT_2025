import { Handle, Position } from '@xyflow/react'
import { CustomNodeDataType } from '../model/types'
import { useWorkspaceStore } from '../model'

// 이미지가 있는 커스텀 노드
const CustomNode = ({ data }: { data: CustomNodeDataType }) => {
  const techId = data.techId

  const hasMemo = useWorkspaceStore(
    (s) => !!techId && !!s.current.memos[techId]?.memo
  )
  const hasLink = useWorkspaceStore(
    (s) => !!techId && (s.current.links[techId]?.length ?? 0) > 0
  )
  const hasTroubleshooting = useWorkspaceStore(
    (s) => !!techId && (s.current.troubleshootings[techId]?.length ?? 0) > 0
  )
  return (
    <div>
      <Handle type="target" position={Position.Top} className="h-3 w-3" />
      <div className="flex items-center justify-center gap-3">
        {data.iconUrl && (
          <img
            src={data.iconUrl}
            alt={data.label || '새 노드'}
            className="h-20 w-20 object-cover"
          />
        )}
        <div>{data.label || '새 노드'}</div>
      </div>
      <div className="absolute top-2 right-2 flex gap-2">
        {hasMemo && <span className="h-3 w-3 rounded-full bg-blue-500" />}
        {hasLink && <span className="h-3 w-3 rounded-full bg-green-500" />}
        {hasTroubleshooting && (
          <span className="h-3 w-3 rounded-full bg-red-500" />
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="h-3 w-3" />
    </div>
  )
}

export default CustomNode
