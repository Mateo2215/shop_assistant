import type { ShoppingItem, Weekday } from '../types'
import { getCategory } from '../data/categories'
import { getWeekdayShortLabel } from '../data/weekdays'

interface ProductItemProps {
  item: ShoppingItem
  days: Weekday[]
  showDayTags?: boolean
  onToggle: (id: string, checked: boolean) => void
  onRemove: (item: ShoppingItem) => void
  onEditDays: (item: ShoppingItem) => void
}

export default function ProductItem({
  item,
  days,
  showDayTags = true,
  onToggle,
  onRemove,
  onEditDays,
}: ProductItemProps) {
  const category = getCategory(item.category)

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-800 last:border-0 animate-slide-in transition-opacity duration-300 ${
        item.checked ? 'opacity-40' : 'opacity-100'
      }`}
    >
      <button
        onClick={() => onToggle(item.id, !item.checked)}
        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors duration-200 ${
          item.checked
            ? 'bg-emerald-500 border-emerald-500 text-white animate-check-pop'
            : 'border-slate-400 dark:border-slate-600 hover:border-indigo-400 active:scale-90'
        }`}
        aria-label={item.checked ? 'Odznacz' : 'Zaznacz jako kupione'}
      >
        {item.checked && (
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      <div className="min-w-0 flex-1">
        <p
          className={`text-base transition-all duration-300 ${
            item.checked
              ? 'line-through text-slate-400 dark:text-slate-500'
              : 'text-slate-900 dark:text-slate-100'
          }`}
        >
          {item.name}
          {item.quantity && (
            <span className="ml-1.5 text-sm text-slate-400 dark:text-slate-500">
              {item.quantity}
              {item.unit ? ` ${item.unit}` : ''}
            </span>
          )}
        </p>
        {showDayTags && days.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {days.map((day) => (
              <span
                key={day}
                className="rounded-full bg-indigo-50 px-1.5 py-0.5 text-[11px] font-semibold text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300"
              >
                {getWeekdayShortLabel(day)}
              </span>
            ))}
          </div>
        )}
      </div>

      <span className="text-lg flex-shrink-0" title={category.name}>
        {category.emoji}
      </span>

      <button
        type="button"
        onClick={() => onEditDays(item)}
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-base text-slate-400 transition-colors hover:bg-indigo-50 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-slate-500 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-300"
        aria-label={`Ustaw dni dla produktu ${item.name}`}
        title="Ustaw dni"
      >
        📅
      </button>

      <button
        type="button"
        onClick={() => onRemove(item)}
        className="-mr-1 flex-shrink-0 text-2xl leading-none text-slate-400 transition-colors hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-red-400 dark:text-slate-600"
        aria-label="Usuń produkt"
      >
        ×
      </button>
    </div>
  )
}
