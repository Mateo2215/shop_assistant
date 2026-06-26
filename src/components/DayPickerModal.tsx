// Mobile-friendly weekday picker used by products, templates, and meal plans.
import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { WEEKDAYS, sortWeekdays } from '../data/weekdays'
import type { Weekday } from '../types'

interface DayPickerModalProps {
  title: string
  description?: string
  selectedDays: Weekday[]
  lockedDays?: Weekday[]
  allowEmpty?: boolean
  saveLabel?: string
  deleteLabel?: string
  onSave: (days: Weekday[]) => Promise<void>
  onClose: () => void
  onDelete?: () => Promise<void>
}

export default function DayPickerModal({
  title,
  description,
  selectedDays,
  lockedDays = [],
  allowEmpty = true,
  saveLabel = 'Zapisz',
  deleteLabel,
  onSave,
  onClose,
  onDelete,
}: DayPickerModalProps) {
  const [selected, setSelected] = useState<Set<Weekday>>(new Set(selectedDays))
  const [saving, setSaving] = useState(false)
  const locked = new Set(lockedDays)

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  function toggleDay(day: Weekday) {
    setSelected((current) => {
      const next = new Set(current)
      if (locked.has(day) && !next.has(day)) return next
      if (next.has(day)) next.delete(day)
      else next.add(day)
      return next
    })
  }

  async function handleSave() {
    if (!allowEmpty && selected.size === 0) return
    setSaving(true)
    try {
      await onSave(sortWeekdays(selected))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!onDelete) return
    setSaving(true)
    try {
      await onDelete()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 p-0 sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="day-picker-title"
        className="w-full max-w-md rounded-t-3xl border border-market-lightBorder bg-market-lightSurface p-4 shadow-2xl dark:border-white/[0.06] dark:bg-market-surface sm:rounded-3xl"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 id="day-picker-title" className="font-brand text-lg font-bold text-market-lightText dark:text-market-text">
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-sm font-semibold text-market-lightMuted dark:text-market-muted">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-market-lightMuted transition-colors hover:bg-market-lightRaised hover:text-market-lightText focus:outline-none focus:ring-2 focus:ring-fresh-violetLight dark:text-market-muted dark:hover:bg-market-raised dark:hover:text-market-text dark:focus:ring-fresh-green"
            aria-label="Zamknij"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {WEEKDAYS.map((day) => {
            const isLocked = locked.has(day.id)
            const isAlsoManual = selected.has(day.id)
            const isSelected = selected.has(day.id) || isLocked

            return (
              <button
                key={day.id}
                type="button"
                onClick={() => toggleDay(day.id)}
                disabled={(isLocked && !isAlsoManual) || saving}
                aria-pressed={isSelected}
                className={`min-h-12 rounded-xl border px-3 py-2 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-fresh-green ${
                  isSelected
                    ? 'border-fresh-greenStrong bg-fresh-greenStrong/10 text-fresh-greenStrong dark:border-fresh-green dark:bg-fresh-green/15 dark:text-fresh-green'
                    : 'border-market-lightInput bg-market-lightRaised text-market-lightText hover:border-fresh-violetLight dark:border-white/[0.08] dark:bg-market-elevated dark:text-market-text'
                } ${isLocked && !isAlsoManual ? 'cursor-not-allowed opacity-65' : ''}`}
              >
                <span className="block text-sm font-semibold">{day.label}</span>
                {isLocked && (
                  <span className="block text-xs">
                    {isAlsoManual ? 'z planu i ręcznie — usuń ręczne' : 'z planu posiłku'}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        <div className="mt-5 flex gap-2">
          {onDelete && deleteLabel && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={saving}
              className="min-h-11 rounded-xl border border-fresh-danger/30 px-4 text-sm font-bold text-fresh-danger transition-colors hover:bg-fresh-danger/10 focus:outline-none focus:ring-2 focus:ring-fresh-danger disabled:opacity-50"
            >
              {deleteLabel}
            </button>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || (!allowEmpty && selected.size === 0)}
            className="min-h-11 flex-1 rounded-xl bg-gradient-to-br from-fresh-violetLight to-fresh-greenStrong px-4 text-sm font-bold text-white transition-colors hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-fresh-greenStrong focus:ring-offset-2 focus:ring-offset-market-lightSurface disabled:opacity-40 dark:from-fresh-violet dark:to-fresh-green dark:focus:ring-offset-market-surface"
          >
            {saving ? 'Zapisywanie...' : saveLabel}
          </button>
        </div>
      </section>
    </div>
  )
}
