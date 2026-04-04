import { useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { Product, HistoryEntry, Template } from '../types'
import { useStatistics } from '../hooks/useStatistics'

interface StatisticsProps {
  firestoreProducts: Product[]
  history: HistoryEntry[]
  allTemplates: Template[]
  onReset: () => Promise<void>
}

// Indigo-violet brand palette for charts
const CHART_COLORS = [
  '#6366f1', // indigo-500
  '#8b5cf6', // violet-500
  '#3b82f6', // blue-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#f43f5e', // rose-500
]

interface KpiCardProps {
  emoji: string
  value: number | string
  label: string
  note?: string
}

function KpiCard({ emoji, value, label, note }: KpiCardProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col gap-1">
      <span className="text-2xl leading-none">{emoji}</span>
      <span className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">{value}</span>
      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-tight">{label}</span>
      {note && <span className="text-[10px] text-slate-400 dark:text-slate-600">{note}</span>}
    </div>
  )
}

// Custom tooltip for dark mode compatibility
function CustomBarTooltip({ active, payload }: { active?: boolean; payload?: { value: number }[] }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-800 text-white text-xs rounded-lg px-3 py-2 shadow-lg">
      Kupiono: <strong>{payload[0].value}×</strong>
    </div>
  )
}

function CustomPieTooltip({ active, payload }: { active?: boolean; payload?: { name: string; value: number }[] }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-800 text-white text-xs rounded-lg px-3 py-2 shadow-lg">
      {payload[0].name}: <strong>{payload[0].value} szt.</strong>
    </div>
  )
}

export default function Statistics({ firestoreProducts, history, allTemplates, onReset }: StatisticsProps) {
  const stats = useStatistics(firestoreProducts, history, allTemplates)
  const [resetting, setResetting] = useState(false)

  async function handleReset() {
    if (!confirm('Zresetować wszystkie statystyki? Usunięta zostanie historia zakupów oraz liczniki produktów i szablonów.')) return
    setResetting(true)
    try {
      await onReset()
    } finally {
      setResetting(false)
    }
  }

  if (!stats.hasData) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500 px-6 text-center">
        <div className="text-5xl mb-3">📊</div>
        <p className="text-lg font-medium text-slate-500 dark:text-slate-400">Brak danych</p>
        <p className="text-sm mt-1">Statystyki pojawią się po pierwszych zakupach</p>
      </div>
    )
  }

  return (
    <div className="pb-28 px-4 py-4 space-y-5">

      {/* KPI Cards — 2×2 grid */}
      <div>
        <h2 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-3">
          Podsumowanie
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <KpiCard
            emoji="🛍️"
            value={stats.totalSessions}
            label="Sesje zakupowe"
            note={stats.totalSessions >= 30 ? 'ostatnie 30' : undefined}
          />
          <KpiCard
            emoji="🛒"
            value={stats.totalItems}
            label="Łącznie produktów kupionych"
          />
          <KpiCard
            emoji="📦"
            value={stats.avgItemsPerSession}
            label="Produktów średnio na sesję"
          />
          <KpiCard
            emoji="🌟"
            value={stats.uniqueProducts}
            label="Unikalnych produktów"
          />
        </div>
      </div>

      {/* Top products — horizontal bar chart */}
      {stats.topProducts.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800">
          <h2 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-4">
            Top produkty
          </h2>
          <ResponsiveContainer width="100%" height={stats.topProducts.length * 36 + 8}>
            <BarChart
              layout="vertical"
              data={stats.topProducts}
              margin={{ top: 0, right: 32, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="name"
                width={110}
                tick={{ fontSize: 12, fill: 'currentColor' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(99,102,241,0.08)' }} />
              <Bar dataKey="count" fill="url(#barGradient)" radius={[0, 6, 6, 0]} barSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Category distribution — donut chart */}
      {stats.topCategories.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800">
          <h2 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-4">
            Ulubione kategorie
          </h2>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={stats.topCategories}
                dataKey="count"
                nameKey="name"
                innerRadius="52%"
                outerRadius="78%"
                paddingAngle={2}
              >
                {stats.topCategories.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomPieTooltip />} />
              <Legend
                iconType="circle"
                iconSize={8}
                formatter={(value) => (
                  <span style={{ fontSize: 11, color: 'inherit' }}>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Top templates ranking — always visible */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800">
        <h2 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-3">
          Ulubione szablony
        </h2>
        {stats.topTemplates.length === 0 ? (
          <p className="text-sm text-slate-400 dark:text-slate-600 py-2">
            Użyj szablonu, żeby zobaczyć ranking ulubionych dań
          </p>
        ) : (
          <div className="space-y-2">
            {stats.topTemplates.map((t, i) => {
              const maxCount = stats.topTemplates[0].count
              const pct = Math.round((t.count / maxCount) * 100)
              return (
                <div key={t.name} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-600 w-4 text-right flex-shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-base leading-none flex-shrink-0">{t.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-slate-700 dark:text-slate-300 truncate">{t.name}</span>
                      <span className="text-xs text-slate-400 dark:text-slate-500 flex-shrink-0 ml-2">{t.count}×</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Reset button */}
      <div className="pt-2">
        <button
          onClick={handleReset}
          disabled={resetting}
          className="w-full py-3 rounded-xl text-sm font-medium text-red-500 dark:text-red-400 border border-red-200 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-500/10 active:bg-red-100 dark:active:bg-red-500/20 transition-colors disabled:opacity-50"
        >
          {resetting ? 'Resetowanie…' : '🔄 Resetuj statystyki'}
        </button>
      </div>

    </div>
  )
}
