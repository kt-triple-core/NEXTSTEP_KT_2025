'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import ProfileAvatar from '@/shared/ui/profile/ProfileAvatar'
import {
  type AppliedState,
  type PurchasedItem,
  EMPTY_APPLIED,
  findPurchasedItem,
} from '@/features/user/shop/model/decorations'

type UserRes = {
  name: string | null
  avatar: string | null
  orders: PurchasedItem[]
  applied: AppliedState
}
function buildAvatarDecorations(args: {
  border: PurchasedItem | null
  top: PurchasedItem | null
  bottomLeft: PurchasedItem | null
  bottomRight: PurchasedItem | null
}) {
  return {
    border: args.border?.source
      ? {
          source: args.border.source,
          style: args.border.style,
          scale: args.border.scale ?? 1.2,
        }
      : null,

    accessories: {
      top: args.top?.source
        ? {
            source: args.top.source,
            style: args.top.style ?? 'top',
            scale: args.top.scale ?? 1,
          }
        : undefined,

      'bottom-left': args.bottomLeft?.source
        ? {
            source: args.bottomLeft.source,
            style: args.bottomLeft.style ?? 'bottom-left',
            scale: args.bottomLeft.scale ?? 1,
          }
        : undefined,

      'bottom-right': args.bottomRight?.source
        ? {
            source: args.bottomRight.source,
            style: args.bottomRight.style ?? 'bottom-right',
            scale: args.bottomRight.scale ?? 1,
          }
        : undefined,
    },
  }
}
const ProfileButton = () => {
  const router = useRouter()
  const { data: session } = useSession()

  const [dbName, setDbName] = useState<string | null>(null)
  const [dbAvatar, setDbAvatar] = useState<string | null>(null)
  const [orders, setOrders] = useState<PurchasedItem[]>([])
  const [applied, setApplied] = useState<AppliedState>(EMPTY_APPLIED)
  const [loading, setLoading] = useState(true)

  const fetchMe = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/users', { cache: 'no-store' })
      const data = (await res.json()) as UserRes

      if (!res.ok) return

      setDbName(data.name ?? null)
      setDbAvatar(data.avatar ?? null)
      setOrders(data.orders ?? [])
      setApplied(data.applied ?? EMPTY_APPLIED)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!session?.user) return
    fetchMe()
  }, [session?.user, fetchMe])

  if (!session?.user) return null
  // 로딩 중엔 세션값으로라도 보여주기
  const shownName = dbName ?? session.user.name ?? null
  const shownAvatar = dbAvatar ?? session.user.image ?? null

  const appliedBorder = findPurchasedItem(orders, applied.borderId)
  const appliedTop = findPurchasedItem(orders, applied.topId)
  const appliedBottomLeft = findPurchasedItem(orders, applied.bottomLeftId)
  const appliedBottomRight = findPurchasedItem(orders, applied.bottomRightId)

  return (
    <button
      onClick={() => router.push('/users')}
      className="flex items-center gap-8 hover:cursor-pointer"
    >
      <ProfileAvatar
        name={shownName}
        image={shownAvatar}
        size={45}
        decorations={
          loading
            ? undefined
            : buildAvatarDecorations({
                border: appliedBorder,
                top: appliedTop,
                bottomLeft: appliedBottomLeft,
                bottomRight: appliedBottomRight,
              })
        }
      />
    </button>
  )
}

export default ProfileButton
