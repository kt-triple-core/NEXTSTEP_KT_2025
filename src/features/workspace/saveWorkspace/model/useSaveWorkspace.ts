import { useMutation } from '@tanstack/react-query'
import { saveWorkspace } from '../api'
import { useWorkspaceStore } from '@/widgets/workspace/model'

// 현재 접근하고 있는 워크스페이스를 저장하는 훅
const useSaveWorkspace = () => {
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
        userId: '9c390fc6-5724-4ccb-bf46-16564e2481b3',
      })
    },

    onSuccess: (data) => {
      useWorkspaceStore.setState({
        workspaceId: data.id,
        workspaceTitle: data.title,
        lastSaved: data.createdAt,
      })
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
