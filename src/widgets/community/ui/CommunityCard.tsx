'use client'

import { ReactFlow, Background, BackgroundVariant } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useThemeStore } from '@/features/theme/model'
import MyProfileAvatar from '@/features/profile/ui/MyProfileAvatar'
import CustomNode from '@/widgets/workspace/ui/CustomNode'

type CommunityCardProps = {
  title?: string
  nodes?: any[]
  edges?: any[]
  userName?: string | null
  userImage?: string | null
  onClick?: () => void
}

const CommunityCard = ({
  title,
  nodes = [],
  edges = [],
  userName,
  userImage,
  onClick,
}: CommunityCardProps) => {
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'

  const bgColor = isDark ? '#1f2937' : '#e5e5e5'
  const gridColor = isDark ? '#374151' : '#d1d5db'

  const nodeTypes = {
    custom: CustomNode,
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="bg-primary flex h-300 flex-col overflow-hidden rounded-2xl text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
      style={{ backgroundColor: bgColor }}
    >
      {/* 상단 워크스페이스 미리보기 */}
      <style>
        {`
          .react-flow__node {
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          
          .react-flow__handle {
            width: 4px;
            height: 4px;
            min-width: 4px;
            min-height: 4px;
            background-color: #000;
            border: none;
          }
          .dark .react-flow__handle {
            background-color: #fff;
            border: none;
          }
          .react-flow__handle-top {
            top: -3px;
            left: 50%;
            transform: translateX(-50%)
          }
          .react-flow__handle-bottom {
            bottom: -3px;
            left: 50%;
            transform: translateX(-50%)
          }
        `}
      </style>
      <div className="pointer-events-none flex-1">
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
          nodeTypes={nodeTypes}
          deleteKeyCode={null}
          multiSelectionKeyCode={null}
          selectionKeyCode={null}
          zoomActivationKeyCode={null}
          panActivationKeyCode={null}
          nodesFocusable={false}
          edgesFocusable={false}
        >
          <Background variant={BackgroundVariant.Lines} color={gridColor} />
        </ReactFlow>
      </div>

      {/* 하단 영역 */}
      <div className="bg-primary flex items-center gap-12 px-4 py-14">
        <div className="bg-accent flex h-30 w-30 items-center justify-center rounded-2xl">
          <MyProfileAvatar
            size={30}
            fallbackName={userName}
            fallbackImage={userImage}
            className="h-full"
          />
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

export default CommunityCard
