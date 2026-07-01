// Segmented control for switching between category and weekday list views.
import type { ShoppingListView } from '../types'

interface ListViewToggleProps {
  value: ShoppingListView
  onChange: (value: ShoppingListView) => void
}

export default function ListViewToggle({ value, onChange }: ListViewToggleProps) {
  return (
    <div className="border-b border-market-lightBorder bg-market-lightSurface px-4 py-3 dark:border-white/[0.04] dark:bg-market-header">
      <div className="grid grid-cols-2 rounded-[14px] border border-market-lightBorder bg-market-lightRaised p-1 dark:border-white/[0.06] dark:bg-market-raised">
        <button
          type="button"
          onClick={() => onChange('categories')}
          aria-pressed={value === 'categories'}
          className={`min-h-10 rounded-[10px] text-[14.5px] font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-fresh-green ${
            value === 'categories'
              ? 'bg-gradient-to-br from-fresh-violetLight to-fresh-greenStrong text-white shadow-sm dark:from-fresh-violet dark:to-fresh-green'
              : 'text-market-lightMuted hover:text-market-lightText dark:text-market-muted dark:hover:text-market-text'
          }`}
        >
          Kategorie
        </button>
        <button
          type="button"
          onClick={() => onChange('days')}
          aria-pressed={value === 'days'}
          className={`min-h-10 rounded-[10px] text-[14.5px] font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-fresh-green ${
            value === 'days'
              ? 'bg-gradient-to-br from-fresh-violetLight to-fresh-greenStrong text-white shadow-sm dark:from-fresh-violet dark:to-fresh-green'
              : 'text-market-lightMuted hover:text-market-lightText dark:text-market-muted dark:hover:text-market-text'
          }`}
        >
          Dni
        </button>
      </div>
    </div>
  )
}
