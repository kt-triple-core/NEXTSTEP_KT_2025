'use client'

import { ReactFlow } from '@xyflow/react'
import '@xyflow/react/dist/style.css'

type Props = {
  nodes: any
  edges: any
}

export default function WorkspacePreview({ nodes, edges }: Props) {
  return (
    <div className="pointer-events-none h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        zoomOnScroll={false}
        panOnDrag={false}
      />
    </div>
  )
}
