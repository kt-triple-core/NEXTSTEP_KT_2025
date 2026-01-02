'use client'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { ReactFlowProvider } from '@xyflow/react'
import { Workspace } from '@/widgets/workspace/ui'
import useGetWorkspace from '@/features/workspace/getWorkspace/model/useGetWorkspace'
import { useWorkspaceStore } from '@/widgets/workspace/model'

export default function MainContent() {
  // URL에서 workspaceId 읽기
  const searchParams = useSearchParams()
  const workspaceId = searchParams.get('workspace')
  const pathname = usePathname()

  // React Query로 워크스페이스 정보 가져오기
  const { data, isLoading, error } = useGetWorkspace(workspaceId)
  const isEdited = useWorkspaceStore((s) => s.isEdited)

  // store 초기화
  const { initializeWithData, resetToEmpty } = useWorkspaceStore()

  const isEditedRef = useRef(isEdited)

  useEffect(() => {
    isEditedRef.current = isEdited
  }, [isEdited])

  // beforeunload 이벤트 리스너 등록
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!isEditedRef.current) return
      e.preventDefault()
      e.returnValue = ''
    }

    window.addEventListener('beforeunload', handler)

    // cleanup: 컴포넌트 언마운트 시 반드시 리스너 제거
    return () => {
      window.removeEventListener('beforeunload', handler)
    }
  }, [])

  // 라우트 변경 감지 및 상태 초기화
  useEffect(() => {
    // 이 페이지를 떠날 때 워크스페이스 상태 초기화
    return () => {
      // MainContent가 언마운트되면 워크스페이스 상태 리셋
      resetToEmpty()
    }
  }, [pathname, resetToEmpty])

  useEffect(() => {
    if (!workspaceId) {
      resetToEmpty()
    } else if (data) {
      initializeWithData(data)
    }
  }, [workspaceId, data, initializeWithData, resetToEmpty])

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="text-center">
          <div className="mb-2">워크스페이스 불러오는 중...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="text-center">
          <div className="mb-2">워크스페이스를 불러올 수 없습니다</div>
          <button
            onClick={() => (window.location.href = '/')}
            className="text-sm underline hover:cursor-pointer"
          >
            새 워크스페이스로 시작하기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full w-full">
      <ReactFlowProvider>
        <Workspace />
      </ReactFlowProvider>
    </div>
  )
}
