'use client'

import { useState } from 'react'
import AdminTabs from './AdminTabs'
import BoardStats from './BoardStats'
import TechRequests from './TechRequests'
import TechList from './TechList'

export type AdminTab = 'board' | 'requests' | 'techs'

export default function Admin() {
  const [tab, setTab] = useState<AdminTab>('board')

  return (
    <section className="rounded-2xl bg-[var(--color-primary)] p-16">
      <div className="mb-16">
        <div className="text-14 inline-flex rounded-md bg-[var(--color-accent)] px-16 py-8 font-semibold text-white">
          ADMIN
        </div>
        <h2 className="text-20 text-foreground mt-10 font-semibold">관리자</h2>
      </div>

      <AdminTabs tab={tab} onChange={setTab} />

      <div className="mt-16 rounded-2xl bg-[var(--color-secondary)] p-16">
        {tab === 'board' && <BoardStats />}
        {tab === 'requests' && <TechRequests />}
        {tab === 'techs' && <TechList />}
      </div>
    </section>
  )
}
