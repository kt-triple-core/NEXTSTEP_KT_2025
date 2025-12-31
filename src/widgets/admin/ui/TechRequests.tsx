'use client'

import { useEffect, useState } from 'react'
import StatusPill from './StatusPill'
import TechFormModal from './TechFormModal'

interface TechRequest {
  id: string
  name: string
  description: string
  icon_url: string | null
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

export default function TechRequests() {
  const [list, setList] = useState<TechRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<TechRequest | null>(null)

  // 🔹 목록 불러오기
  const loadRequests = async () => {
    try {
      const res = await fetch('/api/admin/tech-requests')
      const data = await res.json()
      setList(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error(e)
      setList([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRequests()
  }, [])

  // 🔹 상태 변경
  const updateStatus = async (id: string, status: 'approved' | 'rejected') => {
    await fetch(`/api/admin/techs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    loadRequests()
  }

  if (loading) {
    return <div className="text-sm text-gray-400">불러오는 중…</div>
  }

  return (
    <div>
      <h3 className="text-16 text-foreground mb-12 font-semibold">
        기술 스택 요청
      </h3>

      <div className="flex flex-col gap-8">
        {list.map((r) => (
          <div
            key={r.id}
            className="border-border bg-background-light flex items-center justify-between rounded-xl border px-16 py-12"
          >
            <div className="flex items-center gap-12">
              {r.icon_url && (
                <img
                  src={r.icon_url}
                  alt={r.name}
                  className="h-24 w-24 object-contain"
                />
              )}
              <div className="font-semibold">{r.name}</div>
            </div>

            <StatusPill status={r.status} />

            <div className="flex gap-8">
              <button
                className="border-border text-12 rounded-lg border px-12 py-6"
                onClick={() => setEditing(r)}
              >
                수정
              </button>
              <button
                className="border-border text-12 rounded-lg border px-12 py-6"
                onClick={() => updateStatus(r.id, 'approved')}
              >
                수락
              </button>
              <button
                className="border-border text-12 rounded-lg border px-12 py-6"
                onClick={() => updateStatus(r.id, 'rejected')}
              >
                거절
              </button>
            </div>
          </div>
        ))}

        {list.length === 0 && (
          <div className="text-foreground-light py-20 text-center text-sm">
            요청된 기술 스택이 없습니다.
          </div>
        )}
      </div>

      {editing && (
        <TechFormModal
          tech={{
            // 🔁 TechRequest → Tech 타입으로 매핑
            id: editing.id,
            name: editing.name,
            category: editing.description, // ⭐ 핵심
            iconUrl: editing.icon_url ?? '',
          }}
          onClose={() => setEditing(null)}
          onSave={async (name, category, iconUrl) => {
            await fetch(`/api/admin/tech-requests/${editing.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name,
                description: category, // 다시 되돌림
                icon_url: iconUrl,
              }),
            })

            setEditing(null)
            loadRequests()
          }}
        />
      )}
    </div>
  )
}
