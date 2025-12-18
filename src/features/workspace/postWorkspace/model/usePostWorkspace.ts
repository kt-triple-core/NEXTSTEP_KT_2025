import { useMutation } from '@tanstack/react-query'
import { postWorkspace } from '../api'
import { useWorkspaceStore } from '@/widgets/workspace/model'

// 현재 접근하고 있는 워크스페이스를 게시하는 훅
const usePostWorkspace = () => {
  const mutation = useMutation({
    mutationFn: ({
      workspaceTitle,
      content,
      listId,
    }: {
      workspaceTitle: string
      content: string | null
      listId: string
    }) => {
      const { nodes, edges, workspaceId } = useWorkspaceStore.getState()

      if (!workspaceTitle?.trim()) {
        throw new Error('워크스페이스 제목을 입력해주세요')
      }

      return postWorkspace({
        workspaceId: workspaceId || undefined,
        title: workspaceTitle,
        content: content,
        nodes,
        edges,
        listId: listId,
      })
    },

    onSuccess: (data) => {
      useWorkspaceStore.setState({
        workspaceId: data.workspaceId,
        workspaceTitle: data.title,
        lastSaved: data.createdAt,
      })
    },
  })

  return {
    postWorkspace: mutation.mutate,
    isSaving: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
  }
}

export default usePostWorkspace
