// Mobile-friendly weekday picker used by products, templates, and meal plans.
import { useEffect, useState } from 'react'
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
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-0 sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="day-picker-title"
        className="w-full max-w-md rounded-t-3xl bg-white p-4 shadow-2xl dark:bg-slate-900 sm:rounded-3xl"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 id="day-picker-title" className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-2xl text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label="Zamknij"
          >
            ×
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
                className={`min-h-12 rounded-xl border px-3 py-2 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-indigo-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
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
              className="min-h-11 rounded-xl border border-red-200 px-4 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10"
            >
              {deleteLabel}
            </button>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || (!allowEmpty && selected.size === 0)}
            className="min-h-11 flex-1 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-40 dark:focus:ring-offset-slate-900"
          >
            {saving ? 'Zapisywanie...' : saveLabel}
          </button>
        </div>
      </section>
    </div>
  )
}
