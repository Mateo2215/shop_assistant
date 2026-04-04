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
    <div className="px-3 py-2.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
      <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-2">
        Może potrzebujesz?
      </p>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {suggestions.map((s) => {
          const cat = getCategory(s.category)
          return (
            <div
              key={s.name}
              className="flex-shrink-0 flex items-center bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full overflow-hidden"
            >
              <button
                onClick={() => onAdd(s.name, s.category)}
                className="flex items-center gap-1.5 pl-3 pr-2 py-1.5 text-sm hover:bg-slate-200 dark:hover:bg-slate-700 active:bg-slate-300 dark:active:bg-slate-600 transition-colors"
              >
                <span>{cat.emoji}</span>
                <span className="text-slate-700 dark:text-slate-300 whitespace-nowrap">{s.name}</span>
              </button>
              <button
                onClick={() => onDismiss(s.name)}
                className="pr-2.5 pl-1 py-1.5 text-slate-400 hover:text-red-400 transition-colors text-base leading-none"
                title="Ukryj sugestię"
              >
                ×
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
