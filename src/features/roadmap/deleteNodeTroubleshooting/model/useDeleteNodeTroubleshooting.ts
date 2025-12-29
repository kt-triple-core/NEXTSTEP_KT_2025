import { useMutation } from '@tanstack/react-query'
import { deleteNodeTroubleshooting } from '../api'

const useDeleteNodeTroubleshooting = () => {
  const mutation = useMutation({
    mutationFn: ({
      nodeTroubleshootingId,
    }: {
      nodeTroubleshootingId: string
    }) => {
      return deleteNodeTroubleshooting({
        nodeTroubleshootingId,
      })
    },
  })

  return {
    deleteNodeTroubleshooting: mutation.mutate,
    isDeleting: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
  }
}

export default useDeleteNodeTroubleshooting
