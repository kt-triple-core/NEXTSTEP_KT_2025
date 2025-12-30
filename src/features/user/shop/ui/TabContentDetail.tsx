'use client'

import { useState } from 'react'
import { Button } from '@/shared/ui'
import { DecorationImage } from './DecorationImage'
import { toast } from 'sonner'
import Modal from '@/shared/ui/Modal'
import axios, { AxiosError } from 'axios'
import { useMutation, useQueryClient } from '@tanstack/react-query'

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

type PurchaseResponse = {
  result: {
    itemName: string
    spent: number
    newPoint: number
  }
  message?: string
}

async function purchaseDecoration(decorationId: string) {
  const res = await axios.post<PurchaseResponse>(
    '/api/users/shops/purchase',
    { decorationId },
    { withCredentials: true }
  )
  return res.data
}

const TabContentDetail = ({ item, onClickPreview, onPurchased }: Props) => {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const isNickname = item.category === 'nickname'
  const isTitle = item.category === 'title'

  const purchaseMutation = useMutation({
    mutationFn: () => purchaseDecoration(item.id),
    onSuccess: async (data) => {
      toast.success(
        `${data.result.itemName} 구매 완료! (-${data.result.spent}P)`
      )
      onPurchased(data.result.newPoint)

      // 필요하면 캐시 갱신(프로필/포인트/구매목록 등)
      // 이미 화면에서 point만 즉시 갱신하려고 onPurchased를 쓰고 있으니 선택사항이지만,
      // 다른 화면(프로필 버튼/프로필 페이지)에서도 구매내역이 바로 반영되게 하려면 invalidate 추천
      await queryClient.invalidateQueries({ queryKey: ['userProfile'] })
      await queryClient
        .invalidateQueries({ queryKey: ['myPoint'] })
        .catch(() => {})

      setOpen(false)
    },
    onError: (err: AxiosError<any>) => {
      const msg =
        err.response?.data?.message ??
        (err.response?.status === 401 ? '로그인이 필요해요.' : null) ??
        '구매 실패'
      toast.error(msg)
    },
  })

  const purchasing = purchaseMutation.isPending

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
          // 닉네임: 항상 기본 검정 텍스트
          <div className="text-lg font-medium text-black">{item.name}</div>
        ) : isTitle ? (
          // 타이틀: 색상/스타일은 source(class)만 사용
          <div className={`mt-10 text-lg font-medium ${item.source ?? ''}`}>
            {item.name}
          </div>
        ) : (
          // 그 외(악세사리/테두리 등)
          <div className="mt-10 text-lg font-medium dark:text-black">
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
              e.stopPropagation()
              setOpen(true) // trigger 클릭 시 모달 열기
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
                purchaseMutation.mutate()
                setOpen(false)
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
