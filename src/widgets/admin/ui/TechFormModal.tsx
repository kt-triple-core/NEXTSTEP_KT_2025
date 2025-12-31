'use client'

import { useState } from 'react'
import { Tech } from '../model/types'

interface Props {
  tech: Tech | null
  onClose: () => void
  onSave: (name: string, category: string, iconUrl: string) => void
}

export default function TechFormModal({ tech, onClose, onSave }: Props) {
  const [form, setForm] = useState(() => ({
    name: tech?.name ?? '',
    category: tech?.category ?? '',
    iconUrl: tech?.iconUrl ?? '',
  }))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-background w-[420px] rounded-2xl p-24">
        <h3 className="text-16 text-foreground mb-16 font-semibold">
          {tech ? '기술 스택 수정' : '기술 스택 등록'}
        </h3>

        <div className="flex flex-col gap-12">
          <input
            placeholder="기술 이름"
            value={form.name}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, name: e.target.value }))
            }
            className="border-border bg-background-light rounded-xl border px-14 py-10 text-sm"
          />

          <textarea
            placeholder="설명"
            value={form.category}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, category: e.target.value }))
            }
            rows={3}
            className="border-border bg-background-light rounded-xl border px-14 py-10 text-sm"
          />

          <input
            placeholder="아이콘 URL"
            value={form.iconUrl}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, iconUrl: e.target.value }))
            }
            className="border-border bg-background-light rounded-xl border px-14 py-10 text-sm"
          />

          {form.iconUrl && (
            <img
              src={form.iconUrl}
              alt="preview"
              className="h-24 w-24 object-contain"
            />
          )}
        </div>

        <div className="mt-20 flex justify-end gap-8">
          <button onClick={onClose}>취소</button>
          <button
            onClick={() => {
              if (!form.name.trim()) return alert('이름 입력')
              onSave(form.name, form.category, form.iconUrl)
            }}
          >
            저장
          </button>
        </div>
      </div>
    </div>
  )
}
