'use client'

import CommunityNewsDetail from '@/widgets/community/ui/CommunityNewsDetail'
import { useOpen } from '@/shared/model'
import { useParams } from 'next/navigation'

export default function CommunityNewsDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { isOpen, toggleOpen } = useOpen()

  if (!id) return <p className="p-40 text-red-500">Article is missing</p>

  return (
    <CommunityNewsDetail
      articleId={id}
      isOpen={isOpen}
      toggleOpen={toggleOpen}
    />
  )
}
