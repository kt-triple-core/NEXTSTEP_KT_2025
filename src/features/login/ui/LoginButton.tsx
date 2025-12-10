'use client'
import { AccentButton } from '@/shared/ui/button'
import { signIn, signOut, useSession } from 'next-auth/react'
import { ProfileButton } from '../../profile/ui'
import { useRouter } from 'next/navigation'

const LoginButton = () => {
  const { data: session, status } = useSession()
  const router = useRouter()

  if (status === 'loading') {
    return <AccentButton disabled>로딩중...</AccentButton>
  }

  if (session) {
    return (
      <div className="flex items-center gap-10">
        <ProfileButton />
        {/* <span className="text-sm">{session.user?.name}님</span> */}
        <AccentButton
          className="h-50"
          onClick={() => signOut({ callbackUrl: '/' })}
        >
          로그아웃
        </AccentButton>
      </div>
    )
  }

  return (
    <AccentButton onClick={() => router.push('/login')}>로그인</AccentButton>
  )
}

export default LoginButton
