import { useMyPoint } from '@/features/user/pointHistory/model/useMyPoint'
import MenuTab from '@/features/user/shop/ui/MenuTab'
import { Button } from '@/shared/ui'
import ProfileAvatar from '@/shared/ui/profile/ProfileAvatar'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

const Shop = () => {
  const router = useRouter()
  const { data: session, update } = useSession()
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const { point, setPoint } = useMyPoint()
  if (!session?.user) return null
  return (
    <main className="flex gap-80 px-50 pt-20">
      <div>
        <div className="relative inline-block w-250">
          <ProfileAvatar
            name={session.user.name}
            image={previewImage ?? session.user.image}
            size={250}
          />
        </div>
      </div>
      <section className="flex-1 shadow-lg">
        <div className="flex h-full flex-col rounded-md bg-white dark:bg-[#313b51]">
          <div className="flex items-center justify-between rounded-t-md bg-gradient-to-r from-[#6e5aef] to-[#8840ec] px-50 py-40">
            <div className="flex flex-col gap-15 text-white">
              <h2 className="text-3xl font-bold">🛒 상점</h2>
              <span className="text-18 ml-10 font-medium">
                포인트를 통해서 나만의 프로필을 꾸며봐요.
              </span>
            </div>
            <div className="flex flex-col items-end gap-12">
              <div className="text-3xl font-bold text-white">
                내 포인트 : {point === null ? '...' : point.toLocaleString()}P
              </div>
              <Button
                onClick={() => router.push('/users?tab=quest&sub=point')}
                className="rounded-sm px-12 py-4 font-medium hover:opacity-80 hover:transition"
              >
                포인트 내역 확인하기
              </Button>
            </div>
          </div>
          <div className="p-40">
            <MenuTab />
          </div>
        </div>
      </section>
    </main>
  )
}

export default Shop
