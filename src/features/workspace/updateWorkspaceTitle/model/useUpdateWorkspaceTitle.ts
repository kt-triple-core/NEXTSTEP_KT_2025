import { useSession } from 'next-auth/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateWorkspaceTitle } from '../api'
import { useWorkspaceStore } from '@/widgets/workspace/model'

// 워크스페이스의 이름을 변경하는 훅
const useUpdateWorkspaceTitle = () => {
  const { status } = useSession()
  const queryClient = useQueryClient()
  const { workspaceId: currentWorkspaceId, setWorkspaceTitle } =
    useWorkspaceStore()

  const mutation = useMutation({
    mutationFn: ({
      workspaceTitle,
      workspaceId,
    }: {
      workspaceTitle: string
      workspaceId: string
    }) => {
      // 예외 처리
      if (status !== 'authenticated') {
        throw new Error('로그인이 필요합니다.')
      }
      if (!workspaceId) {
        throw new Error('워크스페이스를 선택해주세요.')
      }
      if (!workspaceTitle?.trim()) {
        throw new Error('워크스페이스 제목을 입력해주세요.')
      }

      return updateWorkspaceTitle({
        workspaceId,
        title: workspaceTitle,
      })
    },

    onSuccess: (data) => {
      // 워크스페이스 리스트 다시 가져오기
      queryClient.invalidateQueries({ queryKey: ['workspaceList'] })

      // 현재 보고 있는 워크스페이스의 이름을 변경했을 경우
      // store 업데이트
      if (data.workspaceId === currentWorkspaceId) {
        setWorkspaceTitle(data.workspaceTitle)
      }
    },
  })

  return {
    updateWorkspaceTitle: mutation.mutate,
    isSaving: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
  }
}

export default useUpdateWorkspaceTitle
