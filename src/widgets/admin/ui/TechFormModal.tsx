'use client'

import { useState } from 'react'
import { Tech } from '../model/types'

export default function TechFormModal({
  tech,
  onClose,
  onSave,
}: {
  tech: Tech | null
  onClose: () => void
  onSave: (name: string, category: string) => void
}) {
  const [name, setName] = useState(tech?.name ?? '')
  const [category, setCategory] = useState(tech?.category ?? 'Frontend')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-16">
      <div className="w-full max-w-[420px] rounded-2xl bg-[var(--color-primary)] p-16">
        <h4 className="text-16 text-foreground mb-12 font-semibold">
          {tech ? '기술 스택 수정' : '기술 스택 등록'}
        </h4>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="기술 이름"
          className="border-border bg-background text-14 mb-10 h-[40px] w-full rounded-xl border px-12"
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border-border bg-background text-14 mb-16 h-[40px] w-full rounded-xl border px-12"
        >
          <option value="Frontend">Frontend</option>
          <option value="Backend">Backend</option>
          <option value="Database">Database</option>
          <option value="DevOps">DevOps</option>
        </select>

        <div className="flex justify-end gap-10">
          <button
            onClick={onClose}
            className="border-border text-12 rounded-lg border px-12 py-6"
          >
            취소
          </button>
          <button
            onClick={() => onSave(name, category)}
            className="text-12 rounded-lg bg-[var(--color-accent)] px-12 py-6 font-semibold text-white"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  )
}
