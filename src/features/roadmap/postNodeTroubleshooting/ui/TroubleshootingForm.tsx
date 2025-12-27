import { useState } from 'react'
import { usePostNodeTroubleshooting } from '../model'
import { toast } from 'sonner'
import { Button } from '@/shared/ui'
import { useWorkspaceStore } from '@/widgets/workspace/model'

interface TroubleshootingFormProps {
  techId: string | null
  handleCloseForm: () => void
  troubleshootings: any[]
}

const TroubleshootingForm = ({
  techId,
  handleCloseForm,
  troubleshootings,
}: TroubleshootingFormProps) => {
  const [troubleshooting, setTroubleshooting] = useState<string>('')
  const setNodeTroubleshootings = useWorkspaceStore(
    (s) => s.setNodeTroubleshootings
  )

  const initForm = () => {
    setTroubleshooting('')
    handleCloseForm()
  }

  const { postNodeTroubleshooting, isSaving } = usePostNodeTroubleshooting()
  const handleAdd = () => {
    if (!techId) return
    postNodeTroubleshooting(
      { techId, troubleshooting },
      {
        onSuccess: (data) => {
          setNodeTroubleshootings(techId, [
            {
              nodeTroubleshootingId: data.nodeTroubleshootingId,
              troubleshooting: data.troubleshooting,
              createdAt: data.createdAt,
            },
            ...troubleshootings,
          ])
          toast.success('자료가 추가되었습니다.')
          initForm()
        },
        onError: (err) => {
          console.log(err)
          toast.error(
            err instanceof Error
              ? err.message
              : '트러블슈팅 추가 중 오류가 발생했습니다.'
          )
        },
      }
    )
  }

  return (
    <div className="flex h-full flex-col">
      <textarea
        value={troubleshooting}
        onChange={(e) => setTroubleshooting(e.target.value)}
        placeholder="문제 상황과 해결 방법을 기록하세요."
        className="bg-background h-full w-full resize-none rounded-md p-10 outline-none"
      />
      <div className="mt-5 flex gap-5">
        <Button className="w-[calc(50%-2.5px)] py-8" onClick={initForm}>
          취소
        </Button>
        <Button
          variant="accent"
          className="w-[calc(50%-2.5px)] py-8"
          onClick={handleAdd}
          disabled={isSaving}
        >
          {isSaving ? '추가 중...' : '추가'}
        </Button>
      </div>
    </div>
  )
}

export default TroubleshootingForm
