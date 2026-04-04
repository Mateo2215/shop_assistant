import type { ShoppingItem, CategoryId } from '../types'
import { CATEGORIES, getCategory } from '../data/categories'
import ProductItem from './ProductItem'

interface ShoppingListProps {
  items: ShoppingItem[]
  loading: boolean
  error: string | null
  onToggle: (id: string, checked: boolean) => void
  onRemove: (id: string) => void
}

export default function ShoppingList({ items, loading, error, onToggle, onRemove }: ShoppingListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-500">
        <div className="text-center">
          <div className="text-4xl mb-3 animate-pulse">🛒</div>
          <p className="text-sm">Ładowanie listy...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center px-6">
          <div className="text-4xl mb-3">⚠️</div>
          <p className="text-slate-700 dark:text-slate-300 font-medium">Błąd połączenia</p>
          <p className="text-sm text-slate-500 mt-1">{error}</p>
        </div>
      </div>
    )
  }

  const unchecked = items.filter((i) => !i.checked)
  const checked = items.filter((i) => i.checked)

  if (unchecked.length === 0 && checked.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <div className="text-5xl mb-3">🛒</div>
        <p className="text-lg font-medium text-slate-500 dark:text-slate-400">Lista jest pusta</p>
        <p className="text-sm mt-1">Dodaj pierwszy produkt powyżej</p>
      </div>
    )
  }

  // Group unchecked items by category, maintaining CATEGORIES order
  const grouped = CATEGORIES.reduce<Partial<Record<CategoryId, ShoppingItem[]>>>((acc, cat) => {
    const catItems = unchecked.filter((i) => i.category === cat.id)
    if (catItems.length > 0) acc[cat.id] = catItems
    return acc
  }, {})

  // Items with unknown/legacy categories not caught above
  const knownIds = new Set(CATEGORIES.map((c) => c.id))
  const ungrouped = unchecked.filter((i) => !knownIds.has(i.category))
  if (ungrouped.length > 0) {
    grouped['other' as CategoryId] = [...(grouped['other'] ?? []), ...ungrouped]
  }

  return (
    <div className="pb-28">
      {(Object.entries(grouped) as [CategoryId, ShoppingItem[]][]).map(([catId, catItems]) => {
        const cat = getCategory(catId)
        return (
          <div key={catId} className="mb-1">
            <div className={`px-4 py-1.5 flex items-center gap-2 ${cat.bgColor}`}>
              <span className="text-base">{cat.emoji}</span>
              <span className={`text-sm font-semibold ${cat.textColor}`}>{cat.name}</span>
              <span className="ml-auto text-xs text-slate-400 dark:text-slate-500">{catItems.length}</span>
            </div>
            <div className="bg-white dark:bg-slate-900">
              {catItems.map((item) => (
                <ProductItem
                  key={item.id}
                  item={item}
                  onToggle={onToggle}
                  onRemove={onRemove}
                />
              ))}
            </div>
          </div>
        )
      })}

      {checked.length > 0 && (
        <div className="mt-3">
          <div className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800/50 flex items-center gap-2">
            <span className="text-base">✅</span>
            <span className="text-sm font-semibold text-slate-500">Kupione</span>
            <span className="ml-auto text-xs text-slate-400 dark:text-slate-600">{checked.length}</span>
          </div>
          <div className="bg-white dark:bg-slate-900">
            {checked.map((item) => (
              <ProductItem
                key={item.id}
                item={item}
                onToggle={onToggle}
                onRemove={onRemove}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
