'use client'
import OrderHistoryTable from '@/features/user/shop/orderHistory/ui/OrderHistoryTable'
import { Button } from '@/shared/ui'
import { useRouter } from 'next/navigation'

const Order = () => {
  const router = useRouter()
  return (
    <main className="flex gap-80 px-50 pt-20">
      <section className="flex-1 shadow-lg">
        <div className="flex h-full flex-col rounded-md bg-white dark:bg-[#313b51]">
          <div className="h-30 rounded-t-md bg-gradient-to-r from-[#6e5aef] to-[#8840ec]" />
          {/* 안쪽 컨텐츠 */}

          <div className="p-40">
            <Button
              onClick={() => router.push('/users?tab=shop')}
              className="mb-10 rounded-sm px-12 py-4 font-medium hover:opacity-80 hover:transition"
            >
              ← 상점으로 돌아가기
            </Button>
            <OrderHistoryTable />
          </div>
        </div>
      </section>
    </main>
  )
}

export default Order
