import { Workspace } from '@/widgets/workspace/ui'
import { ReactFlowProvider } from '@xyflow/react'

export default function Main() {
  return (
    <div className="h-full w-full">
      <ReactFlowProvider>
        <Workspace />
      </ReactFlowProvider>
    </div>
  )
}
