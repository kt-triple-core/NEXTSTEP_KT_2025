import { Suspense } from 'react'
import MainContent from './MainContent'

export default function Main() {
  return (
    <Suspense fallback={<MainLoadingFallback />}>
      <MainContent />
    </Suspense>
  )
}

function MainLoadingFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="animate-pulse">워크스페이스 준비 중...</div>
    </div>
  )
}
