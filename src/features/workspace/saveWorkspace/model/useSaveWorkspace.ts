import { useMutation, useQueryClient } from '@tanstack/react-query'
import { saveWorkspace } from '../api'
import { useWorkspaceStore } from '@/widgets/workspace/model'
import { useRouter } from 'next/navigation'

// 현재 접근하고 있는 워크스페이스를 저장하는 훅
const useSaveWorkspace = () => {
  const queryClient = useQueryClient()
  const router = useRouter()
  const mutation = useMutation({
    mutationFn: () => {
      const { nodes, edges, workspaceId, workspaceTitle } =
        useWorkspaceStore.getState()

      if (!workspaceTitle?.trim()) {
        throw new Error('워크스페이스 제목을 입력해주세요')
      }

      return saveWorkspace({
        workspaceId: workspaceId || undefined,
        title: workspaceTitle,
        nodes,
        edges,
      })
    },

    onSuccess: (data) => {
      const currentWorkspaceId = useWorkspaceStore.getState().workspaceId

      // 스토어 업데이트
      useWorkspaceStore.setState({
        workspaceId: data.workspaceId,
        workspaceTitle: data.title,
        lastSaved: data.createdAt,
      })

      // 워크스페이스 리스트 다시 가져오기
      queryClient.invalidateQueries({ queryKey: ['workspaceList'] })

      // 새로운 워크스페이스인 경우 (기존에 workspaceId가 없었던 경우) URL 업데이트
      if (!currentWorkspaceId && data.workspaceId) {
        const query = new URLSearchParams(window.location.search)
        query.set('workspace', data.workspaceId)
        router.push(`${window.location.pathname}?${query.toString()}`)
      }
    },
  })

  return {
    saveWorkspace: mutation.mutate,
    isSaving: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
  }
}

export default useSaveWorkspace
