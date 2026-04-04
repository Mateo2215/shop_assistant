import { useState } from 'react'
import type { HistoryEntry } from '../types'

interface HistoryProps {
  history: HistoryEntry[]
  onRepeat: (items: HistoryEntry['items']) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export default function History({ history, onRepeat, onDelete }: HistoryProps) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [repeating, setRepeating] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500 px-6 text-center">
        <div className="text-5xl mb-3">🕐</div>
        <p className="text-lg font-medium text-slate-500 dark:text-slate-400">Brak historii</p>
        <p className="text-sm mt-1">
          Historia pojawi się po wyczyszczeniu kupionych produktów
        </p>
      </div>
    )
  }

  async function handleRepeat(entry: HistoryEntry) {
    setRepeating(entry.id)
    try {
      await onRepeat(entry.items)
    } finally {
      setRepeating(null)
    }
  }

  async function handleDelete(entry: HistoryEntry) {
    if (!confirm('Usunąć tę sesję zakupową z historii?')) return
    setDeleting(entry.id)
    try {
      await onDelete(entry.id)
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="pb-28">
      {history.map((entry) => (
        <div key={entry.id} className="border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center px-4 py-3 gap-3">
            <button
              onClick={() => setExpanded(expanded === entry.id ? null : entry.id)}
              className="flex-1 text-left min-w-0"
            >
              <p className="font-medium text-slate-900 dark:text-slate-100 capitalize">
                {entry.date.toLocaleDateString('pl-PL', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {entry.items.length} produktów
                <span className="ml-1 text-slate-400 dark:text-slate-700">
                  {expanded === entry.id ? '▲' : '▼'}
                </span>
              </p>
            </button>

            <button
              onClick={() => handleRepeat(entry)}
              disabled={repeating === entry.id}
              className="flex-shrink-0 text-sm text-indigo-600 dark:text-indigo-400 border border-indigo-300 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 active:bg-indigo-100 dark:active:bg-indigo-500/20 px-3 py-1.5 rounded-xl transition-colors disabled:opacity-50"
            >
              {repeating === entry.id ? '...' : 'Powtórz'}
            </button>

            <button
              onClick={() => handleDelete(entry)}
              disabled={deleting === entry.id}
              className="flex-shrink-0 text-slate-400 dark:text-slate-600 hover:text-red-400 transition-colors text-xl leading-none disabled:opacity-50 pl-1"
              title="Usuń z historii"
            >
              ×
            </button>
          </div>

          {expanded === entry.id && (
            <div className="px-4 pb-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
              <ul className="space-y-1.5 pt-2">
                {entry.items.map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <span className="text-slate-400 dark:text-slate-600 text-xs">•</span>
                    <span>{item.name}</span>
                    {item.quantity && (
                      <span className="text-slate-400 dark:text-slate-500">{item.quantity} {item.unit}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
