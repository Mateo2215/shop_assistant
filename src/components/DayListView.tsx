// Renders unchecked shopping items grouped by weekday and meal plan.
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
        <div className="flex items-center gap-2 bg-indigo-50 px-4 py-2 dark:bg-indigo-500/10">
          <span aria-hidden="true">📅</span>
          <h2 className="text-sm font-bold text-indigo-700 dark:text-indigo-300">{label}</h2>
        </div>

        {dayPlans.map(({ plan, items: planItems }) => (
          <div key={plan.id} className="border-b border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => onEditMealPlan(plan)}
              className="flex min-h-11 w-full items-center gap-2 bg-slate-50 px-4 py-2 text-left transition-colors hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 dark:bg-slate-800/70 dark:hover:bg-slate-800"
            >
              <span className="text-lg">{plan.emoji}</span>
              <span className="flex-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
                {plan.name}
              </span>
              <span className="text-xs text-slate-400">{planItems.length}</span>
              <span className="text-slate-400" aria-hidden="true">›</span>
            </button>
            <div className="bg-white dark:bg-slate-900">
              {planItems.map((item) => renderProduct(item, `${day}-${plan.id}-${item.id}`))}
            </div>
          </div>
        ))}

        {otherItems.length > 0 && (
          <div>
            <div className="bg-slate-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:bg-slate-800/50 dark:text-slate-500">
              Inne produkty
            </div>
            <div className="bg-white dark:bg-slate-900">
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
          <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 dark:bg-slate-800/70">
            <span aria-hidden="true">○</span>
            <h2 className="text-sm font-bold text-slate-600 dark:text-slate-300">Bez dnia</h2>
          </div>
          <div className="bg-white dark:bg-slate-900">
            {withoutDay.map((item) => renderProduct(item, `without-day-${item.id}`))}
          </div>
        </section>
      )}
    </>
  )
}
