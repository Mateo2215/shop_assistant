// Persistent weekly menu: meal plans grouped by weekday, surviving the shopping run.
import { CalendarDays, ChefHat, Check, ShoppingCart, UtensilsCrossed } from 'lucide-react'
import { WEEKDAYS } from '../data/weekdays'
import { getCategory } from '../data/categories'
import type { MealPlan, MealPlanItem, ShoppingItem, Weekday } from '../types'

interface JadlospisProps {
  mealPlans: MealPlan[]
  items: ShoppingItem[]
  onCook: (plan: MealPlan) => void
  onEditMealPlan: (plan: MealPlan) => void
}

type PlanStatus = 'shopping' | 'cooking'

// "Do kupienia" while any linked item is still on the list unchecked; otherwise the
// ingredients are bought (checked or already cleared) → "Do ugotowania".
function getPlanStatus(plan: MealPlan, itemsById: Map<string, ShoppingItem>): PlanStatus {
  const stillToBuy = plan.items.some((planItem) => {
    const item = itemsById.get(planItem.shoppingItemId)
    return Boolean(item && !item.checked)
  })
  return stillToBuy ? 'shopping' : 'cooking'
}

function isItemBought(planItem: MealPlanItem, itemsById: Map<string, ShoppingItem>): boolean {
  const item = itemsById.get(planItem.shoppingItemId)
  return !item || item.checked
}

export default function Jadlospis({ mealPlans, items, onCook, onEditMealPlan }: JadlospisProps) {
  const itemsById = new Map(items.map((item) => [item.id, item]))

  function renderPlan(plan: MealPlan, dayKey: string) {
    const status = getPlanStatus(plan, itemsById)
    const cooking = status === 'cooking'

    return (
      <div
        key={`${dayKey}-${plan.id}`}
        className="border-b border-market-lightBorder dark:border-white/[0.04]"
      >
        <button
          type="button"
          onClick={() => onEditMealPlan(plan)}
          className="flex min-h-12 w-full items-center gap-2 bg-market-lightRaised px-4 py-2.5 text-left transition-colors hover:bg-[#e8dfcf] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-fresh-violetLight dark:bg-market-surface dark:hover:bg-market-raised dark:focus:ring-fresh-green"
        >
          <span className="text-lg">{plan.emoji}</span>
          <span className="flex-1 truncate text-sm font-bold text-market-lightText dark:text-market-text">
            {plan.name}
          </span>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${
              cooking
                ? 'bg-fresh-greenStrong/10 text-fresh-greenStrong dark:bg-fresh-green/15 dark:text-fresh-green'
                : 'bg-amber-400/15 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300'
            }`}
          >
            {cooking ? <ChefHat size={13} aria-hidden="true" /> : <ShoppingCart size={13} aria-hidden="true" />}
            {cooking ? 'Do ugotowania' : 'Do kupienia'}
          </span>
        </button>

        <ul className="bg-market-lightSurface dark:bg-market-bg">
          {plan.items.map((planItem, index) => {
            const bought = isItemBought(planItem, itemsById)
            const category = getCategory(planItem.category)
            return (
              <li
                key={`${plan.id}-${planItem.shoppingItemId}-${index}`}
                className="flex items-center gap-3 border-b border-market-lightBorder px-4 py-2.5 last:border-0 dark:border-white/[0.04]"
              >
                <span
                  className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-white ${
                    bought
                      ? 'bg-fresh-greenStrong dark:bg-fresh-green'
                      : 'border-2 border-[#c8c1b0] bg-transparent dark:border-[#56655a]'
                  }`}
                  aria-label={bought ? 'Kupione' : 'Do kupienia'}
                >
                  {bought && <Check size={12} strokeWidth={3} />}
                </span>
                <span
                  className={`min-w-0 flex-1 text-[15px] font-semibold ${
                    bought
                      ? 'text-market-lightSubtle dark:text-market-subtle'
                      : 'text-market-lightText dark:text-market-text'
                  }`}
                >
                  {planItem.name}
                  {planItem.quantity && (
                    <span className="ml-1.5 text-sm font-medium text-market-lightMuted dark:text-market-muted">
                      {planItem.quantity}
                      {planItem.unit ? ` ${planItem.unit}` : ''}
                    </span>
                  )}
                </span>
                <span className="text-base flex-shrink-0" title={category.name}>
                  {category.emoji}
                </span>
              </li>
            )
          })}
        </ul>

        <div className="bg-market-lightSurface px-4 py-2.5 dark:bg-market-bg">
          <button
            type="button"
            onClick={() => onCook(plan)}
            className="inline-flex min-h-10 items-center gap-2 rounded-[12px] bg-fresh-greenStrong/10 px-4 text-[13.5px] font-bold text-fresh-greenStrong transition-colors hover:bg-fresh-greenStrong/20 focus:outline-none focus:ring-2 focus:ring-fresh-greenStrong dark:bg-fresh-green/10 dark:text-fresh-green dark:hover:bg-fresh-green/20"
          >
            <ChefHat size={16} aria-hidden="true" />
            Ugotowane
          </button>
        </div>
      </div>
    )
  }

  function renderDay(day: Weekday, label: string) {
    const dayPlans = mealPlans.filter((plan) => plan.days.includes(day))
    if (dayPlans.length === 0) return null

    return (
      <section key={day} className="mb-2">
        <div className="flex items-center gap-2 border-l-[3px] border-fresh-violetLight bg-fresh-violetLight/10 px-4 py-2.5 dark:border-fresh-blue dark:bg-fresh-blue/10">
          <CalendarDays size={17} className="text-fresh-violetLight dark:text-fresh-blue" aria-hidden="true" />
          <h2 className="font-brand text-[15px] font-bold text-fresh-violetLight dark:text-fresh-blue">{label}</h2>
          <span className="ml-auto rounded-full bg-fresh-violetLight/10 px-2 py-0.5 text-xs font-bold text-fresh-violetLight dark:bg-fresh-blue/15 dark:text-fresh-blue">
            {dayPlans.length}
          </span>
        </div>
        {dayPlans.map((plan) => renderPlan(plan, day))}
      </section>
    )
  }

  if (mealPlans.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center text-market-lightMuted dark:text-market-muted">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-fresh-greenStrong/10 text-fresh-greenStrong dark:bg-fresh-green/10 dark:text-fresh-green">
          <UtensilsCrossed size={34} />
        </div>
        <p className="font-brand text-lg font-bold text-market-lightText dark:text-market-text">Jadłospis jest pusty</p>
        <p className="mt-1 text-sm">Zaplanuj posiłek w zakładce Szablony — pojawi się tutaj na wybrane dni.</p>
      </div>
    )
  }

  return <div className="pb-28">{WEEKDAYS.map((day) => renderDay(day.id, day.label))}</div>
}
