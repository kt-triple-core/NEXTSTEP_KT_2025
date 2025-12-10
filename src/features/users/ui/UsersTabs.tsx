'use client'

import { useState } from 'react'
import ProfileTab from '@/features/users/ui/Profile'
import QuestTab from '@/features/users/ui/Quest'
import ShopTab from '@/features/users/ui/Shop'

const tabs = [
  { key: 'profile', label: '내 프로필' },
  { key: 'quest', label: '퀘스트' },
  { key: 'shop', label: '상점' },
]

const UsersTabs = () => {
  const [activeTab, setActiveTab] = useState('profile')

  const renderTab = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileTab />
      case 'quest':
        return <QuestTab />
      case 'shop':
        return <ShopTab />
      default:
        return null
    }
  }

  return (
    <div className="flex flex-col gap-20">
      {/* 탭 버튼 영역 */}
      <div className="flex gap-20 border-b pb-10">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`px-20 py-10 ${
              activeTab === tab.key
                ? 'border-accent text-accent border-b-2'
                : 'text-gray-500'
            }`}
            onClick={() => setActiveTab(tab.key)}
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
