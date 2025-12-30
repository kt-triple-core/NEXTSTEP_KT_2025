import { useWorkspaceStore } from '@/widgets/workspace/model'

interface MemoFormProps {
  techId: string | null
}

const MemoForm = ({ techId }: MemoFormProps) => {
  const memo = useWorkspaceStore((s) => s.getNodeMemo(techId))
  const setNodeMemo = useWorkspaceStore((s) => s.setNodeMemo)

  if (!techId) return null

  return (
    <textarea
      value={memo?.memo ?? ''}
      onChange={(e) => setNodeMemo(techId, e.target.value)}
      placeholder="메모를 입력하세요."
      className="bg-background-light focus:bg-background h-full w-full resize-none rounded-md p-10 outline-none"
    />
  )
}

export default MemoForm
