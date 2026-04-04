import { useMemo } from 'react'
import type { Product, HistoryEntry, Template } from '../types'
import { getCategory } from '../data/categories'

export interface StatisticsData {
  totalSessions: number
  totalItems: number
  avgItemsPerSession: number
  uniqueProducts: number
  topProducts: { name: string; count: number }[]
  topCategories: { name: string; count: number; catId: string }[]
  topTemplates: { name: string; emoji: string; count: number }[]
  hasData: boolean
}

export function useStatistics(
  firestoreProducts: Product[],
  history: HistoryEntry[],
  allTemplates: Template[]
): StatisticsData {
  return useMemo(() => {
    const hasData = firestoreProducts.length > 0 || history.length > 0

    // KPI
    const totalSessions = history.length
    const totalItems = history.reduce((s, e) => s + e.items.length, 0)
    const avgItemsPerSession = totalSessions > 0
      ? Math.round(totalItems / totalSessions)
      : 0
    const uniqueProducts = firestoreProducts.filter((p) => p.purchaseCount > 0).length

    // Top products by purchase count
    const topProducts = [...firestoreProducts]
      .sort((a, b) => b.purchaseCount - a.purchaseCount)
      .slice(0, 8)
      .map((p) => ({ name: p.name, count: p.purchaseCount }))

    // Category distribution from history
    const catCounts: Record<string, number> = {}
    for (const entry of history) {
      for (const item of entry.items) {
        catCounts[item.category] = (catCounts[item.category] ?? 0) + 1
      }
    }
    const topCategories = Object.entries(catCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6)
      .map(([catId, count]) => {
        const cat = getCategory(catId)
        return { name: cat.emoji + ' ' + cat.name, count, catId }
      })

    // Top templates by useCount
    const topTemplates = [...allTemplates]
      .filter((t) => (t.useCount ?? 0) > 0)
      .sort((a, b) => (b.useCount ?? 0) - (a.useCount ?? 0))
      .slice(0, 5)
      .map((t) => ({ name: t.name, emoji: t.emoji, count: t.useCount ?? 0 }))

    return {
      totalSessions,
      totalItems,
      avgItemsPerSession,
      uniqueProducts,
      topProducts,
      topCategories,
      topTemplates,
      hasData,
    }
  }, [firestoreProducts, history, allTemplates])
}
