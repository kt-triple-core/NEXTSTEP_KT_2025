'use client'
import { useEffect } from 'react'
import { Background, BackgroundVariant, ReactFlow } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useThemeStore } from '@/features/theme/model'
import { useWorkspaceStore } from '../model'
import SearchSidebar from '@/widgets/workspace/ui/SearchSidebar'
import { useOpen } from '@/shared/model'
import WorkspaceList from './WorkspaceList'
import { useAddNode } from '@/features/roadmap/addNode/model'
import { useSelectNode } from '@/features/roadmap/selectNode/model'
import { useConnectNodes } from '@/features/roadmap/connectNodes/model'
import { SaveWorkspaceModal } from '@/features/workspace/saveWorkspace/ui'
import { PostWorkspaceModal } from '@/features/workspace/postWorkspace/ui'

const Workspace = () => {
  const { nodes, onNodesChange, edges, selectedNode } = useWorkspaceStore()
  const nodeOrigin: [number, number] = [0.5, 0]
  const {
    isOpen: isSidebarOpen,
    open: openSidebar,
    toggleOpen: toggleSidebarOpen,
  } = useOpen()

  // 테마에 따른 격자 무늬 색상 변경
  const { theme } = useThemeStore()
  const gridColor = theme === 'dark' ? '#2f3645' : '#e5e5e5'

  // 사이드바가 열렸다가 닫히면서 ReactFlow가 차지하는 영역이 달라지기 때문에
  // 그때마다 fitView로 로드맵을 재정렬
  // const { fitView } = useReactFlow()
  // const wrapperRef = useRef<HTMLDivElement>(null)
  // useEffect(() => {
  //   if (!wrapperRef.current) return

  //   const observer = new ResizeObserver(() => {
  //     fitView()
  //   })

  //   observer.observe(wrapperRef.current)

  //   return () => observer.disconnect()
  // }, [fitView])

  // 노드 클릭 이벤트
  const { onNodeClick } = useSelectNode()
  // 노드 추가 이벤트
  const { onConnectEnd } = useAddNode()
  // 노드 연결 이벤트
  const { onConnect } = useConnectNodes()

  // 노드 선택됐을 때 사이드바 열기
  useEffect(() => {
    if (selectedNode) {
      openSidebar()
    }
  }, [selectedNode])

  return (
    <div className="flex h-full w-full overflow-x-hidden">
      <style>{`
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
        .react-flow__viewport {
          transition: transform 0.2s ease-out;
        }
        .react-flow__viewport.dragging {
          transition: none;
        }
        .react-flow__panel {
          display: none;
        }
      `}</style>
      <div className="relative h-full w-full">
        <ReactFlow
          // ref={wrapperRef}
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          elementsSelectable={false}
          onNodeClick={onNodeClick}
          onConnect={onConnect}
          onConnectEnd={onConnectEnd}
          nodeOrigin={nodeOrigin}
          fitView
          className={`h-full w-full`}
        />
        <Background variant={BackgroundVariant.Lines} color={gridColor} />
        <WorkspaceList />
        <div className="bg-primary absolute top-10 right-35 flex h-50 gap-10 rounded-md p-8">
          <PostWorkspaceModal />
          <SaveWorkspaceModal />
        </div>
      </div>
      <SearchSidebar
        key={`${selectedNode?.id}-${selectedNode?.data.label}` || ''}
        isOpen={isSidebarOpen}
        toggleOpen={toggleSidebarOpen}
        selectedNode={selectedNode}
      />
    </div>
  )
}

export default Workspace
