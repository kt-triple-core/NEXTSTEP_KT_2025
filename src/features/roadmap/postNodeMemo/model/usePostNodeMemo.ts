import { useMutation } from '@tanstack/react-query'
import { postNodeMemo } from '../api'

const usePostNodeMemo = () => {
  const mutation = useMutation({
    mutationFn: ({ techId, memo }: { techId: string; memo: string }) => {
      if (!memo?.trim()) {
        throw new Error('메모을 입력해주세요.')
      }

      return postNodeMemo({
        techId,
        memo,
      })
    },
  })

  return {
    postNodeMemo: mutation.mutate,
    isSaving: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
  }
}

export default usePostNodeMemo
