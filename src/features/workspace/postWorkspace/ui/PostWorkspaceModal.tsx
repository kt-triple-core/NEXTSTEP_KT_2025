import { useState } from 'react'
import { useSession } from 'next-auth/react'
import Modal from '@/shared/ui/Modal'
import { DialogClose } from '@/components/ui/dialog'
import { Button } from '@/shared/ui'
import { usePostWorkspace } from '../model'
import { useOpen } from '@/shared/model'
import { toast } from 'sonner'
import { useCommunityList } from '@/features/community/model/useCommunityList'
import { useWorkspaceStore } from '@/widgets/workspace/model'

const PostWorkspaceModal = () => {
  const { isOpen, setIsOpen } = useOpen()
  const { workspaceTitle } = useWorkspaceStore()
  const [titleInput, setTitleInput] = useState<string>('')
  const [contentInput, setContentInput] = useState<string>('')
  const [listId, setListId] = useState<string | null>(null)
  const { data: communityList } = useCommunityList()
  const { status } = useSession()
  const { postWorkspace, isSaving } = usePostWorkspace()
  const handlePost = () => {
    // 로그인 여부 확인
    if (status !== 'authenticated') {
      toast.warning('로그인이 필요합니다.')
      return
    }
    if (!titleInput.trim()) {
      toast.warning('워크스페이스 이름을 입력해주세요.')
      return
    }

    if (!listId) {
      toast.warning('커뮤니티를 선택해주세요.')
      return
    }

    postWorkspace(
      { workspaceTitle: titleInput, content: contentInput, listId },
      {
        onSuccess: () => {
          setIsOpen(false)
          setTitleInput('')
          setListId(null)
          toast.success('워크스페이스가 게시되었습니다.')
        },
      }
    )
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    // 모달 상태 변경 시 초기화
    if (open) {
      setTitleInput(workspaceTitle || '')
    } else {
      setTitleInput('')
      setContentInput('')
      setListId(null)
    }
  }

  return (
    <Modal
      open={isOpen}
      onOpenChange={handleOpenChange}
      trigger={
        <Button variant="accent" className="text-12 h-full px-20">
          게시
        </Button>
      }
      title="워크스페이스 게시"
      titleClassName="text-center"
      className="px-10 py-10 sm:max-w-[min(700px,calc(100%-40px))]"
      footer={
        <>
          <DialogClose asChild>
            <Button className="px-20 py-8">취소</Button>
          </DialogClose>
          <Button variant="accent" onClick={handlePost} className="px-20 py-8">
            {isSaving ? '게시 중...' : '게시'}
          </Button>
        </>
      }
      footerClassName="flex sm:justify-center gap-10"
    >
      <div className="my-20 flex flex-col items-center gap-20">
        <div className="flex w-full max-w-500 flex-col gap-5">
          <label>워크스페이스 이름</label>
          <input
            type="text"
            placeholder="워크스페이스 이름을 입력해주세요."
            value={titleInput}
            onChange={(e) => setTitleInput(e.target.value)}
            className="rounded-sm border border-gray-400 px-10 py-8 outline-none"
          ></input>
        </div>
        <div className="flex w-full max-w-500 flex-col gap-5">
          <label>내용</label>
          <textarea
            placeholder="내용을 입력해주세요."
            value={contentInput}
            onChange={(e) => setContentInput(e.target.value)}
            rows={5}
            className="rounded-sm border border-gray-400 px-10 py-8 outline-none"
          ></textarea>
        </div>
        <div className="flex w-full max-w-500 flex-col gap-5">
          <label>커뮤니티</label>
          <select
            className="rounded-sm border border-gray-400 px-5 py-8 outline-none"
            value={listId ?? ''}
            onChange={(e) => setListId(e.target.value)}
          >
            <option value="" disabled>
              커뮤니티를 선택해주세요.
            </option>
            {communityList?.map((list) => (
              <option key={list.list_id} value={list.list_id}>
                {list.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </Modal>
  )
}

export default PostWorkspaceModal
