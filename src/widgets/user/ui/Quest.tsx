'use client'

import QuestCard, { QuestCardVariant } from '@/features/user/quest/ui/QuestCard'
import { Button } from '@/shared/ui'
import { Add, Comment, Like, Send } from '@/shared/ui/icon'
import { useEffect, useMemo, useState } from 'react'

type QuestStatus = 'locked' | 'ready' | 'completed'

type QuestUI = {
  id: 1 | 2 | 3 | 4
  title: string
  description: string
  leftIcon: React.ReactNode
  targetCount: number
  rewardPoint: number
  variant: QuestCardVariant
}

type TodayQuestResponse = {
  questDate: string
  point: number
  quests: Array<{ questNo: 1 | 2 | 3 | 4; status: QuestStatus }>
}

type PatchQuestResponse = {
  message: string
  questDate?: string
  point?: number
  quests: Array<{ questNo: 1 | 2 | 3 | 4; status: QuestStatus }>
}

const initialQuests: QuestUI[] = [
  {
    id: 1,
    title: '나의 로드맵 공유하기',
    description: '로드맵을 커뮤니티에 공유해보세요.',
    targetCount: 1,
    rewardPoint: 200,
    variant: 'locked',
    leftIcon: <Send />,
  },
  {
    id: 2,
    title: '인상적인 로드맵 하트 누르기',
    description: '다른 사람의 로드맵에 하트를 눌러보세요.',
    targetCount: 1,
    rewardPoint: 200,
    variant: 'locked',
    leftIcon: <Like />,
  },
  {
    id: 3,
    title: '커뮤니티에 댓글 작성하기',
    description: '커뮤니티 게시글에 댓글을 작성해보세요.',
    targetCount: 1,
    rewardPoint: 200,
    variant: 'locked',
    leftIcon: <Comment />,
  },
  {
    id: 4,
    title: '새로운 워크스페이스 만들기',
    description: '새로운 작업 환경을 만들어보세요.',
    targetCount: 1,
    rewardPoint: 200,
    variant: 'locked',
    leftIcon: <Add />,
  },
]

function toVariant(status: QuestStatus): QuestCardVariant {
  if (status === 'completed') return 'completed'
  if (status === 'ready') return 'ready'
  return 'locked'
}

function toCurrentCount(status: QuestStatus) {
  return status === 'locked' ? 0 : 1
}

const Quest = () => {
  const [quests, setQuests] = useState<QuestUI[]>(initialQuests)
  const [point, setPoint] = useState<number | null>(null)
  const [claimingId, setClaimingId] = useState<1 | 2 | 3 | 4 | null>(null)

  // 첫 진입: 오늘 상태/포인트 로드
  useEffect(() => {
    const loadToday = async () => {
      const res = await fetch('/api/users/quests', { method: 'GET' })
      if (!res.ok) {
        setPoint(0)
        return
      }

      const data = (await res.json()) as TodayQuestResponse
      setPoint(data.point ?? 0)

      setQuests((prev) =>
        prev.map((q) => {
          const server = data.quests.find((x) => x.questNo === q.id)
          if (!server) return q
          return { ...q, variant: toVariant(server.status) }
        })
      )
    }

    loadToday()
  }, [])

  const questsForRender = useMemo(() => {
    return quests.map((q) => {
      const status: QuestStatus =
        q.variant === 'completed'
          ? 'completed'
          : q.variant === 'ready'
            ? 'ready'
            : 'locked'

      return { ...q, currentCount: toCurrentCount(status) }
    })
  }, [quests])

  //  ready -> completed + point 지급
  const completeQuest = async (questNo: 1 | 2 | 3 | 4, rewardPoint: number) => {
    setClaimingId(questNo)

    try {
      const res = await fetch('/api/users/quests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questNo,
          action: 'complete',
          reward: rewardPoint,
        }),
      })

      if (!res.ok) return

      const data = (await res.json()) as PatchQuestResponse
      if (typeof data.point === 'number') setPoint(data.point)

      setQuests((prev) =>
        prev.map((q) => {
          const server = data.quests.find((x) => x.questNo === q.id)
          if (!server) return q
          return { ...q, variant: toVariant(server.status) }
        })
      )
    } finally {
      setClaimingId(null)
    }
  }

  return (
    <main className="flex gap-80 px-50 pt-20">
      <section className="flex-1 shadow-lg">
        <div className="flex h-full flex-col rounded-md bg-white dark:bg-[#313b51]">
          <div className="flex items-center justify-between rounded-t-md bg-gradient-to-r from-[#6e5aef] to-[#8840ec] px-50 py-40">
            <div className="flex flex-col gap-15 text-white">
              <h2 className="text-3xl font-bold">🔥 오늘의 퀘스트!</h2>
              <span className="text-18 ml-10 font-medium">
                데일리 퀘스트를 달성하고 포인트를 얻어봐요.
              </span>
            </div>
            <div className="flex flex-col items-end gap-12">
              <div className="text-3xl font-bold text-white">
                내 포인트 : {point === null ? '...' : point.toLocaleString()}P
              </div>
              <Button className="rounded-sm px-12 py-4 font-medium hover:opacity-80 hover:transition">
                포인트 지급 내역
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-30 p-40">
            {questsForRender.map((q) => (
              <div key={q.id} className="space-y-10">
                <QuestCard
                  title={q.title}
                  description={q.description}
                  leftIcon={q.leftIcon}
                  currentCount={q.currentCount}
                  targetCount={q.targetCount}
                  rewardPoint={q.rewardPoint}
                  variant={q.variant}
                  isClaiming={claimingId === q.id}
                  onClaim={() => completeQuest(q.id, q.rewardPoint)}
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
export default Quest
