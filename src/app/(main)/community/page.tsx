'use client'

import CommunityCardGrid from '@/widgets/community/ui/CommunityCardGrid'
import CommunitySidebar from '@/widgets/community/ui/CommunitySidebar'
import useOpen from '@/shared/model/useOpen'
import CommunityTabs from '@/features/community/ui/CommunityTabs'
import CommunityNewsList from '@/widgets/community/ui/CommunityNewsList'
import { useSearchParams } from 'next/navigation'

const CommunityPage = () => {
  const { isOpen, toggleOpen } = useOpen()
  const searchParams = useSearchParams()

  const tab = searchParams.get('tab') || 'post'
  const listId = searchParams.get('list')

  return (
    <div className="flex h-[calc(100vh-80px)] w-full overflow-hidden">
      <div className="flex w-full flex-col">
        {/* 고정 탭 */}
        <div className="shrink-0">
          <CommunityTabs />
        </div>

        {/* 스크롤 영역 */}
        <div className="flex flex-1 justify-center overflow-y-auto py-60">
          <div className="w-full max-w-[1200px] px-24">
            {tab === 'news' ? <CommunityNewsList /> : <CommunityCardGrid />}
          </div>
        </div>
      </div>

      {/* 커뮤니티 전용 사이드바 */}
      <CommunitySidebar isOpen={isOpen} toggleOpen={toggleOpen} />
    </div>
  )
}

export default CommunityPage
