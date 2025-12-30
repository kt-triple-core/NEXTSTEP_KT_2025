import { Button } from '@/shared/ui'
import { useThemeStore } from '../model'
import Sun from './SunIcon'
import Moon from './MoonIcon'

const ThemeToggleButton = () => {
  const toggleTheme = useThemeStore((s) => s.toggleTheme)

  return (
    <Button onClick={toggleTheme} className="h-50 w-50">
      <Sun className="dark:hidden" />
      <Moon className="hidden dark:block" />
    </Button>
  )
}

export default ThemeToggleButton
