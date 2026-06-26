import { useState } from 'react'
import { ArrowLeft, Plus, X } from 'lucide-react'
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
      <div className="sticky top-[var(--app-header-height)] z-10 flex items-center justify-between border-b border-market-lightBorder bg-market-lightSurface px-4 py-3 dark:border-white/[0.04] dark:bg-market-header">
        <button onClick={onCancel} className="inline-flex min-h-10 items-center gap-1.5 rounded-full px-2 text-sm font-bold text-market-lightMuted transition-colors hover:text-market-lightText focus:outline-none focus:ring-2 focus:ring-fresh-violetLight dark:text-market-muted dark:hover:text-market-text dark:focus:ring-fresh-green">
          <ArrowLeft size={17} /> Anuluj
        </button>
        <h2 className="font-brand font-bold text-market-lightText dark:text-market-text">
          {initial ? 'Edytuj szablon' : 'Nowy szablon'}
        </h2>
        <button
          onClick={handleSave}
          disabled={!isValid || saving}
          className="min-h-10 rounded-full px-2 text-sm font-bold text-fresh-greenStrong transition-colors hover:text-[#1c6544] focus:outline-none focus:ring-2 focus:ring-fresh-greenStrong disabled:opacity-40 dark:text-fresh-green"
        >
          {saving ? '...' : 'Zapisz'}
        </button>
      </div>

      <div className="space-y-4 overflow-y-auto p-4">
        {/* Name + emoji */}
        <div className="flex gap-2">
          <input
            type="text"
            value={emoji}
            onChange={(e) => setEmoji(e.target.value)}
            placeholder="🍕"
            className="w-14 rounded-[14px] border border-market-lightInput bg-market-lightRaised px-2 py-2.5 text-center text-xl text-market-lightText focus:outline-none focus:ring-2 focus:ring-fresh-violetLight dark:border-white/[0.07] dark:bg-market-elevated dark:text-market-text dark:focus:ring-fresh-green"
            maxLength={2}
          />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nazwa szablonu..."
            className="flex-1 rounded-[14px] border border-market-lightInput bg-market-lightRaised px-4 py-2.5 text-base font-semibold text-market-lightText placeholder-market-lightSubtle focus:outline-none focus:ring-2 focus:ring-fresh-violetLight dark:border-white/[0.07] dark:bg-market-elevated dark:text-market-text dark:placeholder-market-subtle dark:focus:ring-fresh-green"
          />
        </div>

        {/* Items list */}
        <div>
          <p className="mb-2 font-brand text-[11px] font-bold uppercase tracking-[0.1em] text-market-lightMuted dark:text-market-muted">
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
                  className="flex-1 rounded-xl border border-market-lightInput bg-market-lightRaised px-3 py-2 text-sm font-semibold text-market-lightText placeholder-market-lightSubtle focus:outline-none focus:ring-2 focus:ring-fresh-violetLight dark:border-white/[0.07] dark:bg-market-elevated dark:text-market-text dark:placeholder-market-subtle dark:focus:ring-fresh-green"
                  autoCapitalize="sentences"
                />
                <select
                  value={item.category}
                  onChange={(e) => updateItem(i, 'category', e.target.value as CategoryId)}
                  className="w-12 rounded-xl border border-market-lightInput bg-market-lightRaised px-2 py-2 text-sm text-market-lightText focus:outline-none focus:ring-2 focus:ring-fresh-violetLight dark:border-white/[0.07] dark:bg-market-elevated dark:text-market-text dark:focus:ring-fresh-green"
                >
                  {CATEGORIES.filter(c => c.id !== 'snacks' && c.id !== 'other').map((c) => (
                    <option key={c.id} value={c.id}>{c.emoji}</option>
                  ))}
                </select>
                <button
                  onClick={() => removeItem(i)}
                  className="flex h-10 w-9 flex-shrink-0 items-center justify-center rounded-full text-market-lightMuted transition-colors hover:bg-fresh-danger/10 hover:text-fresh-danger focus:outline-none focus:ring-2 focus:ring-fresh-danger dark:text-market-subtle"
                  aria-label="Usuń składnik"
                >
                  <X size={17} />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={addItem}
            className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-market-lightInput text-sm font-bold text-market-lightMuted transition-colors hover:border-fresh-greenStrong hover:text-fresh-greenStrong focus:outline-none focus:ring-2 focus:ring-fresh-greenStrong dark:border-white/[0.12] dark:text-market-muted dark:hover:border-fresh-green dark:hover:text-fresh-green"
          >
            <Plus size={17} /> Dodaj składnik
          </button>
        </div>
      </div>
    </div>
  )
}
