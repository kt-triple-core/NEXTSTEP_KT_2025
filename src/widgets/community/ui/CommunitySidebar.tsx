'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Sidebar from '@/shared/ui/Sidebar'

interface CommunitySidebarProps {
  isOpen: boolean
  toggleOpen: () => void
}

interface Community {
  list_id: string
  name: string
}

const CommunitySidebar = ({ isOpen, toggleOpen }: CommunitySidebarProps) => {
  //커뮤니티 리스트 상태 관리
  const [communityList, setCommunityList] = useState<Community[]>([])
  const router = useRouter()
  //어떤 커뮤니티 리스트가 선택되었는지 확인하기 위해 searchParams 사용
  const searchParams = useSearchParams()
  const currentList = searchParams.get('list')
  //커뮤니티 리스트 API 호출
  useEffect(() => {
    const fetchCommunityList = async () => {
      const res = await fetch('/api/community/lists')
      const list: Community[] = await res.json()
      setCommunityList(list)
    }

    fetchCommunityList()
  }, [])

  return (
    <Sidebar isOpen={isOpen} toggleOpen={toggleOpen}>
      {/* ===== 헤더 ===== */}
      <div className="point-gradient flex items-center gap-10 p-16 text-white">
        <div className="h-20 w-20 rounded-full border-2 border-white" />
        <p className="text-xl font-semibold">Community List</p>
      </div>

      {/* ===== 커뮤니티 리스트 ===== */}
      <div className="flex w-full flex-col gap-16 p-16">
        {communityList.map((item) => {
          const isActive = currentList === item.list_id

          return (
            <button
              key={item.list_id}
              onClick={() => {
                router.push(`/community?list=${item.list_id}&tab=post`)
                toggleOpen()
              }}
              className={`flex flex-col gap-12 rounded-2xl p-16 text-left shadow-sm transition ${
                isActive
                  ? 'bg-accent text-white'
                  : 'bg-secondary hover:shadow-md'
              } `}
            >
              {/* 상단 */}
              <div className="flex items-center justify-between">
                <p
                  className={`text-16 font-semibold ${
                    isActive ? 'text-white' : 'text-foreground'
                  }`}
                >
                  {item.name}
                </p>
                <div
                  className={`h-30 w-30 rounded-full ${
                    isActive ? 'bg-white/30' : 'bg-accent'
                  }`}
                />
              </div>

              {/* 하단 */}
              <p
                className={`text-12 ${
                  isActive ? 'text-white/80' : 'text-foreground-light'
                }`}
              >
                Community
              </p>
            </button>
          )
        })}
      </div>
    </Sidebar>
  )
}
export default CommunitySidebar
