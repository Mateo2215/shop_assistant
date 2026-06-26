import { useState, useEffect } from 'react'
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import { db, HOUSEHOLD_ID } from '../firebase'
import { parseWeekdays } from '../data/weekdays'
import type { ShoppingItem, CategoryId, Weekday } from '../types'

function docToItem(id: string, data: Record<string, unknown>): ShoppingItem {
  return {
    id,
    name: data.name as string,
    quantity: (data.quantity as string) || undefined,
    unit: (data.unit as string) || undefined,
    category: data.category as CategoryId,
    checked: data.checked as boolean,
    manualDays: parseWeekdays(data.manualDays),
    mealPlanIds: Array.isArray(data.mealPlanIds)
      ? data.mealPlanIds.filter((value): value is string => typeof value === 'string')
      : [],
    isStandalone: typeof data.isStandalone === 'boolean' ? data.isStandalone : true,
    createdAt: (data.createdAt as Timestamp)?.toDate() ?? new Date(),
    updatedAt: (data.updatedAt as Timestamp)?.toDate() ?? new Date(),
  }
}

export function useShoppingList() {
  const [items, setItems] = useState<ShoppingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const listRef = collection(db, 'households', HOUSEHOLD_ID, 'shoppingList')
    const q = query(listRef, orderBy('createdAt', 'asc'))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const newItems = snapshot.docs.map((d) =>
          docToItem(d.id, d.data() as Record<string, unknown>)
        )
        setItems(newItems)
        setLoading(false)
        setError(null)
      },
      (err) => {
        console.error('Firestore error:', err)
        setError('Błąd połączenia z bazą danych.')
        setLoading(false)
      }
    )

    return unsubscribe
  }, [])

  async function addItem(name: string, category: CategoryId, quantity?: string, unit?: string) {
    const listRef = collection(db, 'households', HOUSEHOLD_ID, 'shoppingList')
    await addDoc(listRef, {
      name,
      category,
      quantity: quantity ?? null,
      unit: unit ?? null,
      checked: false,
      manualDays: [],
      mealPlanIds: [],
      isStandalone: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  }

  async function toggleItem(id: string, checked: boolean) {
    const itemRef = doc(db, 'households', HOUSEHOLD_ID, 'shoppingList', id)
    await updateDoc(itemRef, { checked, updatedAt: serverTimestamp() })
  }

  async function updateManualDays(id: string, manualDays: Weekday[]) {
    const itemRef = doc(db, 'households', HOUSEHOLD_ID, 'shoppingList', id)
    await updateDoc(itemRef, { manualDays, updatedAt: serverTimestamp() })
  }

  async function markStandalone(id: string) {
    const itemRef = doc(db, 'households', HOUSEHOLD_ID, 'shoppingList', id)
    await updateDoc(itemRef, { isStandalone: true, updatedAt: serverTimestamp() })
  }

  return {
    items,
    loading,
    error,
    addItem,
    toggleItem,
    updateManualDays,
    markStandalone,
  }
}
