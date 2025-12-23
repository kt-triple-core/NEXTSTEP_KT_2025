import { useState } from 'react'
import { usePostNodeLink } from '../model'
import { toast } from 'sonner'
import { Button } from '@/shared/ui'

interface LinkFormProps {
  techId: string | null
  handleCloseForm: () => void
  links: any[]
  setLinks: React.Dispatch<React.SetStateAction<any[]>>
}

const LinkForm = ({
  techId,
  handleCloseForm,
  links,
  setLinks,
}: LinkFormProps) => {
  const [linkTitle, setLinkTitle] = useState<string>('')
  const [linkUrl, setLinkUrl] = useState<string>('')

  const initForm = () => {
    setLinkTitle('')
    setLinkUrl('')
    handleCloseForm()
  }

  const { postNodeLink, isSaving } = usePostNodeLink()
  const handleAddLink = () => {
    if (!techId) return
    postNodeLink(
      { techId, linkTitle, linkUrl },
      {
        onSuccess: (data) => {
          setLinks([
            {
              linkId: data.linkId,
              linkTitle: data.linkTitle,
              linkUrl: data.linkUrl,
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
        value={linkTitle}
        onChange={(e) => setLinkTitle(e.target.value)}
        placeholder="자료 이름"
        className="bg-secondary w-full rounded-md px-10 py-8 outline-none"
      />
      <input
        value={linkUrl}
        onChange={(e) => setLinkUrl(e.target.value)}
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
          onClick={handleAddLink}
          disabled={isSaving}
        >
          {isSaving ? '추가 중...' : '추가'}
        </Button>
      </div>
    </>
  )
}

export default LinkForm
