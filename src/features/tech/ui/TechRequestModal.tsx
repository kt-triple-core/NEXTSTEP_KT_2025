'use client'

import { useEffect, useState } from 'react'

interface Props {
  initialData?: {
    name?: string
    description?: string
    icon_url?: string
  }
  onClose: () => void
  onSubmit: (data: {
    name: string
    description: string
    icon_url: string
  }) => void
}

export default function TechRequestModal({
  initialData,
  onClose,
  onSubmit,
}: Props) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [iconUrl, setIconUrl] = useState('')

  useEffect(() => {
    if (initialData) {
      setName(initialData.name ?? '')
      setDescription(initialData.description ?? '')
      setIconUrl(initialData.icon_url ?? '')
    }
  }, [initialData])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-background w-[420px] rounded-2xl p-24">
        <h3 className="text-16 mb-16 font-semibold">기술 스택 관리자 요청</h3>

        <div className="flex flex-col gap-12">
          <input
            placeholder="기술 이름"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-xl border px-14 py-10 text-sm"
          />

          <textarea
            placeholder="기술 설명"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="rounded-xl border px-14 py-10 text-sm"
          />

          <input
            placeholder="아이콘 URL (선택)"
            value={iconUrl}
            onChange={(e) => setIconUrl(e.target.value)}
            className="rounded-xl border px-14 py-10 text-sm"
          />

          {iconUrl && (
            <div className="flex items-center gap-12">
              <span className="text-xs text-gray-400">미리보기</span>
              <img
                src={iconUrl}
                alt="icon preview"
                className="h-24 w-24 object-contain"
              />
            </div>
          )}
        </div>

        <div className="mt-20 flex justify-end gap-8">
          <button onClick={onClose} className="px-12 py-8 text-sm">
            취소
          </button>
          <button
            onClick={() => {
              if (!name.trim()) {
                alert('기술 이름은 필수입니다')
                return
              }
              onSubmit({ name, description, icon_url: iconUrl })
            }}
            className="rounded-lg bg-purple-600 px-14 py-8 text-sm text-white"
          >
            관리자에게 요청하기
          </button>
        </div>
      </div>
    </div>
  )
}
