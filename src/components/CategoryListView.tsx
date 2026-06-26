// Renders unchecked shopping items grouped by store category.
import type { MealPlan, ShoppingItem, CategoryId } from '../types'
import { CATEGORIES, getCategory } from '../data/categories'
import { getEffectiveDays } from '../data/weekdays'
import ProductItem from './ProductItem'

interface CategoryListViewProps {
  items: ShoppingItem[]
  mealPlans: MealPlan[]
  onToggle: (id: string, checked: boolean) => void
  onRemove: (item: ShoppingItem) => void
  onEditDays: (item: ShoppingItem) => void
}

export default function CategoryListView({
  items,
  mealPlans,
  onToggle,
  onRemove,
  onEditDays,
}: CategoryListViewProps) {
  const grouped = CATEGORIES.reduce<Partial<Record<CategoryId, ShoppingItem[]>>>(
    (groups, category) => {
      const categoryItems = items.filter((item) => item.category === category.id)
      if (categoryItems.length > 0) groups[category.id] = categoryItems
      return groups
    },
    {}
  )

  const knownIds = new Set(CATEGORIES.map((category) => category.id))
  const ungrouped = items.filter((item) => !knownIds.has(item.category))
  if (ungrouped.length > 0) {
    grouped.other = [...(grouped.other ?? []), ...ungrouped]
  }

  return (
    <>
      {(Object.entries(grouped) as [CategoryId, ShoppingItem[]][]).map(
        ([categoryId, categoryItems]) => {
          const category = getCategory(categoryId)
          return (
            <section key={categoryId} className="mb-1">
              <div className={`flex items-center gap-2 px-4 py-1.5 ${category.bgColor}`}>
                <span className="text-base">{category.emoji}</span>
                <h2 className={`text-sm font-semibold ${category.textColor}`}>{category.name}</h2>
                <span className="ml-auto text-xs text-slate-400 dark:text-slate-500">
                  {categoryItems.length}
                </span>
              </div>
              <div className="bg-white dark:bg-slate-900">
                {categoryItems.map((item) => (
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
            </section>
          )
        }
      )}
    </>
  )
}
