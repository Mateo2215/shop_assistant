import { useState } from 'react'
import type { Template, TemplateItem, CategoryId } from '../types'
import { CATEGORIES } from '../data/categories'

interface TemplateEditorProps {
  initial?: Template
  onSave: (name: string, emoji: string, items: TemplateItem[]) => Promise<void>
  onCancel: () => void
}

const EMPTY_ITEM: TemplateItem = { name: '', category: 'vegetables' }

export default function TemplateEditor({ initial, onSave, onCancel }: TemplateEditorProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [emoji, setEmoji] = useState(initial?.emoji ?? '📋')
  const [items, setItems] = useState<TemplateItem[]>(initial?.items ?? [{ ...EMPTY_ITEM }])
  const [saving, setSaving] = useState(false)

  function updateItem(index: number, field: keyof TemplateItem, value: string) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)))
  }

  function addItem() {
    setItems((prev) => [...prev, { ...EMPTY_ITEM }])
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSave() {
    const trimmedName = name.trim()
    const validItems = items.filter((i) => i.name.trim().length > 0)
    if (!trimmedName || validItems.length === 0) return
    setSaving(true)
    try {
      await onSave(trimmedName, emoji, validItems)
    } finally {
      setSaving(false)
    }
  }

  const isValid = name.trim().length > 0 && items.some((i) => i.name.trim().length > 0)

  return (
    <div className="flex flex-col h-full pb-28">
      {/* Editor header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-[57px] z-10">
        <button onClick={onCancel} className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
          ← Anuluj
        </button>
        <h2 className="font-semibold text-slate-900 dark:text-slate-100">
          {initial ? 'Edytuj szablon' : 'Nowy szablon'}
        </h2>
        <button
          onClick={handleSave}
          disabled={!isValid || saving}
          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 font-semibold disabled:opacity-40 transition-colors"
        >
          {saving ? '...' : 'Zapisz'}
        </button>
      </div>

      <div className="p-4 space-y-4 overflow-y-auto">
        {/* Name + emoji */}
        <div className="flex gap-2">
          <input
            type="text"
            value={emoji}
            onChange={(e) => setEmoji(e.target.value)}
            placeholder="🍕"
            className="w-14 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl px-2 py-2.5 text-xl text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
            maxLength={2}
          />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nazwa szablonu..."
            className="flex-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Items list */}
        <div>
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-2">
            Składniki
          </p>
          <div className="space-y-2">
            {items.map((item, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => updateItem(i, 'name', e.target.value)}
                  placeholder="Nazwa produktu..."
                  className="flex-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  autoCapitalize="sentences"
                />
                <select
                  value={item.category}
                  onChange={(e) => updateItem(i, 'category', e.target.value as CategoryId)}
                  className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-12"
                >
                  {CATEGORIES.filter(c => c.id !== 'snacks' && c.id !== 'other').map((c) => (
                    <option key={c.id} value={c.id}>{c.emoji}</option>
                  ))}
                </select>
                <button
                  onClick={() => removeItem(i)}
                  className="text-slate-400 dark:text-slate-600 hover:text-red-400 text-xl transition-colors flex-shrink-0"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={addItem}
            className="mt-3 w-full py-2 border border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 text-slate-400 dark:text-slate-500 hover:text-indigo-500 dark:hover:text-indigo-400 rounded-xl text-sm transition-colors"
          >
            + Dodaj składnik
          </button>
        </div>
      </div>
    </div>
  )
}
