'use client'

import { useState } from 'react'
import { Button } from '@/shared/ui'
import { DecorationImage } from './DecorationImage'
import { toast } from 'sonner'
import Modal from '@/shared/ui/Modal'

type DecorationItem = {
  id: string
  name: string
  price: number
  category: 'accessory' | 'border' | 'title' | 'nickname'
  style: string | null
  source: string | null
}

interface Props {
  item: DecorationItem
  onClickPreview: () => void
  onPurchased: (newPoint: number) => void
}

const TabContentDetail = ({ item, onClickPreview, onPurchased }: Props) => {
  const [open, setOpen] = useState(false)
  const [purchasing, setPurchasing] = useState(false)
  const isNickname = item.category === 'nickname'
  const isTitle = item.category === 'title'

  // 모달 "확정 구매"용 (이벤트 없음)
  const purchase = async () => {
    try {
      setPurchasing(true)

      const res = await fetch('/api/users/shops/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decorationId: item.id }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.message ?? '구매 실패')
        return
      }

      toast.success(
        `${data.result.itemName} 구매 완료! (-${data.result.spent}P)`
      )
      onPurchased(data.result.newPoint)

      // 성공하면 모달 닫기
      setOpen(false)
    } finally {
      setPurchasing(false)
    }
  }

  return (
    <div
      tabIndex={0}
      onClick={onClickPreview}
      onKeyDown={(e) => e.key === 'Enter' && onClickPreview()}
      className="flex flex-col items-center rounded-sm border border-[#DBCFFF] bg-[#FAF9FD] p-20 hover:cursor-pointer"
    >
      {!isTitle && (
        <div
          className={`relative my-25 h-150 w-150 rounded-full ${
            isNickname ? '' : 'bg-[#DBCFFF]'
          }`}
          style={
            isNickname
              ? { backgroundColor: item.source ?? undefined }
              : undefined
          }
        >
          {!isNickname && (
            <DecorationImage
              category={item.category}
              style={item.style as any}
              source={item.source}
              baseSize={200}
            />
          )}
        </div>
      )}

      <div className="flex flex-col items-center gap-5">
        {isNickname ? (
          <div className="text-lg font-medium text-black">{item.name}</div>
        ) : (
          <div className={`mt-10 text-lg font-medium ${item.source ?? ''}`}>
            {item.name}
          </div>
        )}
        <span className="text-md text-gray-500">{item.price}P</span>
      </div>

      {/* 구매 버튼 클릭 -> 모달 오픈 */}
      <Modal
        open={open}
        onOpenChange={setOpen}
        title="구매하시겠습니까?"
        className="max-w-[420px] p-30"
        trigger={
          <Button
            variant="accent"
            className="mt-15 w-full rounded-sm py-10"
            onClick={(e: any) => {
              e.stopPropagation() // 카드 클릭(미리보기) 막기
            }}
          >
            구매하기
          </Button>
        }
        footer={
          <div className="mt-10 flex w-full gap-10">
            <Button
              className="flex-1 rounded-sm border border-gray-200 py-10"
              onClick={(e: any) => {
                e.stopPropagation()
                setOpen(false)
              }}
              disabled={purchasing}
            >
              취소
            </Button>
            <Button
              variant="accent"
              className="flex-1 rounded-sm"
              onClick={(e: any) => {
                e.stopPropagation()
                purchase()
              }}
              disabled={purchasing}
            >
              {purchasing ? '구매 중...' : '구매하기'}
            </Button>
          </div>
        }
      >
        <div className="text-md my-10 text-gray-600">
          <p>{`"${item.name}"을(를) ${item.price}P로 구매합니다.`}</p>
          <p>
            구매 후 아이템은{' '}
            <span className="font-semibold">프로필 꾸미기</span>
            에서 적용할 수 있어요.
          </p>
        </div>
      </Modal>
    </div>
  )
}

export default TabContentDetail
