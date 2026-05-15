import { Menu, Sun, Moon } from 'lucide-react'
import { useTheme } from 'next-themes'

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const { theme, setTheme } = useTheme()

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-madera-950/90 backdrop-blur-sm border-b border-madera-200 dark:border-madera-800">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg hover:bg-madera-100 dark:hover:bg-madera-800 transition-colors"
          >
            <Menu className="w-5 h-5 text-madera-800 dark:text-madera-200" />
          </button>
          <h1 className="text-lg font-bold text-madera-900 dark:text-madera-50 hidden sm:block">
            Sistema Señor Madera
          </h1>
        </div>

        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2.5 rounded-lg bg-madera-100 dark:bg-madera-800 hover:bg-madera-200 dark:hover:bg-madera-700 transition-colors"
          aria-label="Cambiar tema"
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-amber-400" />
          ) : (
            <Moon className="w-5 h-5 text-madera-800" />
          )}
        </button>
      </div>
    </header>
  )
}