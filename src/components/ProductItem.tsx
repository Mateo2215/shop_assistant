import type { ShoppingItem } from '../types'
import { getCategory } from '../data/categories'

interface ProductItemProps {
  item: ShoppingItem
  onToggle: (id: string, checked: boolean) => void
  onRemove: (id: string) => void
}

export default function ProductItem({ item, onToggle, onRemove }: ProductItemProps) {
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

      <span
        className={`flex-1 text-base transition-all duration-300 ${
          item.checked
            ? 'line-through text-slate-400 dark:text-slate-500'
            : 'text-slate-900 dark:text-slate-100'
        }`}
      >
        {item.name}
        {item.quantity && (
          <span className="text-sm text-slate-400 dark:text-slate-500 ml-1.5">
            {item.quantity}
            {item.unit ? ` ${item.unit}` : ''}
          </span>
        )}
      </span>

      <span className="text-lg flex-shrink-0" title={category.name}>
        {category.emoji}
      </span>

      <button
        onClick={() => onRemove(item.id)}
        className="text-slate-400 dark:text-slate-600 hover:text-red-400 active:text-red-300 transition-colors text-2xl leading-none flex-shrink-0 -mr-1"
        aria-label="Usuń produkt"
      >
        ×
      </button>
    </div>
  )
}
