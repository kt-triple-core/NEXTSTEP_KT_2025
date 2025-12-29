'use client'

import { useEffect, useState } from 'react'
import { getPointHistory, PointHistoryRow } from '../api/getPointHistory'

// ISO 날짜 문자열을 한국 날짜 형식으로 바꿔서 보여주기 위한 함수
function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('ko-KR')
}

// 포인트 증감 표시를 +10P / -10P 같은 형식으로 만들기
function formatPoint(amount: number) {
  const sing = amount > 0 ? '+' : ''
  return `${sing}${amount.toLocaleString()}P`
}

const PointHistoryTable = () => {
  const [rows, setRows] = useState<PointHistoryRow[]>([])
  const [loading, setLoading] = useState(true)

  // 컴포넌트가 처음 화면에 나타날 때(마운트) 한 번 실행
  useEffect(() => {
    ;(async () => {
      try {
        setLoading(true)
        const data = await getPointHistory()
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
        <p className="text-sm text-gray-500">포인트 내역이 없습니다.</p>
      </div>
    )
  }

  return (
    <>
      <div className="flex items-center justify-between border-b px-20 py-16">
        <h2 className="text-2xl font-semibold">포인트 내역</h2>
        <span className="text-12 text-gray-500 dark:text-white">최신순</span>
      </div>

      <div className="custom-scroll max-h-[500px] overflow-x-auto overflow-y-auto">
        <table className="w-full min-w-[680px] text-left">
          <thead className="text-12 sticky top-0 z-10 bg-gray-50 text-gray-600 dark:bg-[#414962] dark:text-white">
            <tr className="text-center">
              <th className="px-20 py-10 font-medium">번호</th>
              <th className="px-20 py-10 font-medium">내용</th>
              <th className="px-20 py-10 font-medium">증감</th>
              <th className="px-20 py-10 font-medium">보유</th>
              <th className="px-20 py-10 font-medium">날짜</th>
            </tr>
          </thead>

          <tbody className="text-14">
            {rows.map((r) => {
              const isEarn = r.amount > 0
              return (
                <tr key={r.id} className="border-t text-center">
                  <td className="px-20 py-16 text-gray-500 dark:text-white">
                    {r.no}
                  </td>
                  <td className="px-20 py-16 text-left font-medium">
                    {r.content}
                  </td>

                  <td className="px-20 py-16">
                    <span
                      className={
                        isEarn
                          ? 'rounded-full bg-emerald-50 px-10 py-6 text-emerald-700'
                          : 'rounded-full bg-rose-50 px-10 py-6 text-rose-700'
                      }
                    >
                      {formatPoint(r.amount)}
                    </span>
                  </td>

                  <td className="px-20 py-16 text-gray-700 dark:text-white">
                    {r.running_total.toLocaleString()}P
                  </td>

                  <td className="px-20 py-16 text-gray-500 dark:text-white">
                    {formatDate(r.date)}
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

export default PointHistoryTable
