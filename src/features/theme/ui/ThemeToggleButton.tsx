'use client'
import { HeaderButton } from '@/shared/ui/button'
import { useThemeStore } from '../model'
import Sun from './SunIcon'
import Moon from './MoonIcon'

const ThemeToggleButton = () => {
  const { theme, toggleTheme } = useThemeStore()
  return (
    <HeaderButton onClick={toggleTheme}>
      {theme === 'light' ? <Sun /> : <Moon />}
    </HeaderButton>
  )
}

export default ThemeToggleButton
