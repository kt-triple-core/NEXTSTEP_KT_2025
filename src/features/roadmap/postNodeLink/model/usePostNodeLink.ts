import { useMutation } from '@tanstack/react-query'
import { postNodeLink } from '../api'

const usePostNodeLink = () => {
  const mutation = useMutation({
    mutationFn: ({
      techId,
      title,
      url,
    }: {
      techId: string
      title: string
      url: string
    }) => {
      if (!title?.trim()) {
        throw new Error('자료 이름을 입력해주세요.')
      }
      if (!url?.trim()) {
        throw new Error('자료 링크를 입력해주세요.')
      }
      if (!url.startsWith('https://')) {
        throw new Error('자료 링크는 https://로 시작해야 합니다.')
      }

      return postNodeLink({
        techId,
        title,
        url,
      })
    },
  })

  return {
    postNodeLink: mutation.mutate,
    isSaving: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
  }
}

export default usePostNodeLink
