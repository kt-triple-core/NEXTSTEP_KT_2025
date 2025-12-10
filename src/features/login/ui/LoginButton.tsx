'use client'
import { AccentButton } from '@/shared/ui/button'
import { signIn, signOut, useSession } from 'next-auth/react'
import { ProfileButton } from '../../profile/ui'

const LoginButton = () => {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return <AccentButton disabled>로딩중...</AccentButton>
  }

  if (session) {
    return (
      <div className="flex items-center gap-10">
        <ProfileButton />
        {/* <span className="text-sm">{session.user?.name}님</span> */}
        <AccentButton onClick={() => signOut()}>로그아웃</AccentButton>
      </div>
    )
  }

  return <AccentButton onClick={() => signIn()}>로그인</AccentButton>
}

export default LoginButton
