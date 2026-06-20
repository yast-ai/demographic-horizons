import type { SimulationResult } from '#/lib/simulation/types'
import { buildYearNarrative } from '#/lib/simulation/narrative'

interface ScenarioNarrativeProps {
  result: SimulationResult
  yearIndex: number
}

export function ScenarioNarrative({ result, yearIndex }: ScenarioNarrativeProps) {
  const narrative = buildYearNarrative(result, yearIndex)
  const snap = result.trajectory[yearIndex]

  return (
    <article className="relative overflow-hidden rounded-sm border border-border bg-gradient-to-br from-white via-paper to-paper-warm p-6 shadow-sm">
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-accent/5" />
      <div className="relative">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sage">
          Simulation narrative · {snap?.year ?? result.baselineYear}
        </p>
        <p className="mt-4 text-base leading-relaxed text-ink">{narrative}</p>
        <p className="mt-4 font-mono text-[10px] uppercase tracking-wider text-ink-muted/70">
          Cohort-component projection · not a forecast
        </p>
      </div>
    </article>
  )
}
