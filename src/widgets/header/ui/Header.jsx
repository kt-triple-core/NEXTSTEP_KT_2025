import Image from 'next/image'
import mainLogo from '@/shared/assets/logo/MainLogo.svg'
import Nav from './Nav'
import { ThemeToggleButton } from '@/features/theme/ui'
import { ProfileButton } from '@/features/profile/ui'

const Header = () => {
  return (
    <header className="bg-primary flex h-80 w-full shrink-0 items-center justify-between px-30">
      <div className="flex items-center">
        <Image src={mainLogo} alt="메인 로고" width={40} height={40} />
        <div className="text-24 text-foreground pl-10">Next Step</div>
        <Nav />
      </div>
      <div className="flex gap-10">
        <ThemeToggleButton />
        <ProfileButton />
      </div>
    </header>
  )
}

export default Header
