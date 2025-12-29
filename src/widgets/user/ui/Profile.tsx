'use client'

import ProfileAvatar from '@/shared/ui/profile/ProfileAvatar'
import { useSession } from 'next-auth/react'
import MyInfo from '@/features/user/updateMyInfo/ui/MyInfo'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import MyProfile from '@/features/user/updateMyInfo/ui/MyProfile'
import { DecorationImage } from '@/features/user/shop/ui/DecorationImage'
import {
  type PurchasedItem,
  type AppliedState,
  EMPTY_APPLIED,
  findPurchasedItem,
} from '@/features/user/shop/model/decorations'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

const Profile = () => {
  const { data: session } = useSession()
  const user = session?.user

  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  const [orders, setOrders] = useState<PurchasedItem[]>([])
  const [applied, setApplied] = useState<AppliedState>(EMPTY_APPLIED)
  const [profileName, setProfileName] = useState<string>('')

  // useEffect 의존성/재생성 문제 방지
  const fetchUserProfile = useCallback(async () => {
    const res = await fetch('/api/users')
    const data = await res.json()
    console.log(data)

    if (!res.ok) {
      toast.error(data.message ?? '유저 정보 조회 실패')
      return
    }

    setOrders(data.orders ?? [])
    setApplied(data.applied ?? EMPTY_APPLIED)
    setProfileName(data.name)
  }, [])

  useEffect(() => {
    if (!user) return
    fetchUserProfile()
  }, [user, fetchUserProfile])

  const appliedBorder = findPurchasedItem(orders, applied.borderId)
  const appliedTop = findPurchasedItem(orders, applied.topId)
  const appliedBottomLeft = findPurchasedItem(orders, applied.bottomLeftId)
  const appliedBottomRight = findPurchasedItem(orders, applied.bottomRightId)
  const appliedTitle = findPurchasedItem(orders, applied.titleId)
  const appliedNickname = findPurchasedItem(orders, applied.nicknameColorId)

  const handleEditClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > MAX_FILE_SIZE) {
      toast.error('이미지 용량은 최대 5MB까지 업로드할 수 있어요')
      e.target.value = ''
      return
    }

    const previewUrl = URL.createObjectURL(file)
    setPreviewImage(previewUrl)

    const fd = new FormData()
    fd.append('avatar', file)

    const res = await fetch('/api/users', { method: 'PATCH', body: fd })
    const text = await res.text()

    if (!res.ok) {
      if (res.status === 413)
        toast.error('이미지 용량은 최대 5MB까지 업로드할 수 있어요.')
      else toast.error('프로필 이미지 업로드에 실패했어요.')
      e.target.value = ''
      return
    }

    const data = JSON.parse(text)
    if (data?.avatar) setPreviewImage(data.avatar)
    e.target.value = ''
  }

  //  훅 다 호출된 뒤에만 early return (Hook order 안전)
  if (!user) return null

  return (
    <main className="flex gap-80 px-50 pt-20">
      <div>
        <div className="relative inline-block w-250">
          <div className="relative inline-block">
            <ProfileAvatar
              name={profileName || user.name}
              image={previewImage ?? user.image}
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
              className="absolute top-20 right-0 flex items-center justify-center rounded-full bg-white p-12 shadow-md hover:cursor-pointer"
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
          <div className="mt-20 flex flex-col items-center gap-6">
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
          </div>
        </div>
      </div>

      <section className="flex-1 shadow-lg">
        <div className="flex h-full flex-col rounded-md bg-white dark:bg-[#313b51]">
          <div className="h-30 rounded-t-md bg-gradient-to-r from-[#6e5aef] to-[#8840ec]" />

          <div className="p-60 px-80">
            <section className="flex flex-col justify-between lg:flex-row">
              <h2 className="text-xl font-semibold">내 정보 수정</h2>
              <MyInfo />
            </section>

            <section className="mt-100 flex justify-between gap-50">
              <h3 className="mb-4 text-lg font-semibold">프로필 꾸미기</h3>
              <div className="flex-1">
                {/*  MyProfile에서 적용 성공 후 refetch */}
                <MyProfile onApplied={fetchUserProfile} />
              </div>
            </section>
          </div>
        </div>

        <div className="mt-4 text-right text-xs text-red-500">회원탈퇴</div>
      </section>
    </main>
  )
}

export default Profile
