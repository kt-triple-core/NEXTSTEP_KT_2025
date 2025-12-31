'use client'

import ProfileAvatar from '@/shared/ui/profile/ProfileAvatar'
import { useSession } from 'next-auth/react'
import MyInfo from '@/features/user/updateMyInfo/ui/MyInfo'
import MyProfile from '@/features/user/updateMyInfo/ui/MyProfile'
import { DecorationImage } from '@/features/user/shop/ui/DecorationImage'
import {
  type PurchasedItem,
  type AppliedState,
  EMPTY_APPLIED,
} from '@/features/user/shop/model/decorations'
import { toast } from 'sonner'
import { useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import axios from 'axios'
import { useAppliedPurchasedItems } from '@/features/user/shop/model/useAppliedPurchasedItems'
import { Button } from '@/shared/ui'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

type UserProfileResponse = {
  userId: string
  email: string
  name: string
  avatar: string | null
  point: number
  experiences: Array<{ experienceId: string; field: string; year: number }>
  orders: PurchasedItem[]
  applied: AppliedState
}

type PatchAvatarResponse = {
  message: string
  avatar?: string | null
  name?: string
  // experiences 등은 있을 수 있지만, 여기서는 avatar만 사용
}

async function getUserProfile() {
  const res = await axios.get<UserProfileResponse>('/api/users')
  return res.data
}

async function patchAvatar(file: File) {
  const fd = new FormData()
  fd.append('avatar', file)

  const res = await axios.patch<PatchAvatarResponse>('/api/users', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}

const Profile = () => {
  const { data: session } = useSession()
  const user = session?.user

  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  // 서버 프로필 조회 (GET /api/users)
  const { data: profile, isFetching } = useQuery({
    queryKey: ['userProfile'],
    queryFn: getUserProfile,
    enabled: !!user,
    staleTime: 1000 * 30,
    retry: (failCount, err: AxiosError<any>) => {
      // 401/403/404는 재시도 의미 없음
      const status = err?.response?.status
      if (status && [401, 403, 404].includes(status)) return false
      return failCount < 2
    },
  })

  const orders = profile?.orders ?? []
  const applied = profile?.applied ?? EMPTY_APPLIED
  const profileName = profile?.name ?? user?.name ?? ''

  const appliedItems = useAppliedPurchasedItems(orders, applied)

  const appliedBorder = appliedItems.border
  const appliedTop = appliedItems.top
  const appliedBottomLeft = appliedItems.bottomLeft
  const appliedBottomRight = appliedItems.bottomRight
  const appliedTitle = appliedItems.title
  const appliedNickname = appliedItems.nickname

  // 아바타 업로드 (PATCH /api/users multipart)
  const uploadAvatarMutation = useMutation({
    mutationFn: patchAvatar,
    onSuccess: async (data) => {
      // 서버에서 avatar 내려주면 즉시 반영 (API가 캐시버스터 ?v= 를 붙여줌)
      if (data?.avatar) setPreviewImage(data.avatar)

      // 서버 상태 갱신: GET 데이터(avatar, name, orders, applied 등) 최신화
      await queryClient.invalidateQueries({ queryKey: ['userProfile'] })
    },
    onError: (err: AxiosError<any>) => {
      const status = err?.response?.status
      if (status === 413)
        toast.error('이미지 용량은 최대 5MB까지 업로드할 수 있어요.')
      else if (status === 401) toast.error('로그인이 필요해요.')
      else toast.error('프로필 이미지 업로드에 실패했어요.')
    },
  })

  const handleEditClick = () => fileInputRef.current?.click()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > MAX_FILE_SIZE) {
      toast.error('이미지 용량은 최대 5MB까지 업로드할 수 있어요')
      e.target.value = ''
      return
    }

    // mime 체크 (API에서도 막지만 프론트에서도 UX로 1차 차단)
    if (!file.type.startsWith('image/')) {
      toast.error('이미지 파일만 업로드할 수 있어요')
      e.target.value = ''
      return
    }

    // 즉시 미리보기
    const previewUrl = URL.createObjectURL(file)
    setPreviewImage(previewUrl)

    uploadAvatarMutation.mutate(file)
    e.target.value = ''
  }

  // 훅 호출 이후 early return (Hook order 안전)
  if (!user) return null

  return (
    <main className="flex gap-80 px-50 pt-20">
      <div className="sticky top-40 shrink-0 self-start">
        <div className="relative inline-block w-250">
          <ProfileAvatar
            name={profileName}
            image={previewImage ?? profile?.avatar ?? user.image}
            size={250}
          />

          {/* border */}
          {appliedBorder?.source && (
            <div className="pointer-events-none absolute inset-0">
              <DecorationImage
                category="border"
                style={appliedBorder.style as any}
                source={appliedBorder.source}
                scale={appliedBorder.scale ?? 1.2}
              />
            </div>
          )}

          {/* accessory top */}
          {appliedTop?.source && (
            <div className="pointer-events-none absolute inset-0">
              <DecorationImage
                category="accessory"
                style={appliedTop.style as any}
                source={appliedTop.source}
                baseSize={200}
              />
            </div>
          )}

          {/* accessory bottom-left */}
          {appliedBottomLeft?.source && (
            <div className="pointer-events-none absolute inset-0">
              <DecorationImage
                category="accessory"
                style={appliedBottomLeft.style as any}
                source={appliedBottomLeft.source}
                baseSize={200}
              />
            </div>
          )}

          {/* accessory bottom-right */}
          {appliedBottomRight?.source && (
            <div className="pointer-events-none absolute inset-0">
              <DecorationImage
                category="accessory"
                style={appliedBottomRight.style as any}
                source={appliedBottomRight.source}
                baseSize={200}
              />
            </div>
          )}

          <button
            onClick={handleEditClick}
            disabled={uploadAvatarMutation.isPending}
            className="absolute top-20 right-0 flex items-center justify-center rounded-full bg-white p-12 shadow-md hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
            title={
              uploadAvatarMutation.isPending
                ? '업로드 중...'
                : '프로필 이미지 수정'
            }
          >
            ✏️
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {/* title / nickname */}
        <div className="mt-30 flex flex-col items-center gap-6">
          <div
            className={`text-lg font-semibold ${appliedTitle?.source ?? ''}`}
          >
            {appliedTitle?.name ?? '칭호 없음'}
          </div>

          <div
            className="text-sm font-medium"
            style={
              appliedNickname?.source
                ? { color: appliedNickname.source }
                : undefined
            }
          >
            {profileName}
          </div>

          {/* (선택) 로딩 표시 */}
          {isFetching && (
            <div className="text-xs text-gray-400">불러오는 중...</div>
          )}
        </div>
      </div>

      <section className="flex-1 shadow-lg">
        <div className="flex h-full flex-col rounded-md bg-white dark:bg-[#313b51]">
          <div className="h-30 rounded-t-md bg-gradient-to-r from-[#6e5aef] to-[#8840ec]" />

          <div className="p-60 px-80">
            <section className="flex flex-col justify-between gap-50">
              <h2 className="text-xl font-semibold">내 정보 수정</h2>
              <MyInfo />
            </section>

            <section className="mt-100 flex justify-between gap-50">
              <h3 className="mb-4 text-lg font-semibold">프로필 꾸미기</h3>
              <div className="flex-1">
                {/* 적용 성공 후 서버 프로필 다시 불러오기 */}
                <MyProfile
                  onApplied={async () => {
                    // MyProfile 내부에서 PATCH applyDecoration/clearDecoration 호출 후
                    // 여기서 한 방에 갱신하면 applied/orders 반영됨
                    await queryClient.invalidateQueries({
                      queryKey: ['userProfile'],
                    })
                    // invalidate가 느리게 느껴지면 refetch()도 가능
                    // await refetch()
                  }}
                />
              </div>
            </section>
            <div className="mt-80 flex justify-end">
              <Button className="text-16 font-light !text-[#ff0202] hover:underline">
                회원탈퇴
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default Profile
