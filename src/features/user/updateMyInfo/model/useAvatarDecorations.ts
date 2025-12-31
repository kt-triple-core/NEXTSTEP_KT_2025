'use client'

import { useMemo } from 'react'
import {
  type PurchasedItem,
  type AppliedState,
  EMPTY_APPLIED,
} from '@/features/user/shop/model/decorations'
import { useAppliedPurchasedItems } from '@/features/user/shop/model/useAppliedPurchasedItems'

type BuildArgs = {
  orders?: PurchasedItem[]
  applied?: AppliedState
  enabled?: boolean // 로딩 중 깜빡임 방지용
}

export function useAvatarDecorations({
  orders = [],
  applied = EMPTY_APPLIED,
  enabled = true,
}: BuildArgs) {
  const appliedItems = useAppliedPurchasedItems(orders, applied)

  const decorations = useMemo(() => {
    if (!enabled) return undefined

    return {
      border: appliedItems.border?.source
        ? {
            source: appliedItems.border.source,
            style: appliedItems.border.style,
            scale: appliedItems.border.scale ?? 1,
          }
        : null,

      accessories: {
        top: appliedItems.top?.source
          ? {
              source: appliedItems.top.source,
              style: appliedItems.top.style ?? 'top',
              scale: appliedItems.top.scale ?? 0.7,
            }
          : undefined,

        'bottom-left': appliedItems.bottomLeft?.source
          ? {
              source: appliedItems.bottomLeft.source,
              style: appliedItems.bottomLeft.style ?? 'bottom-left',
              scale: appliedItems.bottomLeft.scale ?? 0.7,
            }
          : undefined,

        'bottom-right': appliedItems.bottomRight?.source
          ? {
              source: appliedItems.bottomRight.source,
              style: appliedItems.bottomRight.style ?? 'bottom-right',
              scale: appliedItems.bottomRight.scale ?? 0.7,
            }
          : undefined,
      },
    }
  }, [
    enabled,
    appliedItems.border,
    appliedItems.top,
    appliedItems.bottomLeft,
    appliedItems.bottomRight,
  ])

  return decorations
}
