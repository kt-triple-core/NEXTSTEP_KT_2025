import { useSession } from 'next-auth/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteWorkspace } from '../api'

// 워크스페이스를 삭제하는 훅
const useDeleteWorkspace = () => {
  const { status } = useSession()
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: (workspaceId: string) => {
      // 예외 처리
      if (status !== 'authenticated') {
        throw new Error('로그인이 필요합니다.')
      }
      if (!workspaceId) {
        throw new Error('워크스페이스를 선택해주세요')
      }

      return deleteWorkspace(workspaceId)
    },

    onSuccess: () => {
      // 워크스페이스 리스트 다시 가져오기
      queryClient.invalidateQueries({ queryKey: ['workspaceList'] })
    },
  })

  return {
    deleteWorkspace: mutation.mutate,
    isSaving: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
  }
}

export default useDeleteWorkspace
