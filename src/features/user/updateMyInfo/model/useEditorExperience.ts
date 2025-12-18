import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useUpdateUserInfo } from './useUpdateUserInfo'

type Experience = {
  experienceId: string
  field: string
  year: number
}

export function useEditorExperience(exp: Experience) {
  const { mutateAsync, isPending } = useUpdateUserInfo()

  const [isEditing, setIsEditing] = useState(false)
  const [draftField, setDraftField] = useState(exp.field)
  const [draftYear, setDraftYear] = useState(String(exp.year))

  // 원본 데이터가 변경될 때 useEffect를 사용해 DRAFT 상태를 동기화
  useEffect(() => {
    if (!isEditing) {
      setDraftField(exp.field)
      setDraftYear(String(exp.year))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exp.experienceId, exp.field, exp.year])

  // 제출 가능 여부를 계산
  const canSubmit = useMemo(() => {
    const f = draftField.trim()
    const y = Number(draftYear)
    return (
      f.length > 0 && f.length <= 50 && Number.isInteger(y) && y >= 0 && y <= 60
    )
  }, [draftField, draftYear])

  const startEdit = () => setIsEditing(true)

  const cancelEdit = () => {
    setDraftField(exp.field)
    setDraftYear(String(exp.year))
    setIsEditing(false)
  }

  const submitEdit = async () => {
    const field = draftField.trim()
    const year = Number(draftYear)

    if (!field) return toast.error('커리어를 입력해주세요.')
    if (!Number.isInteger(year) || year < 0 || year > 60) {
      return toast.error('년차는 0~60 사이 숫자로 입력해주세요.')
    }

    await mutateAsync({
      experiences: {
        update: [{ experienceId: exp.experienceId, field, year }],
      },
    })

    toast.success('커리어/경력이 수정되었습니다.')
    setIsEditing(false)
  }

  const remove = async () => {
    await mutateAsync({
      experiences: { delete: [exp.experienceId] },
    })

    toast.success('삭제되었습니다.')
    // 삭제 후 isEditing은 의미 없으니 정리
    setIsEditing(false)
  }

  return {
    isEditing,
    isPending,
    draftField,
    setDraftField,
    draftYear,
    setDraftYear,
    canSubmit,
    startEdit,
    cancelEdit,
    submitEdit,
    remove,
  }
}
