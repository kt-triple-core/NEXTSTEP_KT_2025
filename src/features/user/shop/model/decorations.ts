export type Category = 'accessory' | 'border' | 'title' | 'nickname'

export type PurchasedItem = {
  orderId: string
  decorationId: string
  name: string
  price: number
  category: Category
  style: string | null
  source: string | null
  scale: number | null
}

export type AppliedState = {
  borderId: string | null
  titleId: string | null
  nicknameColorId: string | null
  topId: string | null
  bottomLeftId: string | null
  bottomRightId: string | null
}

export const EMPTY_APPLIED: AppliedState = {
  borderId: null,
  titleId: null,
  nicknameColorId: null,
  topId: null,
  bottomLeftId: null,
  bottomRightId: null,
}

export type AccessoryPosition = 'top' | 'bottom-left' | 'bottom-right'

export function isAccessoryPosition(v: any): v is AccessoryPosition {
  return v === 'top' || v === 'bottom-left' || v === 'bottom-right'
}

export function isApplied(item: PurchasedItem, applied: AppliedState) {
  if (item.category === 'border') return applied.borderId === item.decorationId
  if (item.category === 'title') return applied.titleId === item.decorationId
  if (item.category === 'nickname')
    return applied.nicknameColorId === item.decorationId

  if (item.category === 'accessory') {
    if (!isAccessoryPosition(item.style)) return false
    if (item.style === 'top') return applied.topId === item.decorationId
    if (item.style === 'bottom-left')
      return applied.bottomLeftId === item.decorationId
    if (item.style === 'bottom-right')
      return applied.bottomRightId === item.decorationId
  }

  return false
}

export function findPurchasedItem(
  orders: PurchasedItem[],
  decorationId: string | null
) {
  if (!decorationId) return null
  return orders.find((o) => o.decorationId === decorationId) ?? null
}
