'use client'

import Image from 'next/image'

interface Props {
  name?: string | null
  image?: string | null
  size?: number // 반지름 크기 설정
}

const ProfileAvatar = ({
  name = '사용자',
  image = null,
  size = 100,
}: Props) => {
  const initial = name.charAt(0)

  return (
    <div>
      {image ? (
        <Image
          src={image}
          alt={`${name} 프로필 이미지`}
          width={size}
          height={size}
          unoptimized
          className="rounded-full border border-gray-300 object-cover"
          style={{ width: size, height: size }}
        />
      ) : (
        <div
          className="flex items-center justify-center rounded-full bg-[#FF6B2C] text-white"
          style={{
            width: size,
            height: size,
            fontSize: size * 0.35,
          }}
        >
          {initial}
        </div>
      )}
    </div>
  )
}

export default ProfileAvatar
