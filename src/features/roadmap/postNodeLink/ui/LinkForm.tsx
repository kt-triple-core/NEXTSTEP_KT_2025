import { useState } from 'react'
import { usePostNodeLink } from '../model'
import { toast } from 'sonner'
import { Button } from '@/shared/ui'
import { useWorkspaceStore } from '@/widgets/workspace/model'

interface LinkFormProps {
  techId: string | null
  handleCloseForm: () => void
  links: any[]
}

const LinkForm = ({ techId, handleCloseForm, links }: LinkFormProps) => {
  const [title, setTitle] = useState<string>('')
  const [url, setUrl] = useState<string>('')
  const setNodeLinks = useWorkspaceStore((s) => s.setNodeLinks)

  const initForm = () => {
    setTitle('')
    setUrl('')
    handleCloseForm()
  }

  const { postNodeLink, isSaving } = usePostNodeLink()
  const handleAdd = () => {
    if (!techId) return
    postNodeLink(
      { techId, title, url },
      {
        onSuccess: (data) => {
          setNodeLinks(techId, [
            {
              nodeLinkId: data.nodeLinkId,
              title: data.title,
              url: data.url,
            },
            ...links,
          ])
          toast.success('자료가 추가되었습니다.')
          initForm()
        },
        onError: (err) => {
          console.log(err)
          toast.error(
            err instanceof Error
              ? err.message
              : '자료 추가 중 오류가 발생했습니다.'
          )
        },
      }
    )
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
        <Button className="px-20 py-8" onClick={initForm}>
          취소
        </Button>
        <Button
          variant="accent"
          className="px-20 py-8"
          onClick={handleAdd}
          disabled={isSaving}
        >
          {isSaving ? '추가 중...' : '추가'}
        </Button>
      </div>
    </>
  )
}

export default LinkForm
