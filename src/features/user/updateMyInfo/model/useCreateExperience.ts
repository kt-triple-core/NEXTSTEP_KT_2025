import { toast } from 'sonner'
import { useUpdateUserInfo } from './useUpdateUserInfo'
import { useCareerDraft } from './useCareerDraft'

export function useCreateExperience() {
  // '경력 추가' 폼(분야, 연차)의 상태를 관리
  const draft = useCareerDraft()
  const { mutateAsync, isPending } = useUpdateUserInfo()

  const submit = async () => {
    const { field, year } = draft.getPayload()

    if (!field) return toast.error('커리어를 입력해주세요')
    if (!Number.isInteger(year) || year < 0 || year > 60) {
      return toast.error('올바른 년차를 입력해주세요')
    }

    await mutateAsync({
      experiences: { create: [{ field, year }] },
    })
    toast.success('커리어/경력이 추가되었습니다')
    draft.reset()
  }

  return { draft, submit, isPending }
}
