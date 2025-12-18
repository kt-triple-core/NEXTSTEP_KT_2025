'use client'

import Link from 'next/link'
import Image from 'next/image'
import mainLogo from '@/shared/assets/logo/MainLogo.png'
import mainLogowhite from '@/shared/assets/logo/MainLogoWhite.png'
import { useThemeStore } from '@/features/theme/model'
const NotFound = () => {
  const { theme } = useThemeStore()
  return (
    <div className="bg-secondary flex h-screen flex-col items-center justify-center gap-30 px-4 text-center">
      <Image
        src={theme === 'dark' ? mainLogowhite : mainLogo}
        alt="메인 로고"
        width={150}
        height={40}
      />
      <div className="relative mb-8">
        <div className="bg-primary/50 absolute inset-0 -z-10 animate-pulse rounded-full blur-3xl" />
        <h1 className="text-accent text-9xl font-black tracking-tighter">
          404
        </h1>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800 md:text-3xl">
          길을 잃으신 것 같아요!
        </h2>
        <p className="max-w-md text-gray-500">
          찾으시는 페이지가 삭제되었거나 주소가 잘못되었습니다. <br />
          아래 버튼을 눌러 안전한 홈으로 돌아가세요.
        </p>
      </div>

      <Link
        href="/"
        className="bg-accent hover:bg-accent/90 hover:shadow-accent/30 mt-12 inline-block rounded-full px-30 py-15 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 active:scale-95"
      >
        홈으로 돌아가기
      </Link>

      <div className="bg-primary mt-20 h-1 w-20 rounded-full" />
    </div>
  )
}

export default NotFound
