// Renders unchecked shopping items grouped by store category.
import type { ShoppingItem, CategoryId } from '../types'
import { CATEGORIES, getCategory } from '../data/categories'
import ProductItem from './ProductItem'

interface CategoryListViewProps {
  items: ShoppingItem[]
  onToggle: (id: string, checked: boolean) => void
  onRemove: (item: ShoppingItem) => void
}

export default function CategoryListView({
  items,
  onToggle,
  onRemove,
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
              <div className={`flex items-center gap-2 border-l-[3px] px-4 py-2.5 ${category.bgColor} ${category.borderColor}`}>
                <span className="text-base">{category.emoji}</span>
                <h2 className={`font-brand text-[15px] font-bold ${category.textColor}`}>{category.name}</h2>
                <span className={`ml-auto rounded-full px-2.5 py-0.5 text-[13px] font-bold ${category.badgeColor}`}>
                  {categoryItems.length}
                </span>
              </div>
              <div className="bg-market-lightSurface dark:bg-market-bg">
                {categoryItems.map((item) => (
                  <ProductItem
                    key={item.id}
                    item={item}
                    onToggle={onToggle}
                    onRemove={onRemove}
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
