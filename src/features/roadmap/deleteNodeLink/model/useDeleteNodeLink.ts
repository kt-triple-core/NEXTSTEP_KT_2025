import { useMutation } from '@tanstack/react-query'
import { deleteNodeLink } from '../api'

const useDeleteNodeLink = () => {
  const mutation = useMutation({
    mutationFn: ({ nodeLinkId }: { nodeLinkId: string }) => {
      return deleteNodeLink({
        nodeLinkId,
      })
    },
  })

  return {
    deleteNodeLink: mutation.mutate,
    isDeleting: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
  }
}

export default useDeleteNodeLink
