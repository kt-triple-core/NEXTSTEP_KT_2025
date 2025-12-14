'use client'

import CommunityCardGrid from '@/widgets/community/ui/CommunityCardGrid'
import CommunitySidebar from '@/widgets/community/ui/CommunitySidebar'
import useOpen from '@/shared/model/useOpen'

export default function CommunityPage() {
  const { isOpen, toggleOpen } = useOpen()

  return (
    <div className="flex w-full overflow-x-hidden">
      {/* 커뮤니티 카드 영역 */}
      <div className="flex flex-1 justify-center py-60">
        <div className="w-full max-w-[1200px] px-24">
          <CommunityCardGrid />
        </div>
      </div>

      {/* 커뮤니티 전용 사이드바 */}
      <CommunitySidebar isOpen={isOpen} toggleOpen={toggleOpen} />
    </div>
  )
}
