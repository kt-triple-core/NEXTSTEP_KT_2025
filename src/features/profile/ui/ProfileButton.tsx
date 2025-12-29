'use client'

import { useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import ProfileAvatar from '@/shared/ui/profile/ProfileAvatar'
import {
  type PurchasedItem,
  EMPTY_APPLIED,
} from '@/features/user/shop/model/decorations'
import { useQuery } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import axios from 'axios'
import { useAppliedPurchasedItems } from '@/features/user/shop/model/useAppliedPurchasedItems'

type UserRes = {
  name: string | null
  avatar: string | null
  orders: PurchasedItem[]
}

async function getUserProfileForButton() {
  const res = await axios.get<UserRes>('/api/users', { withCredentials: true })
  return res.data
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

  // 세션 있을 때만 조회
  const { data, isFetching } = useQuery({
    queryKey: ['userProfile'], // Profile.tsx와 동일하게 맞추는 게 베스트
    queryFn: getUserProfileForButton,
    enabled: !!session?.user,
    staleTime: 1000 * 30,
    retry: (failCount, err: AxiosError<any>) => {
      const status = err?.response?.status
      if (status && [401, 403, 404].includes(status)) return false
      return failCount < 2
    },
  })

  if (!session?.user) return null

  // 로딩 중(또는 아직 data 없음)에도 세션 값으로 최소한 보여주기
  const shownName = data?.name ?? session.user.name ?? null
  const shownAvatar = data?.avatar ?? session.user.image ?? null

  const orders = data?.orders ?? []
  const applied = data?.applied ?? EMPTY_APPLIED

  const appliedItems = useAppliedPurchasedItems(orders, applied)

  const decorations = useMemo(() => {
    // 아직 불러오는 중이면 (깜빡임 방지) decorations는 안 넣음
    if (isFetching || !data) return undefined

    return buildAvatarDecorations({
      border: appliedItems.border,
      top: appliedItems.top,
      bottomLeft: appliedItems.bottomLeft,
      bottomRight: appliedItems.bottomRight,
    })
  }, [
    isFetching,
    data,
    appliedItems.border,
    appliedItems.top,
    appliedItems.bottomLeft,
    appliedItems.bottomRight,
  ])

  return (
    <button
      onClick={() => router.push('/users')}
      className="flex items-center gap-8 hover:cursor-pointer"
    >
      <ProfileAvatar
        name={shownName}
        image={shownAvatar}
        size={45}
        decorations={decorations}
      />
    </button>
  )
}

export default ProfileButton
