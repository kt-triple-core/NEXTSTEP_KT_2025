'use client'

import Image from 'next/image'

type Category = 'accessory' | 'border' | 'title' | 'nickname'
type Position = 'top' | 'bottom-right' | 'bottom-left'

interface DecorationImageProps {
  category?: Category
  style?: Position | null
  source?: string | null
}

/**
 * category + style + source 기반 장식 이미지 렌더링
 */
export function DecorationImage({
  category = 'accessory',
  style = 'top',
  source,
}: DecorationImageProps) {
  // 위치 계산
  const getPositionClass = () => {
    //  border는 항상 정중앙
    if (category === 'border') {
      return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[125%] h-[125%]'
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

  return (
    <div
      className={`absolute h-50 w-50 transition-all duration-300 ${getPositionClass()}`}
    >
      <Image
        src={source ?? ''}
        alt={`${category} decoration`}
        width={200}
        height={200}
        className="object-contain"
        unoptimized
      />
    </div>
  )
}
