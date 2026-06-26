import { Moon, Sun } from 'lucide-react'

interface HeaderProps {
  checkedCount: number
  onClearChecked: () => void
  isDark: boolean
  onToggleTheme: () => void
}

export default function Header({ checkedCount, onClearChecked, isDark, onToggleTheme }: HeaderProps) {
  const ThemeIcon = isDark ? Sun : Moon

  return (
    <header className="sticky top-0 z-20 flex h-[var(--app-header-height)] items-center justify-between border-b border-market-lightBorder bg-market-lightSurface px-4 dark:border-white/[0.05] dark:bg-market-header">
      <div className="flex items-center gap-2">
        <span className="text-lg" aria-hidden="true">🥬</span>
        <h1 className="bg-gradient-to-r from-fresh-violetLight to-fresh-greenStrong bg-clip-text font-brand text-[22px] font-bold text-transparent dark:from-[#b79bf3] dark:to-fresh-greenSoft">
          Zakupowo
        </h1>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleTheme}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-market-lightRaised text-fresh-violetLight transition-colors hover:bg-[#e8dfcf] focus:outline-none focus:ring-2 focus:ring-fresh-violetLight dark:bg-market-elevated dark:text-fresh-amber dark:hover:bg-[#313b33] dark:focus:ring-fresh-green"
          title={isDark ? 'Przełącz na jasny motyw' : 'Przełącz na ciemny motyw'}
          aria-label={isDark ? 'Przełącz na jasny motyw' : 'Przełącz na ciemny motyw'}
        >
          <ThemeIcon size={19} strokeWidth={2.1} />
        </button>
        {checkedCount > 0 && (
          <button
            onClick={onClearChecked}
            className="min-h-10 rounded-full border border-fresh-greenStrong/25 bg-fresh-greenStrong/10 px-3 text-sm font-bold text-fresh-greenStrong transition-colors hover:bg-fresh-greenStrong/15 focus:outline-none focus:ring-2 focus:ring-fresh-greenStrong dark:border-fresh-green/30 dark:bg-fresh-green/10 dark:text-fresh-green"
          >
            Usuń kupione ({checkedCount})
          </button>
        )}
      </div>
    </header>
  )
}
