import type { MealPlan, ShoppingItem, ShoppingListView } from '../types'
import { getEffectiveDays } from '../data/weekdays'
import CategoryListView from './CategoryListView'
import DayListView from './DayListView'
import ListViewToggle from './ListViewToggle'
import ProductItem from './ProductItem'

interface ShoppingListProps {
  items: ShoppingItem[]
  mealPlans: MealPlan[]
  loading: boolean
  error: string | null
  mealPlansLoading: boolean
  mealPlansError: string | null
  view: ShoppingListView
  onViewChange: (view: ShoppingListView) => void
  onToggle: (id: string, checked: boolean) => void
  onRemove: (item: ShoppingItem) => void
  onEditDays: (item: ShoppingItem) => void
  onEditMealPlan: (plan: MealPlan) => void
}

export default function ShoppingList({
  items,
  mealPlans,
  loading,
  error,
  mealPlansLoading,
  mealPlansError,
  view,
  onViewChange,
  onToggle,
  onRemove,
  onEditDays,
  onEditMealPlan,
}: ShoppingListProps) {
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

  return (
    <div className="pb-28">
      <ListViewToggle
        value={view}
        onChange={onViewChange}
        daysDisabled={Boolean(mealPlansError)}
      />

      {mealPlansError && (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
          {mealPlansError} Widok kategorii nadal działa.
        </div>
      )}

      {view === 'days' && mealPlansLoading && (
        <div className="px-4 py-4 text-center text-sm text-slate-500">
          Ładowanie planów posiłków...
        </div>
      )}

      {unchecked.length === 0 && checked.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <div className="mb-3 text-5xl">🛒</div>
          <p className="text-lg font-medium text-slate-500 dark:text-slate-400">Lista jest pusta</p>
          <p className="mt-1 text-sm">Dodaj pierwszy produkt powyżej</p>
        </div>
      ) : view === 'categories' ? (
        <CategoryListView
          items={unchecked}
          mealPlans={mealPlans}
          onToggle={onToggle}
          onRemove={onRemove}
          onEditDays={onEditDays}
        />
      ) : !mealPlansLoading && !mealPlansError ? (
        <DayListView
          items={unchecked}
          mealPlans={mealPlans}
          onToggle={onToggle}
          onRemove={onRemove}
          onEditDays={onEditDays}
          onEditMealPlan={onEditMealPlan}
        />
      ) : null}

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
                days={getEffectiveDays(item, mealPlans)}
                onToggle={onToggle}
                onRemove={onRemove}
                onEditDays={onEditDays}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
