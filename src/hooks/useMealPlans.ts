// Manages meal plans and atomic updates shared with shopping-list items.
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  writeBatch,
  type WriteBatch,
} from 'firebase/firestore'
import { db, HOUSEHOLD_ID } from '../firebase'
import { parseWeekdays, sortWeekdays } from '../data/weekdays'
import type {
  MealPlan,
  MealPlanItem,
  ShoppingItem,
  Template,
  TemplateItem,
  Weekday,
} from '../types'

const shoppingListPath = ['households', HOUSEHOLD_ID, 'shoppingList'] as const
const mealPlansPath = ['households', HOUSEHOLD_ID, 'mealPlans'] as const

// A meal plan stays on the menu for this long after its last edit; older plans
// are auto-expired client-side so forgotten meals never pile up (no server/cron).
const MEAL_PLAN_TTL_DAYS = 7
const MEAL_PLAN_TTL_MS = MEAL_PLAN_TTL_DAYS * 24 * 60 * 60 * 1000

function isMealPlanActive(plan: MealPlan, now: number): boolean {
  return now - plan.updatedAt.getTime() < MEAL_PLAN_TTL_MS
}

function normalizeName(name: string): string {
  return name.trim().toLocaleLowerCase('pl')
}

function docToMealPlan(id: string, data: Record<string, unknown>): MealPlan {
  const timestamp = data.createdAt as Timestamp | undefined
  const updatedTimestamp = data.updatedAt as Timestamp | undefined

  return {
    id,
    templateId: (data.templateId as string) ?? id,
    name: (data.name as string) ?? 'Posiłek',
    emoji: (data.emoji as string) ?? '🍽️',
    days: parseWeekdays(data.days),
    items: Array.isArray(data.items) ? (data.items as MealPlanItem[]) : [],
    createdAt: timestamp?.toDate() ?? new Date(),
    updatedAt: updatedTimestamp?.toDate() ?? new Date(),
  }
}

