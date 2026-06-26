import { useState } from 'react'
import { CalendarDays, ChevronDown, ChevronUp, Pencil, Search, Trash2 } from 'lucide-react'
import type { MealPlan, Template, TemplateItem, Weekday } from '../types'
import DayPickerModal from './DayPickerModal'
import TemplateEditor from './TemplateEditor'

interface TemplatesProps {
  templates: Template[]
  mealPlans: MealPlan[]
  onAddFromTemplate: (template: Template) => Promise<void>
  onPlanTemplate: (template: Template, days: Weekday[]) => Promise<void>
  onCreateTemplate: (name: string, emoji: string, items: TemplateItem[]) => Promise<void>
  onUpdateTemplate: (id: string, name: string, emoji: string, items: TemplateItem[]) => Promise<void>
  onDeleteTemplate: (id: string) => Promise<void>
}

export default function Templates({
  templates,
  mealPlans,
  onAddFromTemplate,
  onPlanTemplate,
  onCreateTemplate,
  onUpdateTemplate,
  onDeleteTemplate,
}: TemplatesProps) {
  const [search, setSearch] = useState('')
  const [adding, setAdding] = useState<string | null>(null)
  const [added, setAdded] = useState<string | null>(null)
  const [planned, setPlanned] = useState<string | null>(null)
  const [planning, setPlanning] = useState<Template | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [editing, setEditing] = useState<Template | null>(null)
  const [creating, setCreating] = useState(false)

  const filtered = templates.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  )

  async function handleAdd(template: Template) {
    setAdding(template.id)
    try {
      await onAddFromTemplate(template)
      setAdded(template.id)
      setTimeout(() => setAdded(null), 2000)
    } finally {
      setAdding(null)
    }
  }

  async function handleSaveNew(name: string, emoji: string, items: TemplateItem[]) {
    await onCreateTemplate(name, emoji, items)
    setCreating(false)
  }

  async function handleSaveEdit(name: string, emoji: string, items: TemplateItem[]) {
    if (!editing) return
    await onUpdateTemplate(editing.id, name, emoji, items)
    setEditing(null)
  }

  async function handleDelete(template: Template) {
    if (!confirm(`Usunąć szablon "${template.name}"?`)) return
    await onDeleteTemplate(template.id)
  }

  async function handlePlan(template: Template, days: Weekday[]) {
    setAdding(template.id)
    try {
      await onPlanTemplate(template, days)
      setPlanned(template.id)
      setPlanning(null)
      setTimeout(() => setPlanned(null), 2000)
    } finally {
      setAdding(null)
    }
  }

  // Show editor screens
  if (creating) {
    return <TemplateEditor onSave={handleSaveNew} onCancel={() => setCreating(false)} />
  }
  if (editing) {
    return <TemplateEditor initial={editing} onSave={handleSaveEdit} onCancel={() => setEditing(null)} />
  }

  return (
    <div className="pb-28">
      {/* Search + add button */}
      <div className="sticky top-[var(--app-header-height)] z-10 flex gap-2.5 border-b border-market-lightBorder bg-market-lightSurface px-4 py-4 dark:border-white/[0.04] dark:bg-market-header">
        <label className="relative flex-1">
          <span className="sr-only">Szukaj szablonu</span>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-market-lightMuted dark:text-market-subtle" size={17} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Szukaj szablonu..."
            className="min-h-11 w-full rounded-[14px] border border-market-lightInput bg-market-lightRaised pl-10 pr-4 text-sm font-semibold text-market-lightText placeholder-market-lightSubtle focus:outline-none focus:ring-2 focus:ring-fresh-violetLight dark:border-white/[0.07] dark:bg-market-elevated dark:text-market-text dark:placeholder-market-subtle dark:focus:ring-fresh-green"
          />
        </label>
        <button
          onClick={() => setCreating(true)}
          className="min-h-11 flex-shrink-0 rounded-[14px] bg-gradient-to-br from-fresh-violetLight to-fresh-greenStrong px-4 text-sm font-bold text-white shadow-[0_6px_16px_rgba(78,184,127,0.28)] transition-transform hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-fresh-greenStrong dark:from-fresh-violet dark:to-fresh-green"
        >
          + Nowy
        </button>
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center px-6 py-16 text-center text-market-lightMuted dark:text-market-muted">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-sm">Brak wyników dla „{search}"</p>
        </div>
      )}

      <div className="space-y-3 p-4">
      {filtered.map((template) => (
        <div key={template.id} className="overflow-hidden rounded-[18px] border border-market-lightBorder bg-market-lightSurface shadow-sm dark:border-white/[0.06] dark:bg-market-surface">
          <div className="flex items-center gap-3 px-4 py-3.5">
            {/* Expand toggle */}
            <button
              onClick={() => setExpanded(expanded === template.id ? null : template.id)}
              className="flex min-w-0 flex-1 items-center gap-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-fresh-green"
              aria-expanded={expanded === template.id}
            >
              <span className="flex h-[42px] w-[42px] flex-shrink-0 items-center justify-center rounded-xl bg-fresh-greenStrong/10 text-2xl dark:bg-fresh-green/10">{template.emoji}</span>
              <div className="min-w-0">
                <p className="truncate text-base font-bold text-market-lightText dark:text-market-text">{template.name}</p>
                <p className="mt-0.5 text-xs font-semibold text-market-lightMuted dark:text-market-muted">{template.items.length} składników</p>
              </div>
              {expanded === template.id ? (
                <ChevronUp className="text-market-lightMuted dark:text-market-muted" size={17} />
              ) : (
                <ChevronDown className="text-market-lightMuted dark:text-market-muted" size={17} />
              )}
            </button>

            {/* Actions: edit and delete for all templates */}
            <div className="flex flex-shrink-0 gap-1">
              <button
                onClick={() => setEditing(template)}
                className="flex h-10 w-10 items-center justify-center rounded-full text-fresh-violetLight transition-colors hover:bg-fresh-violetLight/10 focus:outline-none focus:ring-2 focus:ring-fresh-violetLight dark:text-fresh-violet"
                title="Edytuj"
                aria-label={`Edytuj szablon ${template.name}`}
              >
                <Pencil size={18} />
              </button>
              <button
                onClick={() => handleDelete(template)}
                className="flex h-10 w-10 items-center justify-center rounded-full text-market-lightMuted transition-colors hover:bg-fresh-danger/10 hover:text-fresh-danger focus:outline-none focus:ring-2 focus:ring-fresh-danger dark:text-market-subtle"
                title="Usuń"
                aria-label={`Usuń szablon ${template.name}`}
              >
                <Trash2 size={18} />
              </button>
            </div>

          </div>

          {/* Expanded ingredient list */}
          {expanded === template.id && (
            <div className="border-t border-market-lightBorder bg-market-lightRaised px-4 pb-3 dark:border-white/[0.04] dark:bg-market-raised">
              <ul className="space-y-1.5 pt-3">
                {template.items.map((item, i) => (
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

          <div className="flex gap-2 px-4 pb-4">
            <button
              type="button"
              onClick={() => handleAdd(template)}
              disabled={adding === template.id}
              className={`min-h-11 flex-1 rounded-xl px-3 text-sm font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-fresh-green ${
                added === template.id
                  ? 'border border-fresh-greenStrong/30 bg-fresh-greenStrong/15 text-fresh-greenStrong dark:border-fresh-green/30 dark:bg-fresh-green/15 dark:text-fresh-green'
                  : 'bg-gradient-to-br from-fresh-violetLight to-fresh-greenStrong text-white hover:brightness-105 active:brightness-95 disabled:opacity-50 dark:from-fresh-violet dark:to-fresh-green'
              }`}
            >
              {adding === template.id ? '...' : added === template.id ? '✓ Dodano' : '+ Dodaj'}
            </button>
            <button
              type="button"
              onClick={() => setPlanning(template)}
              disabled={adding === template.id}
              className={`inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-xl border px-3 text-sm font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-fresh-green disabled:opacity-50 ${
                planned === template.id
                  ? 'border-fresh-greenStrong/30 bg-fresh-greenStrong/10 text-fresh-greenStrong dark:border-fresh-green/30 dark:bg-fresh-green/10 dark:text-fresh-green'
                  : 'border-market-lightInput text-market-lightText hover:bg-market-lightRaised dark:border-white/[0.12] dark:text-[#cdd6cf] dark:hover:bg-market-raised'
              }`}
            >
              {planned === template.id ? '✓ Zaplanowano' : (
                <>
                  <CalendarDays size={16} /> Zaplanuj
                </>
              )}
            </button>
          </div>
        </div>
      ))}
      </div>

      {planning && (
        <DayPickerModal
          title={`Zaplanuj: ${planning.name}`}
          description="Wybierz co najmniej jeden nowy dzień. Ilości składników nie będą mnożone."
          selectedDays={[]}
          lockedDays={
            mealPlans.find((plan) => plan.templateId === planning.id)?.days ?? []
          }
          allowEmpty={false}
          saveLabel="Dodaj do planu"
          onSave={(days) => handlePlan(planning, days)}
          onClose={() => setPlanning(null)}
        />
      )}
    </div>
  )
}
