'use client'
import { HeaderButton } from '@/shared/ui/button'
import ProfileIcon from './ProfileIcon'

const ProfileButton = () => {
  // TODO 프로필 모달 열기 함수
  // 훅으로 만들면 굿~
  const handleOpenModal = () => {}

  return (
    <HeaderButton onClick={handleOpenModal}>
      <ProfileIcon />
    </HeaderButton>
  )
}

export default ProfileButton
