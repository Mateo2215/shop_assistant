// Renders unchecked shopping items grouped by weekday, driven purely by meal plans.
// A day's items come from meal plans scheduled that day; anything not tied to a
// plan lands in the "Bez dnia" section. No per-product day pinning.
import { CalendarDays, ChevronRight, Circle } from 'lucide-react'
import { WEEKDAYS } from '../data/weekdays'
import type { MealPlan, ShoppingItem, Weekday } from '../types'
import ProductItem from './ProductItem'

interface DayListViewProps {
  items: ShoppingItem[]
  mealPlans: MealPlan[]
  onToggle: (id: string, checked: boolean) => void
  onRemove: (item: ShoppingItem) => void
  onEditMealPlan: (plan: MealPlan) => void
}

function getPlanItems(plan: MealPlan, itemsById: Map<string, ShoppingItem>) {
  return plan.items
    .map((planItem) => itemsById.get(planItem.shoppingItemId))
    .filter((item): item is ShoppingItem => Boolean(item && !item.checked))
}

export default function DayListView({
  items,
  mealPlans,
  onToggle,
  onRemove,
  onEditMealPlan,
}: DayListViewProps) {
  const itemsById = new Map(items.map((item) => [item.id, item]))

  // Every shopping item referenced by any meal plan is shown under its plan's
  // day(s); everything else falls into "Bez dnia".
  const referenced = new Set<string>()
  for (const plan of mealPlans) {
    for (const planItem of plan.items) referenced.add(planItem.shoppingItemId)
  }
  const withoutDay = items.filter((item) => !referenced.has(item.id))

  function renderDay(day: Weekday, label: string) {
    const dayPlans = mealPlans
      .filter((plan) => plan.days.includes(day))
      .map((plan) => ({ plan, items: getPlanItems(plan, itemsById) }))
      .filter(({ items: planItems }) => planItems.length > 0)

    if (dayPlans.length === 0) return null

    return (
      <section key={day} className="mb-2">
        <div className="flex items-center gap-2 border-l-[3px] border-fresh-violetLight bg-fresh-violetLight/10 px-4 py-2.5 dark:border-fresh-blue dark:bg-fresh-blue/10">
          <CalendarDays size={17} className="text-fresh-violetLight dark:text-fresh-blue" aria-hidden="true" />
          <h2 className="font-brand text-[15px] font-bold text-fresh-violetLight dark:text-fresh-blue">{label}</h2>
        </div>

        {dayPlans.map(({ plan, items: planItems }) => (
          <div key={plan.id} className="border-b border-market-lightBorder dark:border-white/[0.04]">
            <button
              type="button"
              onClick={() => onEditMealPlan(plan)}
              className="flex min-h-12 w-full items-center gap-2 bg-market-lightRaised px-4 py-2 text-left transition-colors hover:bg-[#e8dfcf] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-fresh-violetLight dark:bg-market-surface dark:hover:bg-market-raised dark:focus:ring-fresh-green"
            >
              <span className="text-lg">{plan.emoji}</span>
              <span className="flex-1 text-sm font-bold text-market-lightText dark:text-market-text">
                {plan.name}
              </span>
              <span className="text-xs font-bold text-market-lightMuted dark:text-market-muted">{planItems.length}</span>
              <ChevronRight size={17} className="text-market-lightMuted dark:text-market-muted" aria-hidden="true" />
            </button>
            <div className="bg-market-lightSurface dark:bg-market-bg">
              {planItems.map((item) => (
                <ProductItem
                  key={`${day}-${plan.id}-${item.id}`}
                  item={item}
                  onToggle={onToggle}
                  onRemove={onRemove}
                />
              ))}
            </div>
          </div>
        ))}
      </section>
    )
  }

  return (
    <>
      {WEEKDAYS.map((day) => renderDay(day.id, day.label))}
      {withoutDay.length > 0 && (
        <section className="mb-2">
          <div className="flex items-center gap-2 border-l-[3px] border-stone-400 bg-stone-100 px-4 py-2.5 dark:border-stone-300 dark:bg-stone-400/[0.08]">
            <Circle size={13} className="text-stone-600 dark:text-stone-300" aria-hidden="true" />
            <h2 className="font-brand text-[15px] font-bold text-stone-700 dark:text-stone-300">Bez dnia</h2>
          </div>
          <div className="bg-market-lightSurface dark:bg-market-bg">
            {withoutDay.map((item) => (
              <ProductItem
                key={`without-day-${item.id}`}
                item={item}
                onToggle={onToggle}
                onRemove={onRemove}
              />
            ))}
          </div>
        </section>
      )}
    </>
  )
}
