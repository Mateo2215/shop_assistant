import { useState } from 'react'
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
      <div className="px-3 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex gap-2 sticky top-[57px] z-10">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Szukaj szablonu..."
          className="flex-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={() => setCreating(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-xl text-sm font-medium transition-colors flex-shrink-0"
        >
          + Nowy
        </button>
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400 dark:text-slate-500">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-sm">Brak wyników dla „{search}"</p>
        </div>
      )}

      {filtered.map((template) => (
        <div key={template.id} className="border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center px-4 py-3 gap-3">
            {/* Expand toggle */}
            <button
              onClick={() => setExpanded(expanded === template.id ? null : template.id)}
              className="flex items-center gap-3 flex-1 text-left min-w-0"
            >
              <span className="text-2xl flex-shrink-0">{template.emoji}</span>
              <div className="min-w-0">
                <p className="font-medium text-slate-900 dark:text-slate-100 truncate">{template.name}</p>
                <p className="text-xs text-slate-500">{template.items.length} składników</p>
              </div>
            </button>

            {/* Actions: edit and delete for all templates */}
            <div className="flex gap-1 flex-shrink-0">
              <button
                onClick={() => setEditing(template)}
                className="p-2 text-slate-400 dark:text-slate-500 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
                title="Edytuj"
              >
                ✏️
              </button>
              <button
                onClick={() => handleDelete(template)}
                className="p-2 text-slate-400 dark:text-slate-500 hover:text-red-400 transition-colors"
                title="Usuń"
              >
                🗑️
              </button>
            </div>

          </div>

          {/* Expanded ingredient list */}
          {expanded === template.id && (
            <div className="px-4 pb-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
              <ul className="space-y-1.5 pt-2">
                {template.items.map((item, i) => (
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

          <div className="flex gap-2 px-4 pb-3">
            <button
              type="button"
              onClick={() => handleAdd(template)}
              disabled={adding === template.id}
              className={`min-h-10 flex-1 rounded-xl px-3 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                added === template.id
                  ? 'border border-emerald-500/30 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                  : 'bg-indigo-600 text-white hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50'
              }`}
            >
              {adding === template.id ? '...' : added === template.id ? '✓ Dodano' : '+ Dodaj'}
            </button>
            <button
              type="button"
              onClick={() => setPlanning(template)}
              disabled={adding === template.id}
              className={`min-h-10 flex-1 rounded-xl border px-3 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 ${
                planned === template.id
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'border-indigo-200 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-500/30 dark:text-indigo-300 dark:hover:bg-indigo-500/10'
              }`}
            >
              {planned === template.id ? '✓ Zaplanowano' : '📅 Zaplanuj'}
            </button>
          </div>
        </div>
      ))}

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
