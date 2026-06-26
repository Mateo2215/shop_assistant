// Manages meal plans and atomic updates shared with shopping-list items.
import { useEffect, useState } from 'react'
import {
  arrayUnion,
  collection,
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

function shouldDeleteOrphan(item: ShoppingItem, remainingPlanIds: string[]): boolean {
  return !item.isStandalone && item.manualDays.length === 0 && remainingPlanIds.length === 0
}

function removeItemsFromPlans(
  batch: WriteBatch,
  removedItemIds: Set<string>,
  mealPlans: MealPlan[]
) {
  for (const plan of mealPlans) {
    if (!plan.items.some((item) => removedItemIds.has(item.shoppingItemId))) continue

    const remainingItems = plan.items.filter(
      (item) => !removedItemIds.has(item.shoppingItemId)
    )
    const planRef = doc(db, ...mealPlansPath, plan.id)

    if (remainingItems.length === 0) {
      batch.delete(planRef)
    } else {
      batch.update(planRef, { items: remainingItems, updatedAt: serverTimestamp() })
    }
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

  useEffect(() => {
    const ref = collection(db, ...mealPlansPath)
    const unsubscribe = onSnapshot(
      ref,
      (snapshot) => {
        setMealPlans(
          snapshot.docs.map((entry) =>
            docToMealPlan(entry.id, entry.data() as Record<string, unknown>)
          )
        )
        setLoading(false)
        setError(null)
      },
      (snapshotError) => {
        console.error('Meal plans Firestore error:', snapshotError)
        setError('Nie udało się wczytać planów posiłków.')
        setLoading(false)
      }
    )

    return unsubscribe
  }, [])

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

  async function removeMealPlan(plan: MealPlan, currentItems: ShoppingItem[]) {
    const batch = writeBatch(db)
    const linkedItems = currentItems.filter((item) => item.mealPlanIds.includes(plan.id))

    for (const item of linkedItems) {
      const remainingPlanIds = item.mealPlanIds.filter((id) => id !== plan.id)
      const itemRef = doc(db, ...shoppingListPath, item.id)

      if (shouldDeleteOrphan(item, remainingPlanIds)) {
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

  async function removeShoppingItem(item: ShoppingItem) {
    const batch = writeBatch(db)
    removeItemsFromPlans(batch, new Set([item.id]), mealPlans)
    batch.delete(doc(db, ...shoppingListPath, item.id))
    await batch.commit()
  }

  async function removeCheckedItems(items: ShoppingItem[]) {
    if (items.length === 0) return

    const batch = writeBatch(db)
    const itemIds = new Set(items.map((item) => item.id))
    removeItemsFromPlans(batch, itemIds, mealPlans)

    for (const item of items) {
      batch.delete(doc(db, ...shoppingListPath, item.id))
    }

    await batch.commit()
  }

  return {
    mealPlans,
    loading,
    error,
    planTemplate,
    updateMealPlanDays,
    removeMealPlan,
    removeShoppingItem,
    removeCheckedItems,
  }
}
