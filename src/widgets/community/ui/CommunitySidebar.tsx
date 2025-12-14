'use client'

import Sidebar from '@/shared/ui/Sidebar'

interface CommunitySidebarProps {
  isOpen: boolean
  toggleOpen: () => void
}

const communityList = [
  {
    id: 'frontend',
    title: 'Front-end',
    users: '2,389 users',
    posts: '128,398 posts',
  },
  {
    id: 'backend',
    title: 'Back-end',
    users: '1,719 users',
    posts: '124,398 posts',
  },
  {
    id: 'Full-stack',
    title: 'Full-stack',
    users: '1,219 users',
    posts: '19,398 posts',
  },
  {
    id: 'Generative AI',
    title: 'Generative AI',
    users: '2,389 users',
    posts: '128,398 posts',
  },
  {
    id: 'Cloud Infrastructure',
    title: 'Cloud Infrastructure',
    users: '1,719 users',
    posts: '124,398 posts',
  },
  {
    id: 'Cloud Native',
    title: 'Cloud Native',
    users: '1,219 users',
    posts: '19,398 posts',
  },
  {
    id: 'Cyber Security',
    title: 'Cyber Security',
    users: '2,389 users',
    posts: '128,398 posts',
  },
  {
    id: 'Product Management',
    title: 'Product Management',
    users: '1,719 users',
    posts: '124,398 posts',
  },
  {
    id: 'Product Design',
    title: 'Product Design',
    users: '1,219 users',
    posts: '19,398 posts',
  },
]

export default function CommunitySidebar({
  isOpen,
  toggleOpen,
}: CommunitySidebarProps) {
  return (
    <Sidebar isOpen={isOpen} toggleOpen={toggleOpen}>
      {/* ===== 헤더 ===== */}
      <div className="point-gradient flex items-center gap-10 p-16 text-white">
        <div className="h-20 w-20 rounded-full border-2 border-white" />
        <p className="text-xl font-semibold">Community List</p>
      </div>

      {/* ===== 커뮤니티 리스트 ===== */}
      <div className="flex w-full flex-col gap-16 p-16">
        {communityList.map((item) => (
          <button
            key={item.id}
            className="bg-secondary flex flex-col gap-12 rounded-2xl p-16 text-left shadow-sm transition hover:shadow-md"
          >
            {/* 상단 */}
            <div className="flex items-center justify-between">
              <p className="text-foreground text-16 font-semibold">
                {item.title}
              </p>
              <div className="bg-accent h-30 w-30 rounded-full" />
            </div>

            {/* 하단 */}
            <p className="text-foreground-light text-12">
              {item.users} / {item.posts}
            </p>
          </button>
        ))}
      </div>
    </Sidebar>
  )
}
