'use client'

import ProfileAvatar from '@/shared/ui/profile/ProfileAvatar'
import { useSession } from 'next-auth/react'
import { useQuery } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import axios from 'axios'
import { useAvatarDecorations } from '@/features/user/updateMyInfo/model/useAvatarDecorations'
import type {
  PurchasedItem,
  AppliedState,
} from '@/features/user/shop/model/decorations'

type UserRes = {
  name: string | null
  avatar: string | null
  orders: PurchasedItem[]
  applied: AppliedState
}

async function getMe() {
  const res = await axios.get<UserRes>('/api/users', { withCredentials: true })
  return res.data
}

type Props = {
  size?: number
  className?: string
  // fallback(없어도 됨): 세션 없거나 로딩중일 때 표시용
  fallbackName?: string | null
  fallbackImage?: string | null
}

export default function MyProfileAvatar({
  size = 30,
  className,
  fallbackName = null,
  fallbackImage = null,
}: Props) {
  const { data: session } = useSession()

  const { data, isFetching } = useQuery({
    queryKey: ['me', 'profile'],
    queryFn: getMe,
    enabled: !!session?.user,
    staleTime: 1000 * 30,
    retry: (failCount, err: AxiosError<any>) => {
      const status = err?.response?.status
      if (status && [401, 403, 404].includes(status)) return false
      return failCount < 2
    },
  })

  const decorations = useAvatarDecorations({
    orders: data?.orders,
    applied: data?.applied,
    enabled: !isFetching && !!data,
  })

  const shownName = data?.name ?? fallbackName ?? session?.user?.name ?? null
  const shownAvatar =
    data?.avatar ?? fallbackImage ?? session?.user?.image ?? null

  return (
    <ProfileAvatar
      name={shownName}
      image={shownAvatar}
      size={size}
      decorations={decorations}
      className={className}
    />
  )
}
