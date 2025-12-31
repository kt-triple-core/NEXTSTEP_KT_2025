'use client'

import Image from 'next/image'

type Category = 'accessory' | 'border' | 'title' | 'nickname'
type Position = 'top' | 'bottom-right' | 'bottom-left'

interface DecorationImageProps {
  category?: Category
  style?: Position | null
  source?: string | null
  scale?: number
  baseSize?: number
}

/**
 * category + style + source 기반 장식 이미지 렌더링
 */
export function DecorationImage({
  category = 'accessory',
  style = 'top',
  source,
  scale = 1,
  baseSize = 100,
}: DecorationImageProps) {
  // 위치 계산
  const getPositionClass = () => {
    //  border는 항상 정중앙
    if (category === 'border') {
      return 'inset-0'
    }

    switch (style) {
      case 'top':
        return 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2'
      case 'bottom-right':
        return 'bottom-0 right-0 translate-x-0/4 translate-y-0/4'
      case 'bottom-left':
        return 'bottom-0 left-0 -translate-x-0/4 translate-y-0/4'
      default:
        return 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2'
    }
  }

  const accessorySize = Math.round(baseSize * 0.28)
  return (
    <div
      className={`absolute ${getPositionClass()}`}
      style={
        category === 'border'
          ? {
              inset: 0,
              transform: `scale(1.25)`,
            }
          : {
              width: accessorySize,
              height: accessorySize,
              transform: `scale(${scale})`,
            }
      }
    >
      <Image
        src={source ?? ''}
        alt={`${category} decoration`}
        fill={category === 'border'}
        width={category === 'border' ? undefined : accessorySize}
        height={category === 'border' ? undefined : accessorySize}
        className="object-contain"
        unoptimized
      />
    </div>
  )
}
