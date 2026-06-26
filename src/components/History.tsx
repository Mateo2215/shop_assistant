import { useState } from 'react'
import { ChevronDown, ChevronUp, Clock, X } from 'lucide-react'
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
      <div className="flex flex-col items-center justify-center px-6 py-20 text-center text-market-lightMuted dark:text-market-muted">
        <Clock className="mb-3 text-fresh-greenStrong dark:text-fresh-green" size={42} />
        <p className="font-brand text-lg font-bold text-market-lightText dark:text-market-text">Brak historii</p>
        <p className="mt-1 text-sm">
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
    <div className="space-y-3 p-4 pb-28">
      {history.map((entry) => (
        <div key={entry.id} className="overflow-hidden rounded-2xl border border-market-lightBorder bg-market-lightSurface shadow-sm dark:border-white/[0.06] dark:bg-market-surface">
          <div className="flex items-center gap-3 px-4 py-3.5">
            <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-fresh-greenStrong/10 text-fresh-greenStrong dark:bg-fresh-green/10 dark:text-fresh-green">
              <Clock size={22} />
            </span>
            <button
              onClick={() => setExpanded(expanded === entry.id ? null : entry.id)}
              className="min-w-0 flex-1 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-fresh-green"
              aria-expanded={expanded === entry.id}
            >
              <p className="truncate text-[15px] font-bold capitalize text-market-lightText dark:text-market-text">
                {entry.date.toLocaleDateString('pl-PL', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
              <p className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-market-lightMuted dark:text-market-muted">
                {entry.items.length} produktów
                {expanded === entry.id ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </p>
            </button>

            <button
              onClick={() => handleRepeat(entry)}
              disabled={repeating === entry.id}
              className="min-h-10 flex-shrink-0 rounded-xl border border-fresh-greenStrong/40 bg-fresh-greenStrong/10 px-3 text-sm font-bold text-fresh-greenStrong transition-colors hover:bg-fresh-greenStrong/15 focus:outline-none focus:ring-2 focus:ring-fresh-greenStrong disabled:opacity-50 dark:border-fresh-green/40 dark:bg-fresh-green/10 dark:text-fresh-green"
            >
              {repeating === entry.id ? '...' : 'Powtórz'}
            </button>

            <button
              onClick={() => handleDelete(entry)}
              disabled={deleting === entry.id}
              className="flex h-10 w-9 flex-shrink-0 items-center justify-center rounded-full text-market-lightMuted transition-colors hover:bg-fresh-danger/10 hover:text-fresh-danger focus:outline-none focus:ring-2 focus:ring-fresh-danger disabled:opacity-50 dark:text-market-subtle"
              title="Usuń z historii"
              aria-label="Usuń z historii"
            >
              <X size={17} />
            </button>
          </div>

          {expanded === entry.id && (
            <div className="border-t border-market-lightBorder bg-market-lightRaised px-4 pb-3 dark:border-white/[0.04] dark:bg-market-raised">
              <ul className="space-y-1.5 pt-3">
                {entry.items.map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm font-semibold text-market-lightMuted dark:text-market-muted">
                    <span className="text-xs text-fresh-greenStrong dark:text-fresh-green">•</span>
                    <span>{item.name}</span>
                    {item.quantity && (
                      <span className="text-market-lightSubtle dark:text-market-subtle">{item.quantity} {item.unit}</span>
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