function buildNewPlanItems(
  batch: WriteBatch,
  planId: string,
  templateItems: TemplateItem[],
  currentItems: ShoppingItem[]
): MealPlanItem[] {
  const activeByName = new Map(
    currentItems
      .filter((item) => !item.checked)
      .map((item) => [normalizeName(item.name), item])
  )
  const plannedNames = new Set<string>()
  const planItems: MealPlanItem[] = []

  for (const templateItem of templateItems) {
    const normalizedName = normalizeName(templateItem.name)
    if (plannedNames.has(normalizedName)) continue
    plannedNames.add(normalizedName)

    const existing = activeByName.get(normalizedName)
    const itemRef = existing
      ? doc(db, ...shoppingListPath, existing.id)
      : doc(collection(db, ...shoppingListPath))

    if (existing) {
      batch.update(itemRef, {
        mealPlanIds: arrayUnion(planId),
        updatedAt: serverTimestamp(),
      })
    } else {
      batch.set(itemRef, {
        name: templateItem.name,
        category: templateItem.category,
        quantity: templateItem.quantity ?? null,
        unit: templateItem.unit ?? null,
        checked: false,
        manualDays: [],
        mealPlanIds: [planId],
        isStandalone: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    }

    planItems.push({ ...templateItem, shoppingItemId: itemRef.id })
  }

  return planItems
}

export function useMealPlans() {
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // Ids we already issued a delete for, so we don't re-fire on every snapshot.
  const expiredCleanupRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    const ref = collection(db, ...mealPlansPath)
    const unsubscribe = onSnapshot(
      ref,
      (snapshot) => {
        const plans = snapshot.docs.map((entry) =>
          docToMealPlan(entry.id, entry.data() as Record<string, unknown>)
        )
        setMealPlans(plans)
        setLoading(false)
        setError(null)

        // Best-effort lazy cleanup of expired plans (no server/cron). Idempotent.
        const now = Date.now()
        for (const plan of plans) {
          if (isMealPlanActive(plan, now)) continue
          if (expiredCleanupRef.current.has(plan.id)) continue
          expiredCleanupRef.current.add(plan.id)
          deleteDoc(doc(db, ...mealPlansPath, plan.id)).catch((cleanupError) =>
            console.error('Expired meal plan cleanup failed:', cleanupError)
          )
        }
      },
      (snapshotError) => {
        console.error('Meal plans Firestore error:', snapshotError)
        setError('Nie udało się wczytać planów posiłków.')
        setLoading(false)
      }
    )

    return unsubscribe
  }, [])

  // Only non-expired plans are shown on the menu; expired ones are filtered out
  // immediately (the lazy delete above removes them from Firestore in the background).
  const activeMealPlans = useMemo(() => {
    const now = Date.now()
    return mealPlans.filter((plan) => isMealPlanActive(plan, now))
  }, [mealPlans])

  async function planTemplate(
    template: Template,
    days: Weekday[],
    currentItems: ShoppingItem[]
  ) {
    if (days.length === 0) throw new Error('Meal plan requires at least one weekday.')

    const existingPlan = mealPlans.find((plan) => plan.templateId === template.id)
    const batch = writeBatch(db)

    if (existingPlan) {
      const planRef = doc(db, ...mealPlansPath, existingPlan.id)
      batch.update(planRef, {
        days: sortWeekdays([...existingPlan.days, ...days]),
        updatedAt: serverTimestamp(),
      })
    } else {
      const planRef = doc(db, ...mealPlansPath, template.id)
      const planItems = buildNewPlanItems(
        batch,
        planRef.id,
        template.items,
        currentItems
      )
      batch.set(planRef, {
        templateId: template.id,
        name: template.name,
        emoji: template.emoji,
        days: sortWeekdays(days),
        items: planItems,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    }

    await batch.commit()
  }

  async function updateMealPlanDays(plan: MealPlan, days: Weekday[]) {
    if (days.length === 0) throw new Error('Meal plan requires at least one weekday.')

    const batch = writeBatch(db)
    batch.update(doc(db, ...mealPlansPath, plan.id), {
      days: sortWeekdays(days),
      updatedAt: serverTimestamp(),
    })
    await batch.commit()
  }

  // Explicit "Usuń plan" from the day editor: drop the meal and the ingredients it
  // brought that nothing else keeps on the list (user-added standalone items stay).
  async function removeMealPlan(plan: MealPlan, currentItems: ShoppingItem[]) {
    const batch = writeBatch(db)
    const linkedItems = currentItems.filter((item) => item.mealPlanIds.includes(plan.id))

    for (const item of linkedItems) {
      const remainingPlanIds = item.mealPlanIds.filter((id) => id !== plan.id)
      const itemRef = doc(db, ...shoppingListPath, item.id)

      if (!item.isStandalone && remainingPlanIds.length === 0) {
        batch.delete(itemRef)
      } else {
        batch.update(itemRef, {
          mealPlanIds: remainingPlanIds,
          updatedAt: serverTimestamp(),
        })
      }
    }

    batch.delete(doc(db, ...mealPlansPath, plan.id))
    await batch.commit()
  }

  // "Ugotowane": the meal leaves the menu. Shopping items are independent now,
  // so they are left untouched (already bought / cleared on their own).
  async function markCooked(plan: MealPlan) {
    await deleteDoc(doc(db, ...mealPlansPath, plan.id))
  }

  // Clearing the shopping list no longer touches meal plans — the menu survives
  // shopping. Plans keep their own item snapshot for display and status.
  async function removeShoppingItem(item: ShoppingItem) {
    await deleteDoc(doc(db, ...shoppingListPath, item.id))
  }

  async function removeCheckedItems(items: ShoppingItem[]) {
    if (items.length === 0) return

    const batch = writeBatch(db)
    for (const item of items) {
      batch.delete(doc(db, ...shoppingListPath, item.id))
    }
    await batch.commit()
  }

  return {
    mealPlans,
    activeMealPlans,
    loading,
    error,
    planTemplate,
    updateMealPlanDays,
    removeMealPlan,
    markCooked,
    removeShoppingItem,
    removeCheckedItems,
  }
}
