import type { ShoppingItem } from '../types'
import { AlertTriangle, ShoppingCart } from 'lucide-react'
import CategoryListView from './CategoryListView'
import ProductItem from './ProductItem'

interface ShoppingListProps {
  items: ShoppingItem[]
  loading: boolean
  error: string | null
  onToggle: (id: string, checked: boolean) => void
  onRemove: (item: ShoppingItem) => void
}

export default function ShoppingList({
  items,
  loading,
  error,
  onToggle,
  onRemove,
}: ShoppingListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-market-lightMuted dark:text-market-muted">
        <div className="text-center">
          <ShoppingCart className="mx-auto mb-3 animate-pulse text-fresh-greenStrong dark:text-fresh-green" size={38} />
          <p className="text-sm">Ładowanie listy...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center px-6">
          <AlertTriangle className="mx-auto mb-3 text-fresh-danger" size={38} />
          <p className="font-bold text-market-lightText dark:text-market-text">Błąd połączenia</p>
          <p className="mt-1 text-sm text-market-lightMuted dark:text-market-muted">{error}</p>
        </div>
      </div>
    )
  }

  const unchecked = items.filter((i) => !i.checked)
  const checked = items.filter((i) => i.checked)

  return (
    <div className="pb-28">
      {unchecked.length === 0 && checked.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-6 py-20 text-center text-market-lightMuted dark:text-market-muted">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-fresh-greenStrong/10 text-fresh-greenStrong dark:bg-fresh-green/10 dark:text-fresh-green">
            <ShoppingCart size={34} />
          </div>
          <p className="font-brand text-lg font-bold text-market-lightText dark:text-market-text">Lista jest pusta</p>
          <p className="mt-1 text-sm">Dodaj pierwszy produkt powyżej</p>
        </div>
      ) : (
        <CategoryListView items={unchecked} onToggle={onToggle} onRemove={onRemove} />
      )}

      {checked.length > 0 && (
        <div className="mt-3">
          <div className="flex items-center gap-2 bg-fresh-greenStrong/10 px-4 py-2 dark:bg-fresh-green/10">
            <span className="text-base">✅</span>
            <span className="font-brand text-sm font-bold text-fresh-greenStrong dark:text-fresh-green">Kupione</span>
            <span className="ml-auto rounded-full bg-fresh-greenStrong/10 px-2 py-0.5 text-xs font-bold text-fresh-greenStrong dark:bg-fresh-green/15 dark:text-fresh-green">{checked.length}</span>
          </div>
          <div className="bg-market-lightSurface dark:bg-market-bg">
            {checked.map((item) => (
              <ProductItem key={item.id} item={item} onToggle={onToggle} onRemove={onRemove} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
