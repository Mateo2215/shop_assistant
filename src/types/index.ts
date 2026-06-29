export type CategoryId =
  | 'vegetables'   // Warzywa i owoce
  | 'konserwy'     // Konserwy
  | 'spices'       // Przyprawy
  | 'tea-coffee'   // Herbata i Kawa
  | 'chips'        // Przekąski
  | 'sweets'       // Słodycze
  | 'sauces'       // Sosy
  | 'pasta-rice'   // Makaron i Ryż
  | 'salt-sugar'   // Sól i Cukier
  | 'dairy'        // Nabiał
  | 'deli'         // Wędlina i Ser
  | 'meat'         // Mięso
  | 'frozen'       // Mrożonki
  | 'bread'        // Pieczywo
  | 'alcohol'      // Alkohole
  | 'drinks'       // Napoje
  | 'water'        // Woda
  | 'hygiene'      // Artykuły higieniczne
  | 'household'    // Artykuły Chemiczne
  | 'snacks'       // Legacy
  | 'other'        // Inne

export interface Category {
  id: CategoryId
  name: string
  emoji: string
  bgColor: string    // Tailwind classes — includes both light and dark: variants
  textColor: string  // Tailwind classes — includes both light and dark: variants
  borderColor: string
  badgeColor: string
}

export interface ShoppingItem {
  id: string
  name: string
  quantity?: string
  unit?: string
  category: CategoryId
  checked: boolean
  manualDays: Weekday[]
  mealPlanIds: string[]
  isStandalone: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Product {
  id: string
  name: string
  category: CategoryId
  purchaseCount: number
  lastPurchased: Date | null
}

export interface TemplateItem {
  name: string
  quantity?: string
  unit?: string
  category: CategoryId
}

export interface Template {
  id: string
  name: string
  emoji: string
  items: TemplateItem[]
  isDefault: boolean
  useCount?: number
}

export type Weekday =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday'

export interface MealPlanItem extends TemplateItem {
  shoppingItemId: string
}

export interface MealPlan {
  id: string
  templateId: string
  name: string
  emoji: string
  days: Weekday[]
  items: MealPlanItem[]
  createdAt: Date
  updatedAt: Date
}

export interface HistoryItem {
  name: string
  quantity?: string
  unit?: string
  category: CategoryId
}

export interface HistoryEntry {
  id: string
  date: Date
  items: HistoryItem[]
}

export type ActiveTab = 'list' | 'templates' | 'historia' | 'statystyki' | 'jadlospis'
