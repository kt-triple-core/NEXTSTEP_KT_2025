'use client'

import { useEffect } from 'react'
import { useThemeStore } from '@/features/theme/model'
import { getStoredTheme } from '@/features/theme/lib'

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { setTheme, theme } = useThemeStore()

  useEffect(() => {
    const stored = getStoredTheme()
    setTheme(stored)
  }, [setTheme])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return <>{children}</>
}
