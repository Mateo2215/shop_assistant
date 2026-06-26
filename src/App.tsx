import { useEffect, useState } from 'react'
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
import { getInheritedDays } from './data/weekdays'
import Header from './components/Header'
import AddProduct from './components/AddProduct'
import ShoppingList from './components/ShoppingList'
import Suggestions from './components/Suggestions'
import Templates from './components/Templates'
import History from './components/History'
import Statistics from './components/Statistics'
import BottomNav from './components/BottomNav'
import DayPickerModal from './components/DayPickerModal'

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('list')
  const [listView, setListView] = useState<ShoppingListView>(() => {
    const saved = localStorage.getItem('shopping-list-view')
    return saved === 'days' ? 'days' : 'categories'
  })
  const [editingDaysItem, setEditingDaysItem] = useState<ShoppingItem | null>(null)
  const [editingMealPlan, setEditingMealPlan] = useState<MealPlan | null>(null)
  const { isDark, toggleTheme } = useTheme()

  const {
    items,
    loading,
    error,
    addItem,
    toggleItem,
    updateManualDays,
    markStandalone,
  } = useShoppingList()
  const { firestoreProducts, searchProducts, ensureProduct, recordPurchase, deleteProduct, dismissSuggestion, resetAllProducts } =
    useProducts()
  const { allTemplates, createTemplate, updateTemplate, deleteTemplate, recordTemplateUse, resetTemplateUseCounts } = useTemplates()
  const { history, saveToHistory, deleteEntry, clearHistory } = useHistory()
  const {
    mealPlans,
    loading: mealPlansLoading,
    error: mealPlansError,
    planTemplate,
    updateMealPlanDays,
    removeMealPlan,
    removeShoppingItem,
    removeCheckedItems,
  } = useMealPlans()
  const suggestions = useSuggestions(firestoreProducts, items)

  const checkedCount = items.filter((i) => i.checked).length

  useEffect(() => {
    localStorage.setItem('shopping-list-view', listView)
  }, [listView])

  useEffect(() => {
    if (mealPlansError && listView === 'days') setListView('categories')
  }, [mealPlansError, listView])

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
    setActiveTab('list')
    setListView('days')
  }

  async function handleRemoveItem(item: ShoppingItem) {
    if (item.mealPlanIds.length > 0) {
      const planNames = mealPlans
        .filter((plan) => item.mealPlanIds.includes(plan.id))
        .map((plan) => plan.name)
        .join(', ')
      const confirmed = confirm(
        `Produkt „${item.name}” należy do planu: ${planNames || 'posiłek'}. Usunąć go również z planu?`
      )
      if (!confirmed) return
    }

    await removeShoppingItem(item)
  }

  async function handleSaveManualDays(item: ShoppingItem, days: Weekday[]) {
    await updateManualDays(item.id, days)
    setEditingDaysItem(null)
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
            mealPlans={mealPlans}
            loading={loading}
            error={error}
            mealPlansLoading={mealPlansLoading}
            mealPlansError={mealPlansError}
            view={listView}
            onViewChange={setListView}
            onToggle={handleToggle}
            onRemove={handleRemoveItem}
            onEditDays={setEditingDaysItem}
            onEditMealPlan={setEditingMealPlan}
          />
        </>
      )}

      {activeTab === 'templates' && (
        <Templates
          templates={allTemplates}
          mealPlans={mealPlans}
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

      {editingDaysItem && (
        <DayPickerModal
          key={editingDaysItem.id}
          title={`Dni: ${editingDaysItem.name}`}
          description={
            editingDaysItem.mealPlanIds.length > 0
              ? 'Dni z planów posiłków są zablokowane. Pozostałe możesz ustawić ręcznie.'
              : 'Wybierz dowolne dni lub zostaw produkt bez dnia.'
          }
          selectedDays={editingDaysItem.manualDays}
          lockedDays={getInheritedDays(editingDaysItem, mealPlans)}
          onSave={(days) => handleSaveManualDays(editingDaysItem, days)}
          onClose={() => setEditingDaysItem(null)}
        />
      )}

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
