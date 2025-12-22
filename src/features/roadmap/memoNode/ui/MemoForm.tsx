import { useState } from 'react'
import { usePostNodeMemo } from '../model'
import { toast } from 'sonner'

interface MemoFormProps {
  techId: string | null
}

const MemoForm = ({ techId }: MemoFormProps) => {
  const [memoInput, setMemoInput] = useState<string>(
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut cursus nibh eget lorem posuere finibus. Vestibulum sapien erat, cursus in rutrum a, varius non leo. Integer ac nibh ac tortor aliquam venenatis sed sit amet leo. In eu semper velit, at sagittis eros. Nulla facilisi. Maecenas id ullamcorper nunc. Integer id vulputate nunc, sed cursus libero. Vivamus ullamcorper condimentum ligula, sed viverra ipsum consequat non. Sed consectetur lectus nec mauris vulputate interdum in ut neque. Etiam ac molestie eros. Donec lacinia mi ac tortor congue semper.'
  )
  const { postNodeMemo } = usePostNodeMemo()
  const handleSaveMemo = () => {
    if (!techId) return
    postNodeMemo(
      { techId, memo: memoInput },
      {
        onError: (err) => {
          console.log(err)
          toast.error('저장 중 오류가 발생했습니다.')
        },
      }
    )
  }
  return (
    <textarea
      value={memoInput}
      onChange={(e) => setMemoInput(e.target.value)}
      onBlur={handleSaveMemo}
      placeholder="메모를 입력하세요."
      className="bg-background-light focus:bg-background h-full w-full resize-none rounded-md p-10 outline-none"
    />
  )
}

export default MemoForm
