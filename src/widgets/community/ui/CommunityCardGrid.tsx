'use client'

import CommunityCard from './CommunityCard'
import { useRouter } from 'next/navigation'

const dummyPosts = [
  { id: 1, title: 'React 상태관리 뭐 써야 하나요?' },
  { id: 2, title: '백엔드 취업 준비 로드맵 공유합니다.' },
  { id: 3, title: 'CS 공부 어떻게 시작하셨나요?' },
  { id: 4, title: 'Next.js App Router 정리 글' },
  { id: 5, title: '사이드 프로젝트 팀원 모집합니다.' },
  { id: 6, title: '프로젝트 코드 리뷰 받고 싶어요.' },
  { id: 7, title: 'React 상태관리 뭐 써야 하나요?' },
  { id: 8, title: '백엔드 취업 준비 로드맵 공유합니다.' },
  { id: 9, title: 'CS 공부 어떻게 시작하셨나요?' },
  { id: 10, title: 'Next.js App Router 정리 글' },
  { id: 11, title: '사이드 프로젝트 팀원 모집합니다.' },
  { id: 12, title: '프로젝트 코드 리뷰 받고 싶어요.' },
]

export default function CommunityCardGrid() {
  const router = useRouter()

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-2">
      {dummyPosts.map((post) => (
        <CommunityCard
          key={post.id}
          title={post.title}
          onClick={() => {
            router.push(`/community/${post.id}`)
          }}
        />
      ))}
    </div>
  )
}
