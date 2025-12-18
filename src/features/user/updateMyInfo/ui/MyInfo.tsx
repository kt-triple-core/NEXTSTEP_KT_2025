'use client'
import { Button } from '@/shared/ui'
import { Check, Close, Edit } from '@/shared/ui/icon'
import { toast } from 'sonner'
import ExperienceRow from '@/features/user/updateMyInfo/ui/ExperienceRow'
import { useState } from 'react'
import { useGetUserInfo } from '@/features/user/updateMyInfo/model/useGetUserInfo'
import { useUpdateUserInfo } from '@/features/user/updateMyInfo/model/useUpdateUserInfo'
import { useCreateExperience } from '@/features/user/updateMyInfo/model/useCreateExperience'

const MyInfo = () => {
  // 사용자 정보 조회
  const { data: userInfo } = useGetUserInfo()
  // 사용자 정보 수정
  const { mutateAsync: updateUserInfo, isPending: isUpdatingName } =
    useUpdateUserInfo()

  const [isEditingName, setIsEditingName] = useState(false)
  const [draftName, setDraftName] = useState('')
  // 커리어/경험 추가
  const {
    draft,
    submit,
    isPending: isCreatingExperience,
  } = useCreateExperience()

  // 현재 경험 개수(최대 3개 제한 UI용)
  const expCount = userInfo?.experiences?.length ?? 0
  const canAddMore = expCount < 3

  // Plus 눌렀을 때 아래 신규 입력 row 표시
  const [isAddingBelow, setIsAddingBelow] = useState(false)

  return (
    <div className="flex gap-50">
      {/* 이름 */}
      <div className="space-y-15">
        <label className="block text-sm font-semibold">이름</label>
        <div className="flex items-center gap-8">
          <input
            value={isEditingName ? draftName : (userInfo?.name ?? '')}
            onChange={(e) => setDraftName(e.target.value)}
            disabled={!isEditingName} // 기본은 클릭/포커스 안 되는 disabled
            className={`h-40 w-250 flex-1 rounded-md border border-[#E4DDFD] p-5 text-sm ${!isEditingName ? 'cursor-not-allowed bg-[#F9F8FD] text-gray-500' : 'bg-white'} `}
          />
          {!isEditingName ? (
            <Button
              onClick={() => {
                setDraftName(userInfo?.name ?? '')
                setIsEditingName(true)
              }}
              className="flex items-center justify-center rounded-md border border-black p-10 text-xs text-gray-500 hover:opacity-60 hover:transition"
            >
              <Edit />
            </Button>
          ) : (
            <div className="flex items-center gap-8">
              <Button
                disabled={isUpdatingName}
                onClick={() => {
                  setDraftName(userInfo?.name ?? '')
                  setIsEditingName(false)
                }}
                className="flex items-center justify-center rounded-md border border-black p-10 text-xs text-gray-500 hover:opacity-60 hover:transition"
              >
                <Close />
              </Button>

              <Button
                disabled={isUpdatingName}
                onClick={async () => {
                  const next = draftName.trim()
                  if (!next) return // 필요하면 toast로 "이름을 입력" 처리

                  await updateUserInfo({ name: next }) //  PATCH /api/users
                  toast.success('이름이 수정되었습니다')
                  setIsEditingName(false)
                }}
                className="flex items-center justify-center rounded-md border border-[var(--color-accent)] p-10 text-xs text-gray-500 hover:opacity-60 hover:transition"
              >
                <Check />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* 커리어 및 경력 */}
      <div className="space-y-15">
        <label className="block text-sm font-semibold">커리어 및 경력</label>

        <div className="space-y-20 text-sm">
          {/* 기존 목록 */}
          {(userInfo?.experiences?.length ?? 0) > 0 && (
            <div className="space-y-20">
              {userInfo?.experiences?.map((exp) => (
                <ExperienceRow key={exp.experienceId} exp={exp} />
              ))}
            </div>
          )}

          {/* 신규 입력 row (추가 버튼 눌렀을 때만) */}
          {(isAddingBelow || (userInfo?.experiences?.length ?? 0) === 0) && (
            <div className="flex items-center gap-8">
              <input
                value={draft.field}
                onChange={(e) => draft.setField(e.target.value)}
                placeholder="ex) 프론트엔드, 백엔드"
                disabled={isCreatingExperience}
                className="h-40 w-250 flex-1 rounded-md border border-[#E4DDFD] bg-white p-5"
              />

              <div className="flex items-center gap-1">
                <input
                  value={draft.year}
                  onChange={(e) =>
                    draft.setYear(e.target.value.replace(/[^\d]/g, ''))
                  }
                  placeholder="0"
                  disabled={isCreatingExperience}
                  className="h-40 w-50 rounded-md border border-[#E4DDFD] bg-white p-5 text-left"
                />
                <span className="text-md">년차</span>
              </div>

              <div className="flex items-center gap-8">
                <Button
                  disabled={isCreatingExperience}
                  onClick={() => {
                    draft.reset()
                    setIsAddingBelow(false)
                  }}
                  className="flex items-center justify-center rounded-md border border-black p-10 text-xs text-gray-500 hover:opacity-60 hover:transition"
                >
                  <Close />
                </Button>

                <Button
                  disabled={isCreatingExperience}
                  onClick={async () => {
                    await submit()
                    setIsAddingBelow(false)
                  }}
                  className="flex items-center justify-center rounded-md border border-[var(--color-accent)] p-10 text-xs text-gray-500 hover:opacity-60 hover:transition"
                >
                  <Check />
                </Button>
              </div>
            </div>
          )}
        </div>
        <Button
          onClick={() => {
            if (!canAddMore) {
              toast.error('커리어는 최대 3개까지 추가할 수 있습니다')
              return
            }
            setIsAddingBelow(true)
          }}
          disabled={isCreatingExperience || isAddingBelow}
          className="w-full rounded-md border border-[#E4DDFD] bg-white px-10 py-5 hover:opacity-60 hover:transition"
        >
          추가 +
        </Button>
      </div>
    </div>
  )
}

export default MyInfo
