import { useState } from 'react'
import { usePostNodeMemo } from '../model'
import { toast } from 'sonner'
import { useWorkspaceStore } from '@/widgets/workspace/model'

interface MemoFormProps {
  techId: string | null
}

const MemoForm = ({ techId }: MemoFormProps) => {
  const getNodeMemo = useWorkspaceStore((state) => state.getNodeMemo)
  const setNodeMemos = useWorkspaceStore((s) => s.setNodeMemos)

  // 초기값: store에서 가져온 메모 (없으면 빈 문자열)
  const initialMemo = getNodeMemo(techId)
  const [memoInput, setMemoInput] = useState<string>(initialMemo?.memo || '')

  const { postNodeMemo } = usePostNodeMemo()
  const handleSave = () => {
    if (!techId) return
    postNodeMemo(
      { techId, memo: memoInput },
      {
        onSuccess: (data) => {
          setNodeMemos(techId, {
            memo: data.memo,
          })
          toast.success('메모가 저장되었습니다.')
        },
        onError: (err) => {
          console.log(err)
          toast.error(
            err instanceof Error
              ? err.message
              : '메모 저장 중 오류가 발생했습니다.'
          )
        },
      }
    )
  }
  return (
    <textarea
      value={memoInput}
      onChange={(e) => setMemoInput(e.target.value)}
      onBlur={handleSave}
      placeholder="메모를 입력하세요."
      className="bg-background-light focus:bg-background h-full w-full resize-none rounded-md p-10 outline-none"
    />
  )
}

export default MemoForm
