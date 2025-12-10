'use client'
import Image from 'next/image'
import { useSession } from 'next-auth/react'

const ProfileButton = () => {
  const { data: session } = useSession()

  if (!session?.user) return null

  const name = session.user.name ?? '사용자'
  const image = session.user.image
  const initial = name.charAt(0)

  return (
    <button type="button" className="flex items-center gap-8">
      {image ? (
        // 프로필 이미지가 있을 때 (깃허브/구글)
        <Image
          src={image}
          alt={`${name} 프로필 이미지`}
          width={32}
          height={32}
          className="h-32 w-32 rounded-full object-cover"
        />
      ) : (
        // 이미지 없으면 동그란 이니셜
        <div className="flex h-32 w-32 items-center justify-center rounded-full bg-[#FF6B2C] text-sm text-white">
          {initial}
        </div>
      )}
    </button>
  )
}

export default ProfileButton
