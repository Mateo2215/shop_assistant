// Segmented control for switching between category and weekday list views.
import type { ShoppingListView } from '../types'

interface ListViewToggleProps {
  value: ShoppingListView
  onChange: (value: ShoppingListView) => void
  daysDisabled?: boolean
}

export default function ListViewToggle({
  value,
  onChange,
  daysDisabled = false,
}: ListViewToggleProps) {
  return (
    <div className="border-b border-slate-200 bg-white px-3 py-2.5 dark:border-slate-800 dark:bg-slate-900">
      <div className="grid grid-cols-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
        <button
          type="button"
          onClick={() => onChange('categories')}
          aria-pressed={value === 'categories'}
          className={`min-h-10 rounded-lg text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            value === 'categories'
              ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-indigo-300'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          Kategorie
        </button>
        <button
          type="button"
          onClick={() => onChange('days')}
          disabled={daysDisabled}
          aria-pressed={value === 'days'}
          className={`min-h-10 rounded-lg text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-40 ${
            value === 'days'
              ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-indigo-300'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          Dni
        </button>
      </div>
    </div>
  )
}
