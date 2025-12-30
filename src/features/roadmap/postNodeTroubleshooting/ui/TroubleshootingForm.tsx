import { useState } from 'react'
import { Button } from '@/shared/ui'
import { useWorkspaceStore } from '@/widgets/workspace/model'
import { v4 as uuidv4 } from 'uuid'
import { toast } from 'sonner'

interface TroubleshootingFormProps {
  techId: string | null
  handleCloseForm: () => void
  troubleshootings: any[]
}

const TroubleshootingForm = ({
  techId,
  handleCloseForm,
}: TroubleshootingFormProps) => {
  const [troubleshooting, setTroubleshooting] = useState<string>('')
  const addNodeTroubleshooting = useWorkspaceStore(
    (s) => s.addNodeTroubleshooting
  )

  if (!techId) return null

  const handleAdd = () => {
    if (!troubleshooting.trim()) {
      toast.error('트러블슈팅 내용을 입력하세요.')
      return
    }

    addNodeTroubleshooting(techId, {
      nodeTroubleshootingId: uuidv4(), // 임시 ID
      troubleshooting: troubleshooting.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    toast.success('트러블슈팅이 추가되었습니다.')

    setTroubleshooting('')
    handleCloseForm()
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
        <Button className="w-[calc(50%-2.5px)] py-8" onClick={handleCloseForm}>
          취소
        </Button>
        <Button
          variant="accent"
          className="w-[calc(50%-2.5px)] py-8"
          onClick={handleAdd}
        >
          추가
        </Button>
      </div>
    </div>
  )
}

export default TroubleshootingForm
