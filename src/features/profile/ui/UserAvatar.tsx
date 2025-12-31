'use client'

import ProfileAvatar from '@/shared/ui/profile/ProfileAvatar'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

type UserAvatarRes = {
  userId: string
  name: string | null
  avatar: string | null
  decorations?: any | null
}

async function getUserAvatar(userId: string) {
  const res = await axios.get<UserAvatarRes>(`/api/users/${userId}/avatar`)
  return res.data
}

export default function UserAvatar({
  userId,
  size = 30,
  className,
  fallbackName,
  fallbackImage,
  decorations,
}: {
  userId: string | null
  size?: number
  className?: string
  fallbackName?: string | null
  fallbackImage?: string | null
  decorations?: any | null
}) {
  const { data, error } = useQuery({
    queryKey: ['userAvatar', userId],
    queryFn: () => getUserAvatar(userId as string),
    enabled: !!userId && !decorations, // Don't fetch if userId is null or decorations are provided
    staleTime: 1000 * 60,
  })

  if (error) console.warn('[UserAvatar] fetch error:', error)

  return (
    <ProfileAvatar
      name={data?.name ?? fallbackName ?? null}
      image={data?.avatar ?? fallbackImage ?? null}
      size={size}
      decorations={decorations ?? data?.decorations ?? undefined}
      className={className}
    />
  )
}
