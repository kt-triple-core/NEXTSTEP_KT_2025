'use client'
import { useCallback, useEffect, useState } from 'react'
import { Background, BackgroundVariant, ReactFlow } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useThemeStore } from '@/features/theme/model'
import { SearchForm } from '@/features/roadmap/searchTechStack/ui'
import { useWorkspaceStore } from '../model'
import SearchSidebar from '@/widgets/workspace/ui/SearchSidebar'
import { useOpen } from '@/shared/model'
import WorkspaceList from './WorkspaceList'
import { useSelectNode } from '@/features/roadmap/selectNode/model'
import { useAddNode } from '@/features/roadmap/addNode/model'
import { useConnectNodes } from '@/features/roadmap/connectNodes/model'

const Workspace = () => {
  const { nodes, onNodesChange, edges, selectedNode } = useWorkspaceStore()
  const nodeOrigin: [number, number] = [0.5, 0]
  const {
    isOpen: isSidebarOpen,
    open: openSidebar,
    toggleOpen: toggleSidebarOpen,
  } = useOpen()
  const [searchKeyword, setSearchKeyword] = useState<string>('')
  const [sidebarMode, setSidebarMode] = useState<'search' | 'recommendation'>(
    'search'
  )
  const [recommendationTechName, setRecommendationTechName] =
    useState<string>('')

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

  // 검색 핸들러 (검색 모드)
  const handleSearch = useCallback(
    (keyword: string) => {
      console.log(' 검색 실행:', keyword)
      setSearchKeyword(keyword)
      setSidebarMode('search')
      openSidebar()
    },
    [openSidebar]
  )

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
          nodes={nodes}
          edges={edges}
          elementsSelectable={false}
          fitView
          // ref={wrapperRef}
          onNodeClick={onNodeClick}
          onConnectEnd={onConnectEnd}
          onNodesChange={onNodesChange}
          onConnect={onConnect}
          nodeOrigin={nodeOrigin}
          className={`h-full w-full`}
        />
        <Background variant={BackgroundVariant.Lines} color={gridColor} />

        <SearchForm onSearch={handleSearch} />
        <WorkspaceList />
      </div>
      <SearchSidebar
        isOpen={isSidebarOpen}
        toggleOpen={toggleSidebarOpen}
        searchKeyword={searchKeyword}
        mode={sidebarMode}
        recommendationTechName={recommendationTechName}
      />
    </div>
  )
}

export default Workspace
