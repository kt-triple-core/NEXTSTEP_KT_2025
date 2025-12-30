'use client'

import { useState } from 'react'
import { techList } from '../model/dummy'
import { Tech } from '../model/types'
import TechFormModal from './TechFormModal'

export default function TechList() {
  const [list, setList] = useState<Tech[]>(techList)
  const [editing, setEditing] = useState<Tech | null>(null)

  return (
    <div>
      <div className="mb-12 flex items-center justify-between">
        <h3 className="text-16 text-foreground font-semibold">
          기술 스택 목록
        </h3>
        <button
          onClick={() => setEditing({} as Tech)}
          className="text-12 rounded-xl bg-[var(--color-accent)] px-14 py-8 font-semibold text-white"
        >
          + 등록
        </button>
      </div>

      <div className="flex flex-col gap-8">
        {list.map((t) => (
          <div
            key={t.id}
            className="border-border bg-background-light flex items-center justify-between rounded-xl border px-16 py-12"
          >
            <div className="text-foreground font-semibold">{t.name}</div>
            <div className="text-foreground-light">{t.category}</div>
            <div className="flex gap-8">
              <button
                className="border-border text-12 rounded-lg border px-12 py-6"
                onClick={() => setEditing(t)}
              >
                수정
              </button>
              <button
                className="border-border text-12 rounded-lg border px-12 py-6"
                onClick={() =>
                  setList((prev) => prev.filter((x) => x.id !== t.id))
                }
              >
                삭제
              </button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <TechFormModal
          tech={editing.id ? editing : null}
          onClose={() => setEditing(null)}
          onSave={(name, category) => {
            if (editing.id) {
              setList((prev) =>
                prev.map((x) =>
                  x.id === editing.id ? { ...x, name, category } : x
                )
              )
            } else {
              setList((prev) => [
                {
                  id: `t_${Date.now()}`,
                  name,
                  category,
                  createdAt: new Date().toISOString().slice(0, 10),
                },
                ...prev,
              ])
            }
            setEditing(null)
          }}
        />
      )}
    </div>
  )
}
