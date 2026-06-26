import { useState } from 'react'
import { RotateCcw } from 'lucide-react'
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

// Fresh Market chart palette.
const CHART_COLORS = [
  '#a98bf0',
  '#7fcb9e',
  '#6f8fc4',
  '#e08aa0',
  '#f4c25a',
  '#4eb87f',
]

interface KpiCardProps {
  emoji: string
  value: number | string
  label: string
  note?: string
  tone?: 'violet' | 'green'
}

function KpiCard({ emoji, value, label, note, tone = 'violet' }: KpiCardProps) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-market-lightBorder bg-market-lightSurface p-4 shadow-sm dark:border-white/[0.06] dark:bg-market-surface">
      <span className="text-2xl leading-none">{emoji}</span>
      <span className={`mt-1 font-brand text-[28px] font-bold ${tone === 'green' ? 'text-fresh-greenStrong dark:text-fresh-green' : 'text-fresh-violetLight dark:text-fresh-violet'}`}>{value}</span>
      <span className="text-xs font-semibold leading-tight text-market-lightMuted dark:text-market-muted">{label}</span>
      {note && <span className="text-[10px] text-market-lightSubtle dark:text-market-subtle">{note}</span>}
    </div>
  )
}

// Custom tooltip for dark mode compatibility
function CustomBarTooltip({ active, payload }: { active?: boolean; payload?: { value: number }[] }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg bg-market-lightText px-3 py-2 text-xs text-white shadow-lg dark:bg-market-elevated">
      Kupiono: <strong>{payload[0].value}×</strong>
    </div>
  )
}

function CustomPieTooltip({ active, payload }: { active?: boolean; payload?: { name: string; value: number }[] }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg bg-market-lightText px-3 py-2 text-xs text-white shadow-lg dark:bg-market-elevated">
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
      <div className="flex flex-col items-center justify-center px-6 py-20 text-center text-market-lightMuted dark:text-market-muted">
        <div className="text-5xl mb-3">📊</div>
        <p className="font-brand text-lg font-bold text-market-lightText dark:text-market-text">Brak danych</p>
        <p className="text-sm mt-1">Statystyki pojawią się po pierwszych zakupach</p>
      </div>
    )
  }

  return (
    <div className="space-y-5 px-4 py-4 pb-28">

      {/* KPI Cards — 2×2 grid */}
      <div>
        <h2 className="mb-3 font-brand text-[11px] font-bold uppercase tracking-[0.1em] text-market-lightMuted dark:text-market-muted">
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
            tone="green"
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
            tone="green"
          />
        </div>
      </div>

      {/* Top products — horizontal bar chart */}
      {stats.topProducts.length > 0 && (
        <div className="rounded-2xl border border-market-lightBorder bg-market-lightSurface p-4 shadow-sm dark:border-white/[0.06] dark:bg-market-surface">
          <h2 className="mb-4 font-brand text-[11px] font-bold uppercase tracking-[0.1em] text-market-lightMuted dark:text-market-muted">
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
                  <stop offset="0%" stopColor="#a98bf0" />
                  <stop offset="100%" stopColor="#7fcb9e" />
                </linearGradient>
              </defs>
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="name"
                width={110}
                tick={{ fontSize: 12, fill: '#9aa79c', fontWeight: 600 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(127,203,158,0.08)' }} />
              <Bar dataKey="count" fill="url(#barGradient)" radius={[0, 6, 6, 0]} barSize={13} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Category distribution — donut chart */}
      {stats.topCategories.length > 0 && (
        <div className="rounded-2xl border border-market-lightBorder bg-market-lightSurface p-4 shadow-sm dark:border-white/[0.06] dark:bg-market-surface">
          <h2 className="mb-4 font-brand text-[11px] font-bold uppercase tracking-[0.1em] text-market-lightMuted dark:text-market-muted">
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
      <div className="rounded-2xl border border-market-lightBorder bg-market-lightSurface p-4 shadow-sm dark:border-white/[0.06] dark:bg-market-surface">
        <h2 className="mb-3 font-brand text-[11px] font-bold uppercase tracking-[0.1em] text-market-lightMuted dark:text-market-muted">
          Ulubione szablony
        </h2>
        {stats.topTemplates.length === 0 ? (
          <p className="py-2 text-sm text-market-lightMuted dark:text-market-muted">
            Użyj szablonu, żeby zobaczyć ranking ulubionych dań
          </p>
        ) : (
          <div className="space-y-2">
            {stats.topTemplates.map((t, i) => {
              const maxCount = stats.topTemplates[0].count
              const pct = Math.round((t.count / maxCount) * 100)
              return (
                <div key={t.name} className="flex items-center gap-3">
                  <span className="w-4 flex-shrink-0 text-right text-xs font-bold text-market-lightMuted dark:text-market-muted">
                    {i + 1}
                  </span>
                  <span className="text-base leading-none flex-shrink-0">{t.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="truncate text-sm font-semibold text-market-lightText dark:text-market-text">{t.name}</span>
                      <span className="ml-2 flex-shrink-0 text-xs font-semibold text-market-lightMuted dark:text-market-muted">{t.count}×</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-market-lightRaised dark:bg-market-raised">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-fresh-violetLight to-fresh-greenStrong dark:from-fresh-violet dark:to-fresh-green"
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
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-fresh-danger/30 text-sm font-bold text-fresh-danger transition-colors hover:bg-fresh-danger/10 focus:outline-none focus:ring-2 focus:ring-fresh-danger disabled:opacity-50"
        >
          <RotateCcw size={17} /> {resetting ? 'Resetowanie…' : 'Resetuj statystyki'}
        </button>
      </div>

    </div>
  )
}
