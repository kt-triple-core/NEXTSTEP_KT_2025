'use client'
import { Button } from '@/shared/ui'
import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
  type PurchasedItem,
  type AppliedState,
  EMPTY_APPLIED,
  type AccessoryPosition,
  isAccessoryPosition,
  isApplied,
} from '@/features/user/shop/model/decorations'
import axios, { AxiosError } from 'axios'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { DecorationImage } from '../../shop/ui/DecorationImage'

type Props = {
  onApplied?: () => void
}

const PROFILETAB_LIST = [
  { key: 'accessory', label: '악세사리' },
  { key: 'borderline', label: '테두리' },
  { key: 'title', label: '칭호' },
  { key: 'nickname', label: '닉네임' },
] as const

type TabKey = (typeof PROFILETAB_LIST)[number]['key']

const tabToCategoryMap: Record<TabKey, PurchasedItem['category']> = {
  accessory: 'accessory',
  borderline: 'border',
  title: 'title',
  nickname: 'nickname',
}

type UserProfileResponse = {
  orders: PurchasedItem[]
  applied: AppliedState
  message?: string
}

async function getUserProfile() {
  const res = await axios.get<UserProfileResponse>('/api/users', {
    withCredentials: true,
  })
  return res.data
}

type ApplyPayload = {
  action: 'applyDecoration' | 'clearDecoration'
  decorationId: string
  category: PurchasedItem['category']
  style?: AccessoryPosition | null
}

async function patchDecoration(payload: ApplyPayload) {
  const res = await axios.patch('/api/users', payload, {
    withCredentials: true,
  })
  return res.data
}

const MyProfile = ({ onApplied }: Props) => {
  const queryClient = useQueryClient()

  const [activeTab, setActiveTab] = useState<TabKey>('accessory')
  // GET /api/users 캐시 공유 (Profile/ProfileButton/Shop과 같은 key 쓰면 더 좋음)
  const { data, isFetching } = useQuery({
    queryKey: ['userProfile'],
    queryFn: getUserProfile,
    staleTime: 1000 * 30,
    retry: (failCount, err: AxiosError<any>) => {
      const status = err?.response?.status
      if (status && [401, 403, 404].includes(status)) return false
      return failCount < 2
    },
  })

  const items = data?.orders ?? []
  const applied = data?.applied ?? EMPTY_APPLIED

  const filteredItems = useMemo(() => {
    const category = tabToCategoryMap[activeTab]
    return items.filter((item) => item.category === category)
  }, [items, activeTab])

  const toggleApplyMutation = useMutation({
    mutationFn: (payload: ApplyPayload) => patchDecoration(payload),
    onSuccess: async (_data, vars) => {
      toast.success(
        vars.action === 'clearDecoration' ? '해제 완료!' : '적용 완료!'
      )

      // 서버 상태 갱신: 내 리스트 + Profile 아바타까지 동시에 업데이트
      await queryClient.invalidateQueries({ queryKey: ['userProfile'] })

      // 부모가 추가로 무언가 하고 싶다면(예: Profile.tsx에서 invalidate) 유지
      onApplied?.()
    },
    onError: (err: AxiosError<any>, vars) => {
      const msg =
        err.response?.data?.message ??
        (vars.action === 'clearDecoration' ? '해제 실패' : '적용 실패')
      toast.error(msg)
    },
  })

  const handleToggleApply = (item: PurchasedItem) => {
    const appliedNow = isApplied(item, applied)

    const style: AccessoryPosition | null =
      item.category === 'accessory' && isAccessoryPosition(item.style)
        ? (item.style as AccessoryPosition)
        : null

    toggleApplyMutation.mutate({
      action: appliedNow ? 'clearDecoration' : 'applyDecoration',
      decorationId: item.decorationId,
      category: item.category,
      style, // accessory만 의미 있음
    })
  }

  return (
    <>
      <div className="mb-6 flex gap-50 border-b border-gray-300 text-sm">
        {PROFILETAB_LIST.map((tab) => (
          <button
            key={tab.key}
            className={`px-20 py-10 ${
              activeTab === tab.key
                ? 'border-accent text-accent border-b-2'
                : 'text-gray-500'
            }`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isFetching ? (
        <div className="text-sm text-gray-400">불러오는 중...</div>
      ) : filteredItems.length === 0 ? (
        <div className="text-sm text-gray-400">구매한 아이템이 없습니다.</div>
      ) : (
        <div className="mt-30 grid grid-cols-4 gap-20">
          {filteredItems.map((item) => {
            const appliedNow = isApplied(item, applied)
            const pending = toggleApplyMutation.isPending

            return (
              <div
                key={item.orderId}
                className="flex flex-col items-center gap-10 rounded-sm border border-[#DBCFFF] bg-[#FAF9FD] p-20"
              >
                {/* 미리보기 */}
                {item.category !== 'title' && item.category !== 'nickname' && (
                  <div className="relative h-80 w-80 rounded-full bg-[#DBCFFF]">
                    {/* border */}
                    {item.category === 'border' && item.source && (
                      <DecorationImage
                        category="border"
                        style={item.style as any}
                        source={item.source}
                        scale={item.scale ?? 1.2}
                      />
                    )}

                    {/* accessory (top / bottom-left / bottom-right) */}
                    {item.category === 'accessory' &&
                      item.source &&
                      isAccessoryPosition(item.style) && (
                        <DecorationImage
                          category="accessory"
                          style={item.style}
                          source={item.source}
                          baseSize={80}
                        />
                      )}
                  </div>
                )}

                {/* 텍스트 */}
                <div
                  className={`text-md mb-3 font-medium ${
                    item.category === 'title'
                      ? (item.source ?? '')
                      : 'text-black'
                  }`}
                  style={
                    item.category === 'nickname'
                      ? { color: item.source ?? undefined }
                      : undefined
                  }
                >
                  {item.name}
                </div>

                {/* 버튼 */}
                <div className="flex w-full flex-col items-center gap-6 text-sm">
                  <Button
                    className={`w-full rounded-sm py-8 ${
                      appliedNow
                        ? 'border border-[#6e5aef] bg-white !text-[#6e5aef]'
                        : '!bg-accent !text-[#ffffff]'
                    }`}
                    onClick={() => handleToggleApply(item)}
                    disabled={pending}
                  >
                    {appliedNow ? '해제하기' : '적용하기'}
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}

export default MyProfile
