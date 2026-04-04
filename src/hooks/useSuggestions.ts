import { useMemo } from 'react'
import type { Product, ShoppingItem, CategoryId } from '../types'

interface Suggestion {
  name: string
  category: CategoryId
}

// Returns products bought before that are NOT on the current list,
// sorted by purchase frequency (most bought first).
export function useSuggestions(
  firestoreProducts: Product[],
  currentItems: ShoppingItem[]
): Suggestion[] {
  return useMemo(() => {
    const currentNames = new Set(currentItems.map((i) => i.name.toLowerCase()))

    return firestoreProducts
      .filter((p) => p.purchaseCount >= 5 && !currentNames.has(p.name.toLowerCase()))
      .sort((a, b) => b.purchaseCount - a.purchaseCount)
      .slice(0, 8)
      .map((p) => ({ name: p.name, category: p.category }))
  }, [firestoreProducts, currentItems])
}
