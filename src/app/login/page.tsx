// app/login/page.tsx
'use client'

import { signIn } from 'next-auth/react'
import Image from 'next/image'
import mainLogo from '@/shared/assets/logo/MainLogo.png'
import mainLogowhite from '@/shared/assets/logo/MainLogoWhite.png'
import githubIcon from '@/shared/assets/github.svg'
import googleIcon from '@/shared/assets/google.svg'
import ThemeProvider from '../providers/ThemeProvider'
import { ThemeToggleButton } from '@/features/theme/ui'
import { useThemeStore } from '@/features/theme/model'

const LoginPage = () => {
  const { theme } = useThemeStore()
  const handleGithubLogin = () => {
    signIn('github', {
      callbackUrl: '/', // 로그인 후 돌아갈 주소
    })
  }

  const handleGoogleLogin = () => {
    signIn('google', {
      callbackUrl: '/', // 로그인 후 돌아갈 주소
    })
  }

  return (
    <ThemeProvider>
      <div className="absolute top-20 right-20">
        <ThemeToggleButton />
      </div>
      <main className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center">
          <Image
            src={theme === 'dark' ? mainLogowhite : mainLogo}
            alt="메인 로고"
            width={300}
            height={100}
          />

          <div className="mt-50 flex flex-col gap-10">
            <button
              onClick={handleGithubLogin}
              className="text-md flex cursor-pointer items-center justify-center gap-20 rounded-md bg-[#24292f] px-50 py-15 font-medium text-white transition hover:bg-[#1b1f23]"
            >
              <Image
                src={githubIcon}
                alt="깃허브 로고"
                width={25}
                height={25}
              />
              <span>GitHub로 로그인</span>
            </button>

            <button
              onClick={handleGoogleLogin}
              className="text-md flex cursor-pointer items-center justify-center gap-20 rounded-md border border-gray-300 bg-white px-50 py-15 font-medium text-black transition hover:bg-gray-50"
            >
              <Image src={googleIcon} alt="구글 로고" width={25} height={25} />
              <span>Google로 로그인</span>
            </button>
          </div>
        </div>
      </main>
    </ThemeProvider>
  )
}

export default LoginPage
