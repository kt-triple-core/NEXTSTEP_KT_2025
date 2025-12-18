'use client'

import ProfileAvatar from '@/shared/ui/profile/ProfileAvatar'
import { useSession } from 'next-auth/react'
import MyInfo from '@/features/user/updateMyInfo/ui/MyInfo'
import { useRef, useState } from 'react'

const PROFILETAB_LIST = [
  { key: 'accessory', label: '악세사리' },
  { key: 'borderline', label: '테두리' },
  { key: 'title', label: '칭호' },
  { key: 'nickname', label: '닉네임' },
] as const

type TabKey = (typeof PROFILETAB_LIST)[number]['key']

const Profile = () => {
  const { data: session } = useSession()

  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabKey>('accessory')

  if (!session?.user) return null

  const handleTabClick = (key: TabKey) => {
    setActiveTab(key)
  }
  const handleEditClick = () => {
    fileInputRef.current?.click()
  }
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 1️⃣ 로컬 미리보기
    const previewUrl = URL.createObjectURL(file)
    setPreviewImage(previewUrl)

    // 2️⃣ 서버 업로드 (예시는 API 호출)
    const fd = new FormData()
    fd.append('avatar', file)
    const res = await fetch('/api/users', {
      method: 'PATCH',
      body: fd,
    })
    if (!res.ok) {
      // 실패 시 미리보기 되돌리고 싶으면 여기서 처리
      return
    }
    const data = await res.json()
    // ✅ 서버가 내려준 avatar(=DB에 저장된 URL)로 교체
    if (data?.avatar) setPreviewImage(data.avatar)

    // 같은 파일 다시 선택해도 change 이벤트 뜨게
    e.target.value = ''
  }
  return (
    <main className="flex gap-80 px-50 py-30">
      <div>
        <div className="relative inline-block w-250">
          <ProfileAvatar
            name={session.user.name}
            image={previewImage ?? session.user.image}
            size={250}
          />
          <button
            onClick={handleEditClick}
            className="absolute right-20 bottom-5 flex items-center justify-center rounded-full bg-white p-12 shadow-md hover:cursor-pointer"
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
      </div>
      <section className="flex-1 shadow-lg">
        <div className="flex h-full flex-col rounded-md bg-white">
          <div className="h-30 rounded-t-md bg-gradient-to-r from-[#6e5aef] to-[#8840ec]" />

          {/* 안쪽 컨텐츠  */}
          <div className="p-60 px-80">
            {/* 내 정보 수정 */}
            <section className="flex flex-col justify-between lg:flex-row">
              <h2 className="text-xl font-semibold">내 정보 수정</h2>
              <MyInfo />
            </section>

            {/* 프로필 꾸미기 */}
            <section className="mt-100 flex justify-between gap-50">
              <h3 className="mb-4 text-lg font-semibold">프로필 꾸미기</h3>
              <div className="flex-1">
                {/* 탭 */}
                <div className="mb-6 flex gap-50 border-b border-gray-300 text-sm">
                  {PROFILETAB_LIST.map((tab) => (
                    <button
                      key={tab.key}
                      className={`px-20 py-10 ${
                        activeTab === tab.key
                          ? 'border-accent text-accent border-b-2'
                          : 'text-gray-500'
                      }`}
                      onClick={() => handleTabClick(tab.key)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                {activeTab === 'accessory' && (
                  <div className="flex flex-col items-center rounded-3xl bg-white p-6 shadow-[0_10px_25px_rgba(0,0,0,0.06)]">
                    <div className="relative mb-4 flex h-32 w-32 items-center justify-center rounded-full bg-purple-400">
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2"></div>
                    </div>
                    <div className="mb-3 text-sm font-semibold">신사 모자</div>
                    <div className="flex w-full gap-2 text-xs">
                      <button className="flex-1 rounded-full border border-gray-200 px-3 py-1.5 text-gray-600">
                        보기
                      </button>
                      <button className="flex-1 rounded-full border border-purple-200 px-3 py-1.5 text-purple-600">
                        적용하기
                      </button>
                    </div>
                  </div>
                )}
                {activeTab === 'borderline' && <div>테두리 컨텐츠</div>}
                {activeTab === 'title' && <div>칭호 컨텐츠</div>}
                {activeTab === 'nickname' && <div>닉네임 컨텐츠</div>}
                <div className="grid grid-cols-3 gap-6">{/* 카드 1 */}</div>
              </div>
            </section>
          </div>
        </div>
        {/* 오른쪽 아래 작은 텍스트 */}
        <div className="mt-4 text-right text-xs text-red-500">회원탈퇴</div>
      </section>
    </main>
  )
}
export default Profile
