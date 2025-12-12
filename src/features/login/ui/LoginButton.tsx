import { Button } from '@/shared/ui'
import { signIn, signOut, useSession } from 'next-auth/react'
import { ProfileButton } from '../../profile/ui'
import { useRouter } from 'next/navigation'

const LoginButton = () => {
  const { data: session, status } = useSession()
  const router = useRouter()

  if (status === 'loading') {
    return (
      <Button variant="accent" disabled className="px-20">
        로딩중...
      </Button>
    )
  }

  if (session) {
    return (
      <div className="flex items-center gap-10">
        <ProfileButton />
        {/* <span className="text-sm">{session.user?.name}님</span> */}
        <Button
          variant="accent"
          className="h-50 px-20"
          onClick={() => signOut({ callbackUrl: '/' })}
        >
          로그아웃
        </Button>
      </div>
    )
  }

  return (
    <Button
      variant="accent"
      onClick={() => router.push('/login')}
      className="px-20"
    >
      로그인
    </Button>
  )
}

export default LoginButton
