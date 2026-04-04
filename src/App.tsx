import { useState } from 'react'
import type { ActiveTab, Template, HistoryEntry } from './types'
import { useShoppingList } from './hooks/useShoppingList'
import { useProducts } from './hooks/useProducts'
import { useTemplates } from './hooks/useTemplates'
import { useHistory } from './hooks/useHistory'
import { useSuggestions } from './hooks/useSuggestions'
import { useTheme } from './hooks/useTheme'
import Header from './components/Header'
import AddProduct from './components/AddProduct'
import ShoppingList from './components/ShoppingList'
import Suggestions from './components/Suggestions'
import Templates from './components/Templates'
import History from './components/History'
import Statistics from './components/Statistics'
import BottomNav from './components/BottomNav'

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('list')
  const { isDark, toggleTheme } = useTheme()

  const { items, loading, error, addItem, toggleItem, removeItem, clearChecked } =
    useShoppingList()
  const { firestoreProducts, searchProducts, ensureProduct, recordPurchase, deleteProduct, dismissSuggestion, resetAllProducts } =
    useProducts()
  const { allTemplates, createTemplate, updateTemplate, deleteTemplate, recordTemplateUse, resetTemplateUseCounts } = useTemplates()
  const { history, saveToHistory, deleteEntry, clearHistory } = useHistory()
  const suggestions = useSuggestions(firestoreProducts, items)

  const checkedCount = items.filter((i) => i.checked).length

  // Add to list + save to products DB so it persists in autocomplete
  async function handleAddItem(
    name: string,
    category: Parameters<typeof addItem>[1],
    quantity?: string,
    unit?: string
  ) {
    await addItem(name, category, quantity, unit)
    ensureProduct(name, category).catch(console.error)
  }

  // Toggle + record purchase when item is checked off
  async function handleToggle(id: string, checked: boolean) {
    await toggleItem(id, checked)
    if (checked) {
      const item = items.find((i) => i.id === id)
      if (item) recordPurchase(item.name, item.category).catch(console.error)
    }
  }

  // Save checked items to history, then remove from list
  async function handleClearChecked() {
    const checkedItems = items.filter((i) => i.checked)
    await saveToHistory(checkedItems)
    await clearChecked()
  }

  // Add all template items to list, skip duplicates, record template usage
  async function handleAddFromTemplate(template: Template) {
    const existingNames = new Set(
      items.filter((i) => !i.checked).map((i) => i.name.toLowerCase())
    )
    for (const item of template.items) {
      if (!existingNames.has(item.name.toLowerCase())) {
        await handleAddItem(item.name, item.category, item.quantity, item.unit)
      }
    }
    recordTemplateUse(template.id).catch(console.error)
    setActiveTab('list')
  }

  async function handleResetStatistics() {
    await Promise.all([resetAllProducts(), resetTemplateUseCounts(), clearHistory()])
  }

  // Re-add all items from a history entry, skip duplicates
  async function handleRepeatHistory(historyItems: HistoryEntry['items']) {
    const existingNames = new Set(
      items.filter((i) => !i.checked).map((i) => i.name.toLowerCase())
    )
    for (const item of historyItems) {
      if (!existingNames.has(item.name.toLowerCase())) {
        await handleAddItem(item.name, item.category, item.quantity, item.unit)
      }
    }
    setActiveTab('list')
  }

  return (
    <div className="min-h-screen flex flex-col max-w-lg mx-auto relative bg-slate-50 dark:bg-slate-950">
      <Header
        checkedCount={checkedCount}
        onClearChecked={handleClearChecked}
        isDark={isDark}
        onToggleTheme={toggleTheme}
      />

      {activeTab === 'list' && (
        <>
          <AddProduct
            onAdd={handleAddItem}
            searchProducts={searchProducts}
            onDeleteProduct={deleteProduct}
          />
          <Suggestions suggestions={suggestions} onAdd={handleAddItem} onDismiss={dismissSuggestion} />
          <ShoppingList
            items={items}
            loading={loading}
            error={error}
            onToggle={handleToggle}
            onRemove={removeItem}
          />
        </>
      )}

      {activeTab === 'templates' && (
        <Templates
          templates={allTemplates}
          onAddFromTemplate={handleAddFromTemplate}
          onCreateTemplate={createTemplate}
          onUpdateTemplate={updateTemplate}
          onDeleteTemplate={deleteTemplate}
        />
      )}

      {activeTab === 'historia' && (
        <History
          history={history}
          onRepeat={handleRepeatHistory}
          onDelete={deleteEntry}
        />
      )}

      {activeTab === 'statystyki' && (
        <Statistics
          firestoreProducts={firestoreProducts}
          history={history}
          allTemplates={allTemplates}
          onReset={handleResetStatistics}
        />
      )}

      {activeTab === 'gazetka' && (
        <div className="flex flex-col items-center justify-center py-20 gap-5 px-6">
          <div className="text-5xl">🗞️</div>
          <div className="text-center">
            <p className="text-lg font-medium text-slate-900 dark:text-slate-100">Gazetka Kaufland</p>
            <p className="text-sm text-slate-500 mt-1">Aktualne promocje i oferty</p>
          </div>
          <a
            href="https://www.kaufland.pl/oferta/gazetka.html"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-red-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-red-500 active:bg-red-700 transition-colors shadow-sm"
          >
            Otwórz gazetkę →
          </a>
        </div>
      )}

      <BottomNav active={activeTab} onChange={setActiveTab} />
    </div>
  )
}
