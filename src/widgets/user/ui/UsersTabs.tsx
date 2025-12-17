'use client'

import { useCallback, useState } from 'react'
import Quest from '@/widgets/user/ui/Quest'
import Shop from '@/widgets/user/ui/Shop'
import Profile from '@/widgets/user/ui/Profile'
import TAB_LIST from '@/widgets/user/model/constants'
import { useRouter, useSearchParams } from 'next/navigation'

const UsersTabs = () => {
  const router = useRouter()
  const searchParams = useSearchParams()

  // URL에서 현재 탭 읽기 (?tab=quest)
  const tabFromUrl = (searchParams.get('tab') as TabKey) || 'profile'
  const activeTab: TabKey = tabFromUrl

  const renderTab = () => {
    switch (activeTab) {
      case 'profile':
        return <Profile />
      case 'quest':
        return <Quest />
      case 'shop':
        return <Shop />
      default:
        return null
    }
  }

  const handleTabClick = useCallback(
    (key: TabKey) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set('tab', key)

      // /users?tab=quest 이런 식으로 URL 변경
      router.push(`?${params.toString()}`, { scroll: false })
    },
    [router, searchParams]
  )

  return (
    <div className="flex flex-col gap-20">
      {/* 탭 버튼 영역 */}
      <div className="flex gap-20 border-b border-gray-300">
        {TAB_LIST.map((tab) => (
          <button
            key={tab.key}
            className={`px-20 py-10 ${
              activeTab === tab.key
                ? 'border-accent text-accent border-b-2'
                : 'text-gray-500'
            }`}
            onClick={() => handleTabClick(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 실제 탭 내용 렌더링 */}
      <div>{renderTab()}</div>
    </div>
  )
}
export default UsersTabs
