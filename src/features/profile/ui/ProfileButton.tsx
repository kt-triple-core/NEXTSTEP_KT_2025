'use client'
import { useSession } from 'next-auth/react'
import MyProfileAvatar from './MyProfileAvatar'
import Link from 'next/link'
import { useWorkspaceStore } from '@/widgets/workspace/model'
import { usePreventNavigation } from '@/shared/model/usePreventNavigation'

const ProfileButton = () => {
  const { data: session } = useSession()
  const isEdited = useWorkspaceStore((s) => s.isEdited)
  const { handleLinkClick } = usePreventNavigation({ when: isEdited })
  if (!session?.user) return null

  return (
    <Link
      href="/users"
      className="flex items-center gap-8 hover:cursor-pointer"
      onClick={handleLinkClick}
    >
      <MyProfileAvatar size={45} />
    </Link>
  )
}

export default ProfileButton
