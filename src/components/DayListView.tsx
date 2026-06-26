// Renders unchecked shopping items grouped by weekday and meal plan.
import { CalendarDays, ChevronRight, Circle } from 'lucide-react'
import { WEEKDAYS, getEffectiveDays } from '../data/weekdays'
import type { MealPlan, ShoppingItem, Weekday } from '../types'
import ProductItem from './ProductItem'

interface DayListViewProps {
  items: ShoppingItem[]
  mealPlans: MealPlan[]
  onToggle: (id: string, checked: boolean) => void
  onRemove: (item: ShoppingItem) => void
  onEditDays: (item: ShoppingItem) => void
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
  onEditDays,
  onEditMealPlan,
}: DayListViewProps) {
  const itemsById = new Map(items.map((item) => [item.id, item]))
  const effectiveDays = new Map(
    items.map((item) => [item.id, getEffectiveDays(item, mealPlans)])
  )

  function renderProduct(item: ShoppingItem, key: string) {
    return (
      <ProductItem
        key={key}
        item={item}
        days={effectiveDays.get(item.id) ?? []}
        showDayTags={false}
        onToggle={onToggle}
        onRemove={onRemove}
        onEditDays={onEditDays}
      />
    )
  }

  function renderDay(day: Weekday, label: string) {
    const dayPlans = mealPlans
      .filter((plan) => plan.days.includes(day))
      .map((plan) => ({ plan, items: getPlanItems(plan, itemsById) }))
      .filter(({ items: planItems }) => planItems.length > 0)
    const dayPlanIds = new Set(dayPlans.map(({ plan }) => plan.id))
    const otherItems = items.filter(
      (item) =>
        effectiveDays.get(item.id)?.includes(day) &&
        !item.mealPlanIds.some((planId) => dayPlanIds.has(planId))
    )

    if (dayPlans.length === 0 && otherItems.length === 0) return null

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
              {planItems.map((item) => renderProduct(item, `${day}-${plan.id}-${item.id}`))}
            </div>
          </div>
        ))}

        {otherItems.length > 0 && (
          <div>
            <div className="bg-market-lightRaised px-4 py-2 font-brand text-[11px] font-bold uppercase tracking-[0.1em] text-market-lightMuted dark:bg-market-surface dark:text-market-muted">
              Inne produkty
            </div>
            <div className="bg-market-lightSurface dark:bg-market-bg">
              {otherItems.map((item) => renderProduct(item, `${day}-other-${item.id}`))}
            </div>
          </div>
        )}
      </section>
    )
  }

  const withoutDay = items.filter((item) => (effectiveDays.get(item.id) ?? []).length === 0)

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
            {withoutDay.map((item) => renderProduct(item, `without-day-${item.id}`))}
          </div>
        </section>
      )}
    </>
  )
}
