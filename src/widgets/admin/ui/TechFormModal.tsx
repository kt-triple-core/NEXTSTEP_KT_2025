'use client'

import { useEffect, useState } from 'react'
import { Tech } from '../model/types'

interface Props {
  tech: Tech | null
  onClose: () => void
  onSave: (name: string, category: string, iconUrl: string) => void
}

export default function TechFormModal({ tech, onClose, onSave }: Props) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [iconUrl, setIconUrl] = useState('')

  useEffect(() => {
    if (tech) {
      setName(tech.name ?? '')
      setCategory(tech.category ?? '')
      setIconUrl(tech.iconUrl ?? '')
    } else {
      setName('')
      setCategory('')
      setIconUrl('')
    }
  }, [tech])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-background w-[420px] rounded-2xl p-24">
        <h3 className="text-16 text-foreground mb-16 font-semibold">
          {tech ? '기술 스택 수정' : '기술 스택 등록'}
        </h3>

        <div className="flex flex-col gap-12">
          {/* 이름 */}
          <input
            placeholder="기술 이름 (예: React, FastAPI)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border-border bg-background-light rounded-xl border px-14 py-10 text-sm"
          />

          {/* 설명 */}
          <textarea
            placeholder="설명 (예: 프론트엔드 라이브러리)"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            rows={3}
            className="border-border bg-background-light rounded-xl border px-14 py-10 text-sm"
          />

          {/* 아이콘 URL */}
          <input
            placeholder="아이콘 URL (https://...)"
            value={iconUrl}
            onChange={(e) => setIconUrl(e.target.value)}
            className="border-border bg-background-light rounded-xl border px-14 py-10 text-sm"
          />

          {/* 미리보기 */}
          {iconUrl && (
            <div className="flex items-center gap-12 pt-8">
              <span className="text-foreground-light text-xs">미리보기</span>
              <img
                src={iconUrl}
                alt="preview"
                className="h-24 w-24 object-contain"
              />
            </div>
          )}
        </div>

        {/* 버튼 */}
        <div className="mt-20 flex justify-end gap-8">
          <button
            onClick={onClose}
            className="text-foreground-light rounded-lg px-14 py-8 text-sm"
          >
            취소
          </button>
          <button
            onClick={() => {
              if (!name.trim()) {
                alert('기술 이름을 입력하세요')
                return
              }
              onSave(name, category, iconUrl)
            }}
            className="rounded-lg bg-[var(--color-accent)] px-14 py-8 text-sm font-semibold text-white"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  )
}
