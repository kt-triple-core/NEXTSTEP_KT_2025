import { useMutation } from '@tanstack/react-query'
import { postNodeTroubleshooting } from '../api'

const usePostNodeTroubleshooting = () => {
  const mutation = useMutation({
    mutationFn: ({
      techId,
      troubleshooting,
    }: {
      techId: string
      troubleshooting: string
    }) => {
      if (!troubleshooting?.trim()) {
        throw new Error('자료 이름을 입력해주세요.')
      }

      return postNodeTroubleshooting({
        techId,
        troubleshooting,
      })
    },
  })

  return {
    postNodeTroubleshooting: mutation.mutate,
    isSaving: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
  }
}

export default usePostNodeTroubleshooting
