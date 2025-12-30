export type OrderHistoryRow = {
  no: number
  orderId: string
  decorationId: string | null
  name: string | null
  category: string | null
  price: number | null
  style: string | null
  source: string | null
  text: string | null
  purchasedAt: string
}

export async function getOrderHistory(): Promise<OrderHistoryRow[]> {
  const res = await fetch('/api/users/orders', { cache: 'no-store' })
  if (!res.ok) throw new Error('FAILED_TO_FETCH_ORDER_HISTORY')
  const json = await res.json()
  return (json?.rows ?? []) as OrderHistoryRow[]
}
