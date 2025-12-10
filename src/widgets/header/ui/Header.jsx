'use client'

import Image from 'next/image'
import mainLogo from '@/shared/assets/logo/MainLogo.png'
import mainLogowhite from '@/shared/assets/logo/MainLogoWhite.png'
import Nav from './Nav'
import { ThemeToggleButton } from '@/features/theme/ui'
import { ProfileButton } from '@/features/profile/ui'
import LoginButton from '@/features/login/ui/LoginButton'
import { useThemeStore } from '@/features/theme/model'

const Header = () => {
  const { theme } = useThemeStore()
  return (
    <header className="bg-primary flex h-80 w-full shrink-0 items-center justify-between px-30">
      <div className="flex items-center">
        <Image
          src={theme === 'dark' ? mainLogowhite : mainLogo}
          alt="메인 로고"
          width={150}
          height={40}
        />
        <Nav />
      </div>
      <div className="flex gap-10">
        <LoginButton />
        <ThemeToggleButton />
      </div>
    </header>
  )
}

export default Header
