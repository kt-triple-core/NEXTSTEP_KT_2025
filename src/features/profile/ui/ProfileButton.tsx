'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import MyProfileAvatar from './MyProfileAvatar'

const ProfileButton = () => {
  const router = useRouter()
  const { data: session } = useSession()
  if (!session?.user) return null

  return (
    <button
      onClick={() => router.push('/users')}
      className="flex items-center gap-8 hover:cursor-pointer"
    >
      <MyProfileAvatar size={45} />
    </button>
  )
}

export default ProfileButton
