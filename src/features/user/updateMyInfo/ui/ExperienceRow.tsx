'use client'

import { Button } from '@/shared/ui'
import { Check, Close, Edit } from '@/shared/ui/icon'
import Trash from '@/shared/ui/icon/Trash'
import { useEditorExperience } from '@/features/user/updateMyInfo/model/useEditorExperience'

type Props = {
  exp: {
    experienceId: string
    field: string
    year: number
  }
}

export default function ExperienceRow({ exp }: Props) {
  // 기존 경력을 수정/삭제하는 로직
  const row = useEditorExperience(exp)

  return (
    <div className="flex items-center gap-8">
      <input
        value={row.isEditing ? row.draftField : exp.field}
        onChange={(e) => row.setDraftField(e.target.value)}
        disabled={!row.isEditing || row.isPending}
        className={`h-40 w-250 rounded-md border border-[#E4DDFD] p-5 ${
          !row.isEditing
            ? 'cursor-not-allowed bg-[#F9F8FD] text-gray-500'
            : 'bg-white'
        }`}
      />

      <div className="flex items-center gap-1">
        <input
          value={row.isEditing ? row.draftYear : String(exp.year)}
          onChange={(e) =>
            row.setDraftYear(e.target.value.replace(/[^\d]/g, ''))
          }
          disabled={!row.isEditing || row.isPending}
          className={`h-40 w-50 rounded-md border border-[#E4DDFD] p-5 text-left ${
            !row.isEditing
              ? 'cursor-not-allowed bg-[#F9F8FD] text-gray-500'
              : 'bg-white'
          }`}
        />
        <span className="text-md">년차</span>
      </div>

      {!row.isEditing ? (
        <div className="flex items-center gap-8">
          <Button
            disabled={row.isPending}
            onClick={row.startEdit}
            className="flex items-center justify-center rounded-md border border-black p-10 text-xs text-gray-500"
          >
            <Edit />
          </Button>

          <Button
            disabled={row.isPending}
            onClick={row.remove}
            className="flex items-center justify-center rounded-md border border-[#FF0202] p-10 text-xs text-gray-500"
          >
            <Trash />
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-8">
          <Button
            disabled={row.isPending}
            onClick={row.cancelEdit}
            className="flex items-center justify-center rounded-md border border-black p-10 text-xs text-gray-500"
          >
            <Close />
          </Button>

          <Button
            disabled={row.isPending || !row.canSubmit}
            onClick={row.submitEdit}
            className="flex items-center justify-center rounded-md border border-[var(--color-accent)] p-10 text-xs text-gray-500"
          >
            <Check />
          </Button>
        </div>
      )}
    </div>
  )
}
