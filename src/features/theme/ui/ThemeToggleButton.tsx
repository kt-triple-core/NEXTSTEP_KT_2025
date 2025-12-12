import { Button } from '@/shared/ui'
import { useThemeStore } from '../model'
import Sun from './SunIcon'
import Moon from './MoonIcon'

const ThemeToggleButton = () => {
  const { theme, toggleTheme } = useThemeStore()
  return (
    <Button onClick={toggleTheme} className="h-50 w-50">
      {theme === 'light' ? <Sun /> : <Moon />}
    </Button>
  )
}

export default ThemeToggleButton
