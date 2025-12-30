'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Community {
  list_id: string
  name: string
}

const CommunityListPage = () => {
  const [communityList, setCommunityList] = useState<Community[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchCommunityList = async () => {
      try {
        const res = await fetch('/api/community/lists')
        const list: Community[] = await res.json()
        setCommunityList(list)
      } catch (error) {
        console.error('커뮤니티 리스트 조회 실패', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCommunityList()
  }, [])

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-14 text-foreground-light">불러오는 중...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-24 p-24">
      {/* ===== 페이지 타이틀 ===== */}
      <div className="flex flex-col gap-8">
        <h1 className="text-24 font-bold">Community</h1>
        <p className="text-14 text-foreground-light">
          관심 있는 주제의 커뮤니티를 선택해 참여해보세요
        </p>
      </div>

      {/* ===== 커뮤니티 리스트 ===== */}
      <div className="grid grid-cols-1 gap-20 sm:grid-cols-2">
        {communityList.map((item) => (
          <button
            key={item.list_id}
            onClick={() =>
              router.push(`/community?list=${item.list_id}&tab=post`)
            }
            className="group bg-primary flex cursor-pointer flex-col gap-16 rounded-2xl p-20 text-left transition hover:shadow-lg"
          >
            {/* 상단 */}
            <div className="flex items-center justify-between">
              <p className="text-18 text-foreground font-semibold">
                {item.name}
              </p>
              <div className="bg-accent h-32 w-32 rounded-full opacity-80 transition group-hover:opacity-100" />
            </div>

            <p className="text-14 text-foreground-light">
              {item.name} 관련 글과 로드맵을 공유하는 커뮤니티입니다.
            </p>

            <div className="text-12 text-foreground-light mt-8 flex items-center justify-between">
              <span>Community</span>
              <span className="text-accent group-hover:underline">
                입장하기 →
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* 커뮤니티 없을 때 */}
      {communityList.length === 0 && (
        <div className="flex h-200 items-center justify-center">
          <p className="text-14 text-foreground-light">
            아직 생성된 커뮤니티가 없습니다.
          </p>
        </div>
      )}
    </div>
  )
}

export default CommunityListPage
