import { BarChart3, BookOpen, ClipboardList, Clock, UtensilsCrossed } from 'lucide-react'
import type { ActiveTab } from '../types'

interface BottomNavProps {
  active: ActiveTab
  onChange: (tab: ActiveTab) => void
}

const TABS: { id: ActiveTab; label: string; icon: typeof ClipboardList }[] = [
  { id: 'list',        label: 'Lista',      icon: ClipboardList },
  { id: 'templates',   label: 'Szablony',   icon: BookOpen },
  { id: 'historia',    label: 'Historia',   icon: Clock },
  { id: 'statystyki',  label: 'Statystyki', icon: BarChart3 },
  { id: 'jadlospis',   label: 'Jadłospis',  icon: UtensilsCrossed },
]

export default function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 mx-auto flex max-w-lg border-t border-black/[0.07] bg-market-lightSurface px-1 pb-safe dark:border-white/[0.05] dark:bg-market-header">
      {TABS.map((tab) => {
        const Icon = tab.icon
        const selected = active === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex min-h-[66px] flex-1 flex-col items-center justify-center gap-1.5 pb-3 pt-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-fresh-green ${
              selected
                ? 'font-bold text-fresh-greenStrong dark:text-fresh-green'
                : 'font-semibold text-[#8b938c] hover:text-market-lightMuted dark:text-[#8b978c] dark:hover:text-market-muted'
            }`}
            aria-current={selected ? 'page' : undefined}
          >
            <Icon size={22} strokeWidth={2} />
            <span className="text-[11px] leading-none">{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
