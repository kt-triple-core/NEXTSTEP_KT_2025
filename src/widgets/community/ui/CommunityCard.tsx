'use client'

import { ReactFlow, Background, BackgroundVariant } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import ProfileAvatar from '@/shared/ui/profile/ProfileAvatar'
import { useThemeStore } from '@/features/theme/model'

type CommunityCardProps = {
  title?: string
  nodes?: any[]
  edges?: any[]
  userName?: string | null
  userImage?: string | null
  onClick?: () => void
}

export default function CommunityCard({
  title,
  nodes = [],
  edges = [],
  userName,
  userImage,
  onClick,
}: CommunityCardProps) {
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'

  // ✅ 워크스페이스와 맞춘 배경 색
  const bgColor = isDark ? '#1f2937' : '#e5e5e5'
  const gridColor = isDark ? '#374151' : '#d1d5db'

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-300 flex-col overflow-hidden rounded-2xl text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
      style={{ backgroundColor: bgColor }}
    >
      {/* 🔹 상단 워크스페이스 미리보기 */}
      <div
        className="pointer-events-none flex-1"
        style={{ backgroundColor: bgColor }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          fitView
          fitViewOptions={{ padding: 0.4 }}
          nodesDraggable={false}
          nodesConnectable={false}
          zoomOnScroll={false}
          zoomOnDoubleClick={false}
          panOnScroll={false}
          panOnDrag={false}
          proOptions={{ hideAttribution: true }}
        >
          {/* ✅ 다크/라이트 모드 대응 배경 */}
          <Background variant={BackgroundVariant.Lines} color={gridColor} />
        </ReactFlow>
      </div>

      {/* 🔹 하단 정보 영역 */}
      <div className="bg-primary flex items-center gap-12 px-4 py-14">
        <div className="bg-accent flex h-30 w-30 items-center justify-center rounded-2xl">
          <ProfileAvatar name={userName} image={userImage} size={30} />
        </div>

        {title && (
          <p className="text-foreground line-clamp-1 text-sm font-medium">
            {title}
          </p>
        )}
      </div>
    </button>
  )
}
