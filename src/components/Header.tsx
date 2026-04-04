interface HeaderProps {
  checkedCount: number
  onClearChecked: () => void
  isDark: boolean
  onToggleTheme: () => void
}

export default function Header({ checkedCount, onClearChecked, isDark, onToggleTheme }: HeaderProps) {
  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
      <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
        Zakupowo
      </h1>
      <div className="flex items-center gap-1.5">
        <button
          onClick={onToggleTheme}
          className="text-xl w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={isDark ? 'Przełącz na jasny motyw' : 'Przełącz na ciemny motyw'}
        >
          {isDark ? '☀️' : '🌙'}
        </button>
        {checkedCount > 0 && (
          <button
            onClick={onClearChecked}
            className="text-sm bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:bg-slate-300 dark:active:bg-slate-600 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 px-3 py-1.5 rounded-full transition-colors font-medium"
          >
            Usuń kupione ({checkedCount})
          </button>
        )}
      </div>
    </header>
  )
}
