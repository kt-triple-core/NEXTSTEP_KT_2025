import { useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface UsePreventNavigationOptions {
  when: boolean
  message?: string
}

/**
 * 저장되지 않은 변경사항이 있을 때 페이지 이동을 방지하는 훅
 *
 * @example
 * ```tsx
 * const isEdited = useWorkspaceStore(s => s.isEdited)
 * const { safeNavigate, handleLinkClick } = usePreventNavigation({ when: isEdited })
 *
 * // Link 컴포넌트 사용 (권장)
 * <Link href="/users" onClick={handleLinkClick}>프로필</Link>
 *
 * // 프로그래매틱 네비게이션
 * <button onClick={() => safeNavigate('/users')}>이동</button>
 * ```
 */
export function usePreventNavigation({
  when,
  message = '저장하지 않은 변경사항이 있습니다. 정말 이동하시겠습니까?',
}: UsePreventNavigationOptions) {
  const whenRef = useRef(when)
  const router = useRouter()

  // 최신 when 값을 ref에 동기화
  useEffect(() => {
    whenRef.current = when
  }, [when])

  // 브라우저 새로고침/닫기 방지
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!whenRef.current) return
      e.preventDefault()
      e.returnValue = ''
    }

    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [])

  /**
   * Next.js Link 컴포넌트용 클릭 핸들러
   * 저장되지 않은 변경사항이 있으면 확인 후 이동
   */
  const handleLinkClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (!whenRef.current) return // 저장됨 → Link 기본 동작

      e.preventDefault()
      const confirmed = window.confirm(message)
      if (confirmed) {
        const href = e.currentTarget.getAttribute('href')
        if (href) router.push(href)
      }
    },
    [router, message]
  )

  /**
   * 프로그래매틱 네비게이션
   * 복잡한 로직이나 동적 URL 생성 시 사용
   */
  const safeNavigate = useCallback(
    (path: string) => {
      if (whenRef.current) {
        const confirmed = window.confirm(message)
        if (!confirmed) return
      }
      router.push(path)
    },
    [router, message]
  )

  return {
    handleLinkClick,
    safeNavigate,
  }
}
