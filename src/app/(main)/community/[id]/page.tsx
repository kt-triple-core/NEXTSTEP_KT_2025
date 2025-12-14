'use client'

import { useParams } from 'next/navigation'
import CommunitySidebar from '@/widgets/community/ui/CommunitySidebar'
import useOpen from '@/shared/model/useOpen'

export default function CommunityDetailPage() {
  const params = useParams()
  const postId = params.id
  const { isOpen, toggleOpen } = useOpen()

  return (
    <div className="flex w-full overflow-x-hidden">
      <div className="flex w-full justify-center px-40 py-40">
        {/* 전체 카드 컨테이너 */}
        <div className="bg-primary w-full max-w-1200 rounded-2xl p-24">
          {/* ===== 상단 헤더 ===== */}
          <div className="mb-20 flex items-center justify-between">
            <div className="flex gap-8">
              <button className="bg-secondary text-foreground hover:bg-secondary/70 rounded-lg px-12 py-6 shadow-sm transition-colors">
                ◀
              </button>
              <button className="bg-secondary text-foreground hover:bg-secondary/70 rounded-lg px-12 py-6 shadow-sm transition-colors">
                ▶
              </button>
            </div>

            <div className="flex gap-8">
              <button className="bg-secondary text-foreground hover:bg-secondary/70 rounded-lg px-12 py-6 shadow-sm transition-colors">
                ⤴
              </button>
              <button className="bg-secondary text-foreground hover:bg-secondary/70 rounded-lg px-12 py-6 shadow-sm transition-colors">
                ✕
              </button>
            </div>
          </div>

          {/* ===== 작성자 + 제목 ===== */}
          <div className="bg-secondary mb-20 flex items-center gap-16 rounded-xl p-16">
            <div className="bg-accent h-40 w-40 rounded-full" />
            <div className="flex flex-col">
              <p className="text-foreground-light text-sm">
                이주형 · 프론트엔드 3년차
              </p>
              <p className="text-lg font-semibold">
                프론트엔드 3년차의 학습 리스트 공유합니다
              </p>
            </div>
          </div>

          {/* ===== 메인 콘텐츠 영역 (회색 네모) ===== */}
          <div className="relative mb-24">
            {/* 회색 플레이스홀더 */}
            <div className="h-420 w-full rounded-2xl bg-gray-200" />

            {/* 우측 버튼 그룹 */}
            <div className="absolute right-16 bottom-16 flex flex-col gap-8">
              <button className="bg-accent rounded-lg px-16 py-8 text-sm text-white shadow">
                이미지로 저장하기
              </button>
              <button className="bg-accent rounded-lg px-16 py-8 text-sm text-white shadow">
                내 워크페이스에 불러오기
              </button>
              <button className="bg-accent flex h-48 w-48 items-center justify-center rounded-full text-2xl text-white shadow">
                +
              </button>
            </div>
          </div>

          {/* ===== 본문 텍스트 ===== */}
          <p className="text-foreground mb-32 text-sm leading-relaxed">
            Lorem Ipsum is simply dummy text of the printing and typesetting
            industry...
          </p>

          {/* ===== 댓글 영역 ===== */}
          <div className="flex flex-col gap-12">
            <p className="font-semibold">댓글 (3)</p>

            {[1, 2, 3].map((_, idx) => (
              <div
                key={idx}
                className="bg-secondary flex gap-12 rounded-xl p-16"
              >
                <div className="bg-accent h-36 w-36 rounded-full" />
                <div className="flex flex-col">
                  <p className="text-sm font-semibold">
                    사용자{idx + 1} · 프론트엔드 3년차
                  </p>
                  <p className="text-foreground-light text-sm">
                    Lorem Ipsum is simply dummy text of the printing industry.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* 커뮤니티 전용 사이드바 */}
      <CommunitySidebar isOpen={isOpen} toggleOpen={toggleOpen} />
    </div>
  )
}
