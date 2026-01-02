import { Button } from '@/shared/ui'
import { signOut, useSession } from 'next-auth/react'
import { ProfileButton } from '../../profile/ui'
import { useWorkspaceStore } from '@/widgets/workspace/model'
import { usePreventNavigation } from '@/shared/model/usePreventNavigation'

const LoginButton = () => {
  const { data: session, status } = useSession()
  const isEdited = useWorkspaceStore((s) => s.isEdited)
  const resetToEmpty = useWorkspaceStore((s) => s.resetToEmpty)
  const { safeNavigate } = usePreventNavigation({
    when: isEdited,
  })

  const handleLogout = () => {
    if (isEdited) {
      const confirmed = window.confirm(
        '저장하지 않은 변경사항이 있습니다. 로그아웃하시겠습니까?'
      )
      if (!confirmed) return
    }
    resetToEmpty()
    signOut({ callbackUrl: '/' })
  }

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
        <Button variant="accent" className="h-50 px-20" onClick={handleLogout}>
          로그아웃
        </Button>
      </div>
    )
  }

  return (
    <Button
      variant="accent"
      className="px-20"
      onClick={() => safeNavigate('/login')}
    >
      로그인
    </Button>
  )
}

export default LoginButton
