import { useState, useRef, useEffect, type FormEvent } from 'react'
import { ChevronDown, X } from 'lucide-react'
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
    <div ref={wrapperRef} className="sticky top-[var(--app-header-height)] z-10 border-b border-market-lightBorder bg-market-lightSurface px-4 py-4 dark:border-white/[0.04] dark:bg-market-header">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex gap-2.5">
          <input
            type="text"
            value={name}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={() => {
              if (name.trim().length > 0 && suggestions.length > 0) setShowSuggestions(true)
            }}
            placeholder="Dodaj produkt..."
            className="min-h-12 flex-1 rounded-[14px] border border-market-lightInput bg-market-lightRaised px-4 text-[15px] font-semibold text-market-lightText placeholder-market-lightSubtle transition-colors focus:outline-none focus:ring-2 focus:ring-fresh-violetLight dark:border-white/[0.07] dark:bg-market-elevated dark:text-market-text dark:placeholder-market-subtle dark:focus:ring-fresh-green"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="sentences"
          />
          <button
            type="submit"
            disabled={!name.trim() || adding}
            className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-[14px] bg-gradient-to-br from-fresh-violetLight to-fresh-greenStrong text-2xl font-bold text-white shadow-[0_6px_16px_rgba(78,184,127,0.28)] transition-transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-fresh-greenStrong disabled:opacity-40 disabled:hover:scale-100 dark:from-fresh-violet dark:to-fresh-green dark:shadow-[0_6px_16px_rgba(124,180,140,0.30)]"
          >
            +
          </button>
        </div>
        <label className="relative block">
          <span className="sr-only">Kategoria produktu</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as CategoryId)}
            className="min-h-11 w-full appearance-none rounded-[14px] border border-market-lightInput bg-market-lightRaised px-4 pr-10 text-[14.5px] font-bold text-market-lightText focus:outline-none focus:ring-2 focus:ring-fresh-violetLight dark:border-white/[0.07] dark:bg-market-elevated dark:text-market-text dark:focus:ring-fresh-green"
          >
            {CATEGORIES.filter(c => c.id !== 'snacks' && c.id !== 'other').map((c) => (
              <option key={c.id} value={c.id}>
                {c.emoji} {c.name}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-market-lightMuted dark:text-[#8b978c]" size={18} strokeWidth={2.2} />
        </label>
      </form>

      {/* Autocomplete dropdown */}
      {showSuggestions && (
        <div className="absolute left-4 right-4 top-full z-20 overflow-hidden rounded-[14px] border border-market-lightBorder bg-market-lightSurface shadow-2xl dark:border-white/[0.07] dark:bg-market-elevated">
          {suggestions.map((s) => {
            const cat = getCategory(s.category)
            return (
              <div
                key={s.name}
                className="flex items-center border-b border-market-lightBorder last:border-0 dark:border-white/[0.05]"
              >
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); selectSuggestion(s) }}
                  className="flex min-h-12 flex-1 items-center gap-3 px-4 text-left transition-colors hover:bg-market-lightRaised active:bg-[#e8dfcf] dark:hover:bg-market-raised dark:active:bg-[#313b33]"
                >
                  <span className="text-lg flex-shrink-0">{cat.emoji}</span>
                  <span className="flex-1 truncate font-semibold text-market-lightText dark:text-market-text">{s.name}</span>
                  <span className={`flex-shrink-0 text-xs font-bold ${cat.textColor}`}>{cat.name}</span>
                </button>
                {s.isCustom && (
                  <button
                    type="button"
                    onMouseDown={(e) => handleDeleteProduct(e, s)}
                    className="flex min-h-12 w-11 flex-shrink-0 items-center justify-center text-market-lightMuted transition-colors hover:text-fresh-danger dark:text-market-subtle"
                    title="Usuń z listy podpowiedzi"
                    aria-label={`Usuń ${s.name} z listy podpowiedzi`}
                  >
                    <X size={17} />
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
