import { useMemo } from 'react'
import type { AppliedState, PurchasedItem } from './decorations'
import { findPurchasedItem } from './decorations'

export function useAppliedPurchasedItems(
  orders: PurchasedItem[],
  applied: AppliedState
) {
  return useMemo(() => {
    return {
      border: findPurchasedItem(orders, applied.borderId),
      top: findPurchasedItem(orders, applied.topId),
      bottomLeft: findPurchasedItem(orders, applied.bottomLeftId),
      bottomRight: findPurchasedItem(orders, applied.bottomRightId),
      title: findPurchasedItem(orders, applied.titleId),
      nickname: findPurchasedItem(orders, applied.nicknameColorId),
    }
  }, [
    orders,
    applied.borderId,
    applied.topId,
    applied.bottomLeftId,
    applied.bottomRightId,
    applied.titleId,
    applied.nicknameColorId,
  ])
}
