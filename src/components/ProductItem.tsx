import { CalendarDays, Check, X } from 'lucide-react'
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
      className={`flex animate-slide-in items-center gap-3 border-b border-market-lightBorder px-4 py-3.5 transition-opacity duration-300 last:border-0 dark:border-white/[0.04] ${
        item.checked ? 'opacity-40' : 'opacity-100'
      }`}
    >
      <button
        onClick={() => onToggle(item.id, !item.checked)}
        className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-fresh-green ${
          item.checked
            ? 'animate-check-pop border-fresh-greenStrong bg-fresh-greenStrong text-white dark:border-fresh-green dark:bg-fresh-green'
            : 'border-[#c8c1b0] hover:border-fresh-violetLight active:scale-90 dark:border-[#56655a] dark:hover:border-fresh-green'
        }`}
        aria-label={item.checked ? 'Odznacz' : 'Zaznacz jako kupione'}
      >
        {item.checked && (
          <Check size={15} strokeWidth={3} />
        )}
      </button>

      <div className="min-w-0 flex-1">
        <p
          className={`text-[15.5px] font-bold leading-tight transition-all duration-300 ${
            item.checked
              ? 'text-market-lightSubtle line-through dark:text-market-subtle'
              : 'text-market-lightText dark:text-market-text'
          }`}
        >
          {item.name}
          {item.quantity && (
            <span className="ml-1.5 text-sm font-semibold text-market-lightMuted dark:text-market-muted">
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
                className="rounded-md bg-market-lightRaised px-2 py-0.5 text-[11.5px] font-semibold text-market-lightMuted dark:bg-white/[0.06] dark:text-market-muted"
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
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-fresh-violetLight transition-colors hover:bg-fresh-violetLight/10 focus:outline-none focus:ring-2 focus:ring-fresh-violetLight dark:text-fresh-blue dark:hover:bg-fresh-blue/10"
        aria-label={`Ustaw dni dla produktu ${item.name}`}
        title="Ustaw dni"
      >
        <CalendarDays size={18} strokeWidth={2} />
      </button>

      <button
        type="button"
        onClick={() => onRemove(item)}
        className="-mr-1 flex h-10 w-9 flex-shrink-0 items-center justify-center rounded-full text-[#8a8171] transition-colors hover:bg-fresh-danger/10 hover:text-fresh-danger focus:outline-none focus:ring-2 focus:ring-fresh-danger dark:text-[#56655a]"
        aria-label="Usuń produkt"
      >
        <X size={17} strokeWidth={2.2} />
      </button>
    </div>
  )
}
