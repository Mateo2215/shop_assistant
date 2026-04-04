import { useState, useEffect } from 'react'
import {
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  orderBy,
  query,
  limit,
  Timestamp,
  writeBatch,
} from 'firebase/firestore'
import { db, HOUSEHOLD_ID } from '../firebase'
import type { HistoryEntry, ShoppingItem } from '../types'

export function useHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([])

  useEffect(() => {
    const ref = collection(db, 'households', HOUSEHOLD_ID, 'history')
    const q = query(ref, orderBy('date', 'desc'), limit(30))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const entries = snapshot.docs.map((d) => ({
        id: d.id,
        date: (d.data().date as Timestamp).toDate(),
        items: d.data().items as HistoryEntry['items'],
      }))
      setHistory(entries)
    })
    return unsubscribe
  }, [])

  async function saveToHistory(items: ShoppingItem[]) {
    if (items.length === 0) return
    const ref = collection(db, 'households', HOUSEHOLD_ID, 'history')
    await addDoc(ref, {
      date: new Date(),
      items: items.map((i) => ({
        name: i.name,
        quantity: i.quantity ?? null,
        unit: i.unit ?? null,
        category: i.category,
      })),
    })
  }

  async function deleteEntry(id: string) {
    const ref = doc(db, 'households', HOUSEHOLD_ID, 'history', id)
    await deleteDoc(ref)
  }

  async function clearHistory() {
    const batch = writeBatch(db)
    for (const entry of history) {
      batch.delete(doc(db, 'households', HOUSEHOLD_ID, 'history', entry.id))
    }
    await batch.commit()
  }

  return { history, saveToHistory, deleteEntry, clearHistory }
}
