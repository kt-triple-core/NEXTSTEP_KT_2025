'use client'

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

export function useMyDecoratedProfile() {
  const { data: session } = useSession()

  const meQuery = useQuery({
    queryKey: ['me', 'profile'], // 기존 ['userProfile']보다 의미 명확
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
    orders: meQuery.data?.orders,
    applied: meQuery.data?.applied,
    enabled: !meQuery.isFetching && !!meQuery.data,
  })

  // 로딩 중에도 세션값으로 최소 표시(너가 ProfileButton에서 하던 방식)
  const shownName = meQuery.data?.name ?? session?.user?.name ?? null
  const shownAvatar = meQuery.data?.avatar ?? session?.user?.image ?? null

  return {
    ...meQuery,
    name: shownName,
    avatar: shownAvatar,
    decorations,
  }
}
