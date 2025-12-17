'use client'

import CommunityCardGrid from '@/widgets/community/ui/CommunityCardGrid'
import CommunitySidebar from '@/widgets/community/ui/CommunitySidebar'
import useOpen from '@/shared/model/useOpen'
import CommunityTabs from '@/features/community/ui/CommunityTabs'
import CommunityNewsList from '@/widgets/community/ui/CommunityNewsList'
import { useSearchParams } from 'next/navigation'

export default function CommunityPage() {
  const { isOpen, toggleOpen } = useOpen()
  const searchParams = useSearchParams()

  const tab = searchParams.get('tab') || 'post'
  const listId = searchParams.get('list')

  return (
    <div className="flex w-full overflow-x-hidden">
      <div className="w-full">
        <CommunityTabs />
        {/* 커뮤니티 카드 영역 */}
        <div className="flex flex-1 justify-center py-60">
          <div className="w-full max-w-[1200px] px-24">
            {tab === 'news' ? <CommunityNewsList /> : <CommunityCardGrid />}
          </div>
        </div>
      </div>

      {/* 커뮤니티 전용 사이드바 */}
      <CommunitySidebar isOpen={isOpen} toggleOpen={toggleOpen} />
      {/* <div className="flex"></div> */}
    </div>
  )
}
