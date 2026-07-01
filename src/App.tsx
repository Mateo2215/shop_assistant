import { useState } from 'react'
import type {
  ActiveTab,
  HistoryEntry,
  MealPlan,
  ShoppingItem,
  ShoppingListView,
  Template,
  Weekday,
} from './types'
import { useShoppingList } from './hooks/useShoppingList'
import { useProducts } from './hooks/useProducts'
import { useTemplates } from './hooks/useTemplates'
import { useHistory } from './hooks/useHistory'
import { useSuggestions } from './hooks/useSuggestions'
import { useTheme } from './hooks/useTheme'
import { useMealPlans } from './hooks/useMealPlans'
import Header from './components/Header'
import AddProduct from './components/AddProduct'
import ShoppingList from './components/ShoppingList'
import Suggestions from './components/Suggestions'
import Templates from './components/Templates'
import History from './components/History'
import Statistics from './components/Statistics'
import BottomNav from './components/BottomNav'
import DayPickerModal from './components/DayPickerModal'
import Jadlospis from './components/Jadlospis'

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('list')
  const [editingMealPlan, setEditingMealPlan] = useState<MealPlan | null>(null)
  const [listView, setListView] = useState<ShoppingListView>(() =>
    localStorage.getItem('zakupowo-list-view') === 'days' ? 'days' : 'categories'
  )
  const { isDark, toggleTheme } = useTheme()

  function handleListViewChange(view: ShoppingListView) {
    setListView(view)
    localStorage.setItem('zakupowo-list-view', view)
  }

  const {
    items,
    loading,
    error,
    addItem,
    toggleItem,
    markStandalone,
  } = useShoppingList()
  const { firestoreProducts, searchProducts, ensureProduct, recordPurchase, deleteProduct, dismissSuggestion, resetAllProducts } =
    useProducts()
  const { allTemplates, createTemplate, updateTemplate, deleteTemplate, recordTemplateUse, resetTemplateUseCounts } = useTemplates()
  const { history, saveToHistory, deleteEntry, clearHistory } = useHistory()
  const {
    activeMealPlans,
    planTemplate,
    updateMealPlanDays,
    removeMealPlan,
    markCooked,
    removeShoppingItem,
    removeCheckedItems,
  } = useMealPlans()
  const suggestions = useSuggestions(firestoreProducts, items)

  const checkedCount = items.filter((i) => i.checked).length

  // Add to list + save to products DB so it persists in autocomplete
  async function handleAddItem(
    name: string,
    category: Parameters<typeof addItem>[1],
    quantity?: string,
    unit?: string
  ) {
    const existing = items.find(
      (item) => !item.checked && item.name.toLocaleLowerCase('pl') === name.toLocaleLowerCase('pl')
    )

    if (existing) {
      await markStandalone(existing.id)
    } else {
      await addItem(name, category, quantity, unit)
    }
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
    await removeCheckedItems(checkedItems)
  }

  // Add all template items as standalone shopping-list entries.
  async function handleAddFromTemplate(template: Template) {
    for (const item of template.items) {
      await handleAddItem(item.name, item.category, item.quantity, item.unit)
    }
    recordTemplateUse(template.id).catch(console.error)
    setActiveTab('list')
  }

  async function handlePlanTemplate(template: Template, days: Weekday[]) {
    await planTemplate(template, days, items)
    Promise.all(
      template.items.map((item) => ensureProduct(item.name, item.category))
    ).catch(console.error)
    recordTemplateUse(template.id).catch(console.error)
    setActiveTab('jadlospis')
  }

  // Meal plans are independent of the list now — removing an item only takes it
  // off the shopping list; the planned meal keeps its own snapshot.
  async function handleRemoveItem(item: ShoppingItem) {
    await removeShoppingItem(item)
  }

  async function handleCook(plan: MealPlan) {
    await markCooked(plan)
  }

  async function handleSaveMealPlanDays(plan: MealPlan, days: Weekday[]) {
    await updateMealPlanDays(plan, days)
    setEditingMealPlan(null)
  }

  async function handleRemoveMealPlan(plan: MealPlan) {
    if (!confirm(`Usunąć plan „${plan.name}” i niepotrzebne już składniki?`)) return
    await removeMealPlan(plan, items)
    setEditingMealPlan(null)
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
    <div className="relative mx-auto flex min-h-screen max-w-lg flex-col overflow-x-hidden bg-market-lightBg text-market-lightText shadow-[0_24px_60px_rgba(0,0,0,0.12)] dark:bg-market-bg dark:text-market-text">
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
            view={listView}
            onViewChange={handleListViewChange}
            mealPlans={activeMealPlans}
            onToggle={handleToggle}
            onRemove={handleRemoveItem}
            onEditMealPlan={setEditingMealPlan}
          />
        </>
      )}

      {activeTab === 'templates' && (
        <Templates
          templates={allTemplates}
          mealPlans={activeMealPlans}
          onAddFromTemplate={handleAddFromTemplate}
          onPlanTemplate={handlePlanTemplate}
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

      {activeTab === 'jadlospis' && (
        <Jadlospis
          mealPlans={activeMealPlans}
          items={items}
          onCook={handleCook}
          onEditMealPlan={setEditingMealPlan}
        />
      )}

      <BottomNav active={activeTab} onChange={setActiveTab} />

      {editingMealPlan && (
        <DayPickerModal
          key={editingMealPlan.id}
          title={`${editingMealPlan.emoji} ${editingMealPlan.name}`}
          description="Zmiana dotyczy całego posiłku i wszystkich jego składników."
          selectedDays={editingMealPlan.days}
          allowEmpty={false}
          saveLabel="Zapisz plan"
          deleteLabel="Usuń plan"
          onSave={(days) => handleSaveMealPlanDays(editingMealPlan, days)}
          onDelete={() => handleRemoveMealPlan(editingMealPlan)}
          onClose={() => setEditingMealPlan(null)}
        />
      )}
    </div>
  )
}
