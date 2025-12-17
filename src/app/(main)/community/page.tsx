'use client'

import CommunityCardGrid from '@/widgets/community/ui/CommunityCardGrid'
import CommunitySidebar from '@/widgets/community/ui/CommunitySidebar'
import useOpen from '@/shared/model/useOpen'
import CommunityTabs from '@/features/community/ui/CommunityTabs'
import CommunityNewsList from '@/widgets/community/ui/CommunityNewsList'
import { useSearchParams } from 'next/navigation'

const SIDEBAR_WIDTH = 300
const HEADER_HEIGHT = 80

export default function CommunityPage() {
  const { isOpen, toggleOpen } = useOpen()
  const searchParams = useSearchParams()

  const tab = searchParams.get('tab') || 'post'
  const listId = searchParams.get('list')

  return (
    <div className="relative flex w-full overflow-x-hidden">
      {/* 메인 영역 */}
      <div className="w-full">
        <CommunityTabs />

        <div className="flex justify-center py-60">
          <div className="w-full max-w-[1200px] px-24">
            {tab === 'news' ? (
              <CommunityNewsList />
            ) : (
              <CommunityCardGrid listId={listId} />
            )}
          </div>
        </div>
      </div>

      {/* 🔹 사이드바 */}
      <div
        className="fixed right-0 z-40"
        style={{
          top: `${HEADER_HEIGHT}px`,
          height: `calc(100dvh - ${HEADER_HEIGHT}px)`,
          overflow: 'visible',
        }}
      >
        <CommunitySidebar isOpen={isOpen} toggleOpen={toggleOpen} />
      </div>
      <div
        className="shrink-0 transition-[width] duration-300"
        style={{
          width: isOpen ? `${SIDEBAR_WIDTH}px` : '0px',
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}
