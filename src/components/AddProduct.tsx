import { useState, useRef, useEffect, type FormEvent } from 'react'
import type { CategoryId } from '../types'
import { CATEGORIES, getCategory } from '../data/categories'
import type { SuggestionProduct } from '../hooks/useProducts'

interface AddProductProps {
  onAdd: (name: string, category: CategoryId) => Promise<void>
  searchProducts: (query: string) => SuggestionProduct[]
  onDeleteProduct: (name: string) => Promise<void>
}

export default function AddProduct({ onAdd, searchProducts, onDeleteProduct }: AddProductProps) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState<CategoryId>('vegetables')
  const [suggestions, setSuggestions] = useState<SuggestionProduct[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [adding, setAdding] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleChange(value: string) {
    setName(value)
    const results = searchProducts(value)
    setSuggestions(results)
    setShowSuggestions(results.length > 0 && value.trim().length > 0)
  }

  function selectSuggestion(product: SuggestionProduct) {
    setName(product.name)
    setCategory(product.category)
    setShowSuggestions(false)
  }

  async function handleDeleteProduct(e: React.MouseEvent, product: SuggestionProduct) {
    e.stopPropagation()
    await onDeleteProduct(product.name)
    const results = searchProducts(name)
    setSuggestions(results)
    if (results.length === 0) setShowSuggestions(false)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed || adding) return
    setAdding(true)
    setShowSuggestions(false)
    try {
      await onAdd(trimmed, category)
      setName('')
      setCategory('vegetables')
    } finally {
      setAdding(false)
    }
  }

  return (
    <div ref={wrapperRef} className="relative bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-[57px] z-10">
      <form onSubmit={handleSubmit} className="p-3 flex gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => {
            if (name.trim().length > 0 && suggestions.length > 0) setShowSuggestions(true)
          }}
          placeholder="Dodaj produkt..."
          className="flex-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="sentences"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as CategoryId)}
          className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-0"
        >
          {CATEGORIES.filter(c => c.id !== 'snacks' && c.id !== 'other').map((c) => (
            <option key={c.id} value={c.id}>
              {c.emoji} {c.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={!name.trim() || adding}
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold text-xl disabled:opacity-40 hover:bg-indigo-500 active:bg-indigo-700 transition-colors flex-shrink-0"
        >
          +
        </button>
      </form>

      {/* Autocomplete dropdown */}
      {showSuggestions && (
        <div className="absolute left-3 right-3 top-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-20 overflow-hidden">
          {suggestions.map((s) => {
            const cat = getCategory(s.category)
            return (
              <div
                key={s.name}
                className="flex items-center border-b border-slate-100 dark:border-slate-700 last:border-0"
              >
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); selectSuggestion(s) }}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 active:bg-slate-100 dark:active:bg-slate-600 text-left transition-colors flex-1 min-w-0"
                >
                  <span className="text-lg flex-shrink-0">{cat.emoji}</span>
                  <span className="text-slate-900 dark:text-slate-100 flex-1 truncate">{s.name}</span>
                  <span className={`text-xs flex-shrink-0 ${cat.textColor}`}>{cat.name}</span>
                </button>
                {s.isCustom && (
                  <button
                    type="button"
                    onMouseDown={(e) => handleDeleteProduct(e, s)}
                    className="px-3 py-3 text-slate-400 dark:text-slate-600 hover:text-red-400 transition-colors flex-shrink-0"
                    title="Usuń z listy podpowiedzi"
                  >
                    ×
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
