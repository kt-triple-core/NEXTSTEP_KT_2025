'use client'

import Image from 'next/image'
import { DecorationImage } from '@/features/user/shop/ui/DecorationImage'

type AccessoryPosition = 'top' | 'bottom-left' | 'bottom-right'

type AvatarDecoration = {
  border?: {
    source: string | null
    style: string | null
    scale?: number | null
  } | null

  accessories?: Partial<
    Record<
      AccessoryPosition,
      {
        source: string | null
        style: string | null
        scale?: number | null
      }
    >
  >
}

interface Props {
  name?: string | null
  image?: string | null
  size?: number
  decorations?: AvatarDecoration // 추가
  className?: string // 필요하면 wrapper 클래스도 받게
}

const ProfileAvatar = ({
  name,
  image,
  size = 100,
  decorations,
  className,
}: Props) => {
  const safeName = name?.trim()
  const initial = safeName ? safeName.charAt(0).toUpperCase() : '?'

  const border = decorations?.border
  const accessories = decorations?.accessories ?? {}

  return (
    <div className={className}>
      <div
        className="relative inline-block"
        style={{ width: size, height: size }}
      >
        {image ? (
          <Image
            src={image}
            alt={`${name ?? '사용자'} 프로필 이미지`}
            width={size}
            height={size}
            unoptimized
            className="h-full w-full rounded-full border border-gray-300 object-cover"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center rounded-full bg-[#FF6B2C] text-white"
            style={{ fontSize: size * 0.35 }}
          >
            {initial}
          </div>
        )}

        {/* border overlay */}
        {!!border?.source && (
          <div className="pointer-events-none absolute inset-0">
            <DecorationImage
              category="border"
              style={border.style as any}
              source={border.source}
              scale={border.scale ?? 0.5}
            />
          </div>
        )}

        {/* accessory overlays */}
        {(['top', 'bottom-left', 'bottom-right'] as const).map((pos) => {
          const acc = accessories[pos]
          if (!acc?.source) return null

          return (
            <div key={pos} className="pointer-events-none absolute inset-0">
              <DecorationImage
                category="accessory"
                style={(acc.style ?? pos) as any} // style 없으면 pos 사용
                source={acc.source}
                scale={acc.scale ?? 0.5}
                baseSize={50}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ProfileAvatar
