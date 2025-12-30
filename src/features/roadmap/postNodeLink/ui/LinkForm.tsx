import { useState } from 'react'
import { Button } from '@/shared/ui'
import { useWorkspaceStore } from '@/widgets/workspace/model'
import { v4 as uuidv4 } from 'uuid'
import { toast } from 'sonner'

interface LinkFormProps {
  techId: string | null
  handleCloseForm: () => void
  links: any[]
}

const LinkForm = ({ techId, handleCloseForm }: LinkFormProps) => {
  const [title, setTitle] = useState<string>('')
  const [url, setUrl] = useState<string>('')
  const addNodeLink = useWorkspaceStore((s) => s.addNodeLink)

  if (!techId) return null

  const handleAdd = () => {
    if (!title.trim()) {
      toast.error('자료 이름을 입력하세요.')
      return
    }
    if (!url.trim()) {
      toast.error('URL을 입력하세요.')
      return
    }
    if (!url.startsWith('https://')) {
      toast.error('URL은 https://로 시작해야 합니다.')
      return
    }

    addNodeLink(techId, {
      nodeLinkId: uuidv4(), // 임시 ID
      title: title.trim(),
      url: url.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    toast.success('자료가 추가되었습니다.')

    setTitle('')
    setUrl('')
    handleCloseForm()
  }

  return (
    <>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="자료 이름"
        className="bg-secondary w-full rounded-md px-10 py-8 outline-none"
      />
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://..."
        className="bg-secondary mt-5 w-full rounded-md px-10 py-8 outline-none"
      />
      <div className="mt-5 flex justify-end gap-5">
        <Button className="px-20 py-8" onClick={handleCloseForm}>
          취소
        </Button>
        <Button variant="accent" className="px-20 py-8" onClick={handleAdd}>
          추가
        </Button>
      </div>
    </>
  )
}

export default LinkForm
