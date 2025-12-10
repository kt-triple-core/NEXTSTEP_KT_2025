'use client'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

const ProfileButton = () => {
  const router = useRouter()
  const { data: session } = useSession()

  if (!session?.user) return null

  const name = session.user.name ?? '사용자'
  const image = session.user.image
  const initial = name.charAt(0)

  return (
    <button
      type="button"
      onClick={() => router.push('/users')}
      className="flex cursor-pointer items-center gap-8"
    >
      {image ? (
        // 프로필 이미지가 있을 때 (깃허브/구글)
        <Image
          src={image}
          alt={`${name} 프로필 이미지`}
          width={50}
          height={50}
          className="h-45 w-45 rounded-full border border-gray-300 object-cover"
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
