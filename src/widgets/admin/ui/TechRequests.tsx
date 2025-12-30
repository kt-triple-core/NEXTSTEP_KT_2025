'use client'

import { useState } from 'react'
import { techRequests } from '../model/dummy'
import StatusPill from './StatusPill'

export default function TechRequests() {
  const [list, setList] = useState(techRequests)

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
            <div className="text-foreground font-semibold">{r.name}</div>
            <div className="text-foreground-light">{r.requestedBy}</div>

            <StatusPill status={r.status} />

            <div className="flex gap-8">
              <button
                className="border-border text-12 rounded-lg border px-12 py-6"
                onClick={() =>
                  setList((prev) =>
                    prev.map((x) =>
                      x.id === r.id ? { ...x, status: 'approved' } : x
                    )
                  )
                }
              >
                수락
              </button>
              <button
                className="border-border text-12 rounded-lg border px-12 py-6"
                onClick={() =>
                  setList((prev) =>
                    prev.map((x) =>
                      x.id === r.id ? { ...x, status: 'rejected' } : x
                    )
                  )
                }
              >
                거절
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
