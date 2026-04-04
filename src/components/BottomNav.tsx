import type { ActiveTab } from '../types'

interface BottomNavProps {
  active: ActiveTab
  onChange: (tab: ActiveTab) => void
}

const TABS: { id: ActiveTab; label: string; emoji: string }[] = [
  { id: 'list',        label: 'Lista',      emoji: '📋' },
  { id: 'templates',   label: 'Szablony',   emoji: '📖' },
  { id: 'historia',    label: 'Historia',   emoji: '🕐' },
  { id: 'statystyki',  label: 'Statystyki', emoji: '📊' },
  { id: 'gazetka',     label: 'Gazetka',    emoji: '🗞️' },
]

export default function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 flex z-10 pb-safe max-w-lg mx-auto">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex-1 flex flex-col items-center pt-2 pb-3 transition-colors ${
            active === tab.id
              ? 'text-indigo-600 dark:text-indigo-400'
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400'
          }`}
        >
          <span className="text-xl leading-none">{tab.emoji}</span>
          <span className="text-xs mt-1 font-medium">{tab.label}</span>
        </button>
      ))}
    </nav>
  )
}
