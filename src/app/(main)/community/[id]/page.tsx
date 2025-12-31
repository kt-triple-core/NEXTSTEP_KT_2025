'use client'

import { useParams } from 'next/navigation'
import { useOpen } from '@/shared/model'
import CommunityDetail from '@/widgets/community/ui/CommunityDetail'

const CommunityDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const { isOpen, toggleOpen } = useOpen()

  if (!id) return <p className="p-40 text-red-500">Post is missing</p>

  return <CommunityDetail postId={id} isOpen={isOpen} toggleOpen={toggleOpen} />
}

export default CommunityDetailPage
