'use client'

import { useEffect, useState } from 'react'
import { getOrderHistory, OrderHistoryRow } from '../api/getOrderHistory'

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('ko-KR')
}

// 가격 표시: 1,000P 형태 (구매는 보통 -라서 UI에서 "차감"으로 표현)
function formatPrice(price: number | null) {
  if (price == null) return '-'
  return `${price.toLocaleString()}P`
}

const OrderHistoryTable = () => {
  const [rows, setRows] = useState<OrderHistoryRow[]>([])
  const [loading, setLoading] = useState(true)

  const CATEGORY_LABEL_MAP: Record<string, string> = {
    accessory: '악세사리',
    border: '테두리',
    title: '칭호',
    nickname: '닉네임',
    name_color: '이름 색상',
  }

  useEffect(() => {
    ;(async () => {
      try {
        setLoading(true)
        const data = await getOrderHistory()
        setRows(data)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  if (loading) {
    return (
      <div className="rounded-xl bg-white p-20 shadow-sm">
        <p className="text-sm text-gray-500">불러오는 중...</p>
      </div>
    )
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-xl bg-white p-20 shadow-sm">
        <p className="text-sm text-gray-500">구매 내역이 없습니다.</p>
      </div>
    )
  }

  return (
    <>
      <div className="flex items-center justify-between border-b px-20 py-16">
        <h2 className="text-2xl font-semibold">구매 내역</h2>
        <span className="text-12 text-gray-500 dark:text-white">최신순</span>
      </div>

      <div className="custom-scroll max-h-[500px] overflow-x-auto overflow-y-auto">
        <table className="w-full min-w-[780px] text-left">
          <thead className="text-12 sticky top-0 z-10 bg-gray-50 text-gray-600 dark:bg-[#414962] dark:text-white">
            <tr className="text-center">
              <th className="px-20 py-10 font-medium">번호</th>
              <th className="px-20 py-10 font-medium">카테고리</th>
              <th className="px-20 py-10 font-medium">아이템</th>
              <th className="px-20 py-10 font-medium">가격</th>
              <th className="px-20 py-10 font-medium">구매일</th>
            </tr>
          </thead>

          <tbody className="text-14">
            {rows.map((r) => {
              // 구매는 지출이니까 "차감" 느낌으로(원하면 색상/텍스트 바꿔도 됨)
              return (
                <tr key={r.orderId} className="border-t text-center">
                  <td className="px-20 py-16 text-gray-500 dark:text-white">
                    {r.no}
                  </td>
                  <td className="px-20 py-16">
                    <span className="text-slate-700 dark:bg-white/10 dark:text-white">
                      {CATEGORY_LABEL_MAP[r.category ?? ''] ??
                        r.category ??
                        '-'}
                    </span>
                  </td>
                  <td className="px-20 py-16 text-left font-medium">
                    {r.name ?? '알 수 없음'}
                  </td>

                  <td className="px-20 py-16">
                    <span className="rounded-full bg-rose-50 px-10 py-6 text-rose-700">
                      -{formatPrice(r.price)}
                    </span>
                  </td>

                  <td className="px-20 py-16 text-gray-500 dark:text-white">
                    {formatDate(r.purchasedAt)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default OrderHistoryTable
