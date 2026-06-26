import { X } from 'lucide-react'
import type { CategoryId } from '../types'
import { getCategory } from '../data/categories'

interface Suggestion {
  name: string
  category: CategoryId
}

interface SuggestionsProps {
  suggestions: Suggestion[]
  onAdd: (name: string, category: CategoryId) => Promise<void>
  onDismiss: (name: string) => Promise<void>
}

export default function Suggestions({ suggestions, onAdd, onDismiss }: SuggestionsProps) {
  if (suggestions.length === 0) return null

  return (
    <div className="border-b border-market-lightBorder bg-market-lightSurface px-4 py-3 dark:border-white/[0.04] dark:bg-market-header">
      <p className="mb-2.5 font-brand text-[11px] font-bold uppercase tracking-[0.1em] text-market-lightMuted dark:text-[#6f7c72]">
        🛒 Może potrzebujesz?
      </p>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {suggestions.map((s) => {
          const cat = getCategory(s.category)
          return (
            <div
              key={s.name}
              className="flex flex-shrink-0 items-center overflow-hidden rounded-full border border-fresh-greenStrong/30 bg-market-lightSurface shadow-sm dark:border-fresh-greenSoft/30 dark:bg-market-raised"
            >
              <button
                onClick={() => onAdd(s.name, s.category)}
                className="flex min-h-9 items-center gap-1.5 py-1.5 pl-3 pr-2 text-[13.5px] font-semibold transition-colors hover:bg-fresh-greenStrong/10 dark:hover:bg-fresh-green/10"
              >
                <span>{cat.emoji}</span>
                <span className="whitespace-nowrap text-market-lightText dark:text-market-text">{s.name}</span>
              </button>
              <button
                onClick={() => onDismiss(s.name)}
                className="flex min-h-9 items-center px-2 text-market-lightMuted transition-colors hover:text-fresh-danger dark:text-market-subtle"
                title="Ukryj sugestię"
                aria-label={`Ukryj sugestię ${s.name}`}
              >
                <X size={14} />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
