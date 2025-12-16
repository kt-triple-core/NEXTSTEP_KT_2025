'use client'

import { useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { COMMUNITY_TAB_LIST } from '../model/constants'
import type { CommunityTabKey } from '../model/types'

const CommunityTabs = () => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const activeTab: CommunityTabKey =
    (searchParams.get('tab') as CommunityTabKey) ?? 'all'

  const handleTabClick = useCallback(
    (key: CommunityTabKey) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set('tab', key)

      router.push(`?${params.toString()}`, { scroll: false })
    },
    [router, searchParams]
  )

  return (
    <div className="flex gap-20 border-b border-gray-300">
      {COMMUNITY_TAB_LIST.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => handleTabClick(tab.key)}
          className={`text-14 px-20 py-10 font-medium ${
            activeTab === tab.key
              ? 'border-accent text-accent border-b-2'
              : 'text-foreground-light'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

export default CommunityTabs
