import { useState, useEffect } from 'react'
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  increment,
  Timestamp,
  writeBatch,
} from 'firebase/firestore'
import { db, HOUSEHOLD_ID } from '../firebase'
import type { Product, CategoryId } from '../types'
import { DEFAULT_PRODUCTS, type DefaultProduct } from '../data/defaultProducts'

export interface SuggestionProduct extends DefaultProduct {
  isCustom: boolean // true = stored in Firestore, can be deleted
}

export function useProducts() {
  const [firestoreProducts, setFirestoreProducts] = useState<Product[]>([])

  useEffect(() => {
    const ref = collection(db, 'households', HOUSEHOLD_ID, 'products')
    const unsubscribe = onSnapshot(ref, (snapshot) => {
      const products = snapshot.docs.map((d) => ({
        id: d.id,
        name: d.data().name as string,
        category: d.data().category as CategoryId,
        purchaseCount: (d.data().purchaseCount as number) ?? 0,
        lastPurchased: (d.data().lastPurchased as Timestamp)?.toDate() ?? null,
      }))
      setFirestoreProducts(products)
    })
    return unsubscribe
  }, [])

  function searchProducts(query: string): SuggestionProduct[] {
    if (query.trim().length < 1) return []
    const lower = query.toLowerCase()

    const firestoreNames = new Set(firestoreProducts.map((p) => p.name.toLowerCase()))

    // Firestore products first (user's own, sorted by usage), then defaults not yet in Firestore
    const results: SuggestionProduct[] = [
      ...firestoreProducts
        .sort((a, b) => b.purchaseCount - a.purchaseCount)
        .map((p) => ({ name: p.name, category: p.category, isCustom: true })),
      ...DEFAULT_PRODUCTS
        .filter((p) => !firestoreNames.has(p.name.toLowerCase()))
        .map((p) => ({ ...p, isCustom: false })),
    ]

    return results.filter((p) => p.name.toLowerCase().includes(lower)).slice(0, 7)
  }

  // Save product to DB when added to shopping list (so it persists in autocomplete)
  async function ensureProduct(name: string, category: CategoryId) {
    const id = name.toLowerCase().trim().replace(/\//g, '-')
    const ref = doc(db, 'households', HOUSEHOLD_ID, 'products', id)
    // merge: true — doesn't reset purchaseCount if product already exists
    await setDoc(ref, { name, category }, { merge: true })
  }

  // Increment purchase count when item is checked off
  async function recordPurchase(name: string, category: CategoryId) {
    const id = name.toLowerCase().trim().replace(/\//g, '-')
    const ref = doc(db, 'households', HOUSEHOLD_ID, 'products', id)
    await setDoc(ref, { name, category, purchaseCount: increment(1), lastPurchased: new Date() }, { merge: true })
  }

  // Remove product from autocomplete DB
  async function deleteProduct(name: string) {
    const id = name.toLowerCase().trim().replace(/\//g, '-')
    const ref = doc(db, 'households', HOUSEHOLD_ID, 'products', id)
    await deleteDoc(ref)
  }

  // Reset purchase count so the product disappears from suggestions until bought 5 more times
  async function dismissSuggestion(name: string) {
    const id = name.toLowerCase().trim().replace(/\//g, '-')
    const ref = doc(db, 'households', HOUSEHOLD_ID, 'products', id)
    await setDoc(ref, { purchaseCount: 0 }, { merge: true })
  }

  async function resetAllProducts() {
    const batch = writeBatch(db)
    for (const p of firestoreProducts) {
      batch.update(doc(db, 'households', HOUSEHOLD_ID, 'products', p.id), { purchaseCount: 0 })
    }
    await batch.commit()
  }

  return { firestoreProducts, searchProducts, ensureProduct, recordPurchase, deleteProduct, dismissSuggestion, resetAllProducts }
}
