'use client'

import { ReactFlow, Background } from '@xyflow/react'
import '@xyflow/react/dist/style.css'

type CommunityCardProps = {
  title?: string
  nodes?: any[]
  edges?: any[]
  onClick?: () => void
}

export default function CommunityCard({
  title,
  nodes = [],
  edges = [],
  onClick,
}: CommunityCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="bg-secondary flex h-300 flex-col overflow-hidden rounded-2xl text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
    >
      {/* 🔹 상단 그래프 미리보기 영역 */}
      <div className="bg-foreground-light pointer-events-none flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          fitView
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          zoomOnScroll={false}
          zoomOnDoubleClick={false}
          panOnScroll={false}
        >
          <Background />
        </ReactFlow>
      </div>

      {/* 🔹 하단 영역 */}
      <div className="bg-primary flex items-center gap-12 px-4 py-14">
        {/* 왼쪽 프로필 자리 (+ 아이콘 자리) */}
        <div className="bg-accent flex h-30 w-30 items-center justify-center rounded-2xl text-xl font-bold text-white">
          +
        </div>

        {/* 제목 */}
        {title && (
          <p className="text-foreground line-clamp-1 text-sm font-medium">
            {title}
          </p>
        )}
      </div>
    </button>
  )
}
