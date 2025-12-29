import { useMyPoint } from '@/features/user/pointHistory/model/useMyPoint'
import { DecorationImage } from '@/features/user/shop/ui/DecorationImage'
import MenuTab from '@/features/user/shop/ui/MenuTab'
import { Button } from '@/shared/ui'
import ProfileAvatar from '@/shared/ui/profile/ProfileAvatar'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import React, { useState, useEffect } from 'react'

type Category = 'accessory' | 'border' | 'title' | 'nickname'
type Position = 'top' | 'bottom-right' | 'bottom-left'

type DecorationItem = {
  id: string
  name: string
  price: number
  category: Category
  style: string | null
  source: string | null
  scale: number | null
}

type PreviewState = {
  accessory?: DecorationItem | null
  border?: DecorationItem | null
  title?: DecorationItem | null
  nickname?: DecorationItem | null
  accessories: Partial<Record<Position, DecorationItem>>
}

// 초기화용 상수(이걸로 reset)
const EMPTY_PREVIEW: PreviewState = {
  border: null,
  title: null,
  nickname: null,
  accessories: {},
}

const Shop = () => {
  const router = useRouter()
  const { data: session } = useSession()
  const [preview, setPreview] = useState<PreviewState>(EMPTY_PREVIEW)
  const { point } = useMyPoint()
  const [displayPoint, setDisplayPoint] = useState<number | null>(null)
  const shownPoint = displayPoint ?? point
  const [profileName, setProfileName] = useState<string>('')

  const handlePurchased = (newPoint: number) => {
    setDisplayPoint(newPoint)
  }

  if (!session?.user) return null

  useEffect(() => {
    if (!session?.user) return
    ;(async () => {
      const res = await fetch('/api/users')
      const data = await res.json()

      if (!res.ok) return
      setProfileName(data.name ?? session.user.name ?? '')
    })()
  }, [session?.user])

  const handlePreviewSelect = (item: DecorationItem) => {
    setPreview((prev) => {
      // accessory 다중 장착
      if (item.category === 'accessory') {
        const slot = item.style as Position | null
        if (!slot) return prev

        const current = prev.accessories[slot]

        // 같은 슬롯에서 같은 아이템 다시 클릭하면 해제(토글)
        if (current?.id === item.id) {
          const next = { ...prev.accessories }
          delete next[slot]
          return { ...prev, accessories: next }
        }

        // 같은 슬롯이면 교체
        return {
          ...prev,
          accessories: {
            ...prev.accessories,
            [slot]: item,
          },
        }
      }

      // 나머지는 1개만 (덮어쓰기)
      if (item.category === 'border') return { ...prev, border: item }
      if (item.category === 'title') return { ...prev, title: item }
      if (item.category === 'nickname') return { ...prev, nickname: item }

      return prev
    })
  }
  const nicknameColor = preview.nickname?.source ?? undefined
  const titleClass = preview.title?.source ?? ''

  const hasPreview =
    !!preview.border ||
    !!preview.title ||
    !!preview.nickname ||
    Object.keys(preview.accessories).length > 0

  const handleReset = () => setPreview(EMPTY_PREVIEW)

  return (
    <main className="flex gap-80 px-50 pt-20">
      <div className="sticky top-20 shrink-0 self-start">
        <div className="relative inline-block w-250">
          <ProfileAvatar
            name={profileName || session.user.name}
            image={session.user.image}
            size={250}
          />
          {/*  border 미리보기 */}
          {preview.border?.source && (
            <div className="pointer-events-none absolute inset-0">
              <DecorationImage
                category="border"
                style={preview.border.style as any}
                source={preview.border.source}
                scale={preview.border.scale ?? 1.2}
              />
            </div>
          )}
          {/* accessory 미리보기 (슬롯별 다중) */}
          {Object.values(preview.accessories).map((acc) => (
            <div key={acc.id} className="pointer-events-none absolute inset-0">
              <DecorationImage
                category="accessory"
                style={acc.style as any}
                source={acc.source}
                baseSize={200}
              />
            </div>
          ))}
        </div>
        {/*  title / nickname 미리보기(아바타 아래에 텍스트로 보여주기 예시) */}
        <div className="mt-20 flex flex-col items-center gap-6">
          <div className={`text-lg font-semibold ${titleClass}`}>
            {preview.title?.name ?? '칭호 미리보기'}
          </div>
          <div
            className="text-sm font-medium"
            style={nicknameColor ? { color: nicknameColor } : undefined}
          >
            {profileName}
          </div>
          {/*  초기화 버튼 */}
          <Button
            variant="accent"
            disabled={!hasPreview}
            onClick={handleReset}
            className="bg-accent mt-10 flex w-full gap-3 rounded-sm px-15 py-10"
          >
            초기화
          </Button>
        </div>
      </div>
      <section className="flex-1 shadow-lg">
        <div className="flex h-full flex-col rounded-md bg-white dark:bg-[#313b51]">
          <div className="flex items-center justify-between rounded-t-md bg-gradient-to-r from-[#6e5aef] to-[#8840ec] px-50 py-40">
            <div className="flex flex-col gap-15 text-white">
              <h2 className="text-3xl font-bold">🛒 상점</h2>
              <span className="text-18 ml-10 font-medium">
                포인트를 통해서 나만의 프로필을 꾸며봐요.
              </span>
            </div>
            <div className="flex flex-col items-end gap-12">
              <div className="text-3xl font-bold text-white">
                내 포인트 :{' '}
                {shownPoint === null ? '...' : shownPoint.toLocaleString()}P
              </div>

              <Button
                onClick={() => router.push('/users?tab=quest&sub=point')}
                className="rounded-sm px-12 py-4 font-medium hover:opacity-80 hover:transition"
              >
                포인트 내역 확인하기
              </Button>
            </div>
          </div>
          <div className="p-40">
            {/* 콜백을 MenuTab에 내려줌 */}
            <MenuTab
              onSelectPreview={handlePreviewSelect}
              onPurchased={handlePurchased}
            />
          </div>
        </div>
      </section>
    </main>
  )
}

export default Shop
