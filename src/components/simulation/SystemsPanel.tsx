import type { SimulationResult } from '#/lib/simulation/types'
import { buildSystemMetrics } from '#/lib/simulation/narrative'

const DOMAIN_COLORS: Record<string, string> = {
  people: '#c45c3a',
  economy: '#b8956a',
  health: '#4a6b5d',
  wealth: '#1a2332',
}

interface SystemsPanelProps {
  result: SimulationResult
  yearIndex: number
}

export function SystemsPanel({ result, yearIndex }: SystemsPanelProps) {
  const snap = result.trajectory[yearIndex] ?? result.baseline
  const metrics = buildSystemMetrics(snap, result.baseline)

  return (
    <section className="rounded-sm border border-border bg-slate-deep p-5 text-paper shadow-sm sm:p-6">
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
            Interconnected systems
          </p>
          <p className="mt-1 font-display text-xl sm:text-2xl">
            {result.countryName} · {snap.year}
          </p>
        </div>
        <p className="hidden text-right text-xs text-paper/50 sm:block">
          People → Economy → Health → Wealth
        </p>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => {
          const color = DOMAIN_COLORS[m.domain] ?? '#c45c3a'
          const isPct = m.domain === 'people' || m.domain === 'economy'
          const trendLabel = isPct
            ? `${m.trend >= 0 ? '+' : ''}${m.trend.toFixed(1)}%`
            : `${m.trend >= 0 ? '+' : ''}${m.trend.toFixed(1)}`

          return (
            <div
              key={m.domain}
              className="group relative overflow-hidden rounded-sm border border-white/10 bg-white/5 p-4 transition hover:border-white/20"
            >
              <div
                className="absolute inset-x-0 bottom-0 h-1 origin-left transition-transform duration-500 group-hover:scale-x-100"
                style={{
                  background: color,
                  transform: `scaleX(${Math.min(Math.abs(m.trend) / 30, 1)})`,
                }}
              />
              <p className="text-[10px] font-semibold uppercase tracking-widest text-paper/50">
                {m.label}
              </p>
              <p className="mt-2 font-display text-2xl" style={{ color }}>
                {m.display}
              </p>
              <p
                className={`mt-1 text-xs font-medium ${
                  m.trend >= 0 ? 'text-sage-light' : 'text-accent-soft'
                }`}
              >
                {trendLabel} vs 2026
              </p>
              <p className="mt-2 text-[11px] leading-snug text-paper/55">
                {m.description}
              </p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
