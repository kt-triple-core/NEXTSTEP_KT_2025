'use client'

import Image from 'next/image'

type Category = 'accessory' | 'border' | 'title' | 'nickname'
type Position = 'top' | 'bottom-right' | 'bottom-left'

interface DecorationImageProps {
  category?: Category
  style?: Position | null
  source?: string | null
  scale?: number
}

/**
 * category + style + source 기반 장식 이미지 렌더링
 */
export function DecorationImage({
  category = 'accessory',
  style = 'top',
  source,
  scale = 1,
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
  const sizeClass =
    category === 'border'
      ? 'absolute inset-0 w-full h-full scale-[1.12]'
      : 'absolute h-50 w-50'
  return (
    <div
      className={`${sizeClass} ${getPositionClass()}`}
      style={
        category === 'border' ? { transform: `scale(${scale})` } : undefined
      }
    >
      <Image
        src={source ?? ''}
        alt={`${category} decoration`}
        fill={category === 'border'}
        width={category === 'border' ? undefined : 200}
        height={category === 'border' ? undefined : 200}
        className="object-contain"
        unoptimized
      />
    </div>
  )
}
