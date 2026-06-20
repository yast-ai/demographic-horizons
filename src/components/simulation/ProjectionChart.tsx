import { SimpleLineChart, Stat } from '#/components/charts/SimpleCharts'
import type { SimulationResult, HorizonYears } from '#/lib/simulation/types'
import { formatPopulation, formatCurrency, pctChange } from '#/lib/simulation/engine'
import { MIGRATION_POLICY_LABELS } from '#/lib/simulation/policies'

interface MetricsGridProps {
  result: SimulationResult
  horizon: HorizonYears
}

export function MetricsGrid({ result, horizon }: MetricsGridProps) {
  const snap = result.horizons[horizon]
  const base = result.baseline

  const metrics = [
    {
      label: 'Population',
      value: formatPopulation(snap.population),
      trend: `${pctChange(base.population, snap.population) >= 0 ? '+' : ''}${pctChange(base.population, snap.population).toFixed(1)}% vs today`,
      trendUp: snap.population >= base.population,
    },
    {
      label: 'Median age',
      value: `${snap.medianAge} years`,
      trend: `${snap.medianAge - base.medianAge >= 0 ? '+' : ''}${(snap.medianAge - base.medianAge).toFixed(1)} yrs vs today`,
      trendUp: snap.medianAge <= base.medianAge,
    },
    {
      label: 'Income per person',
      value: formatCurrency(snap.gdpPerCapita),
      trend: `${pctChange(base.gdpPerCapita, snap.gdpPerCapita) >= 0 ? '+' : ''}${pctChange(base.gdpPerCapita, snap.gdpPerCapita).toFixed(1)}% vs today`,
      trendUp: snap.gdpPerCapita >= base.gdpPerCapita,
    },
    {
      label: 'Elderly dependency',
      value: snap.dependencyRatio.toFixed(2),
      hint: 'Ratio of young + old to working-age',
      trend: `${snap.dependencyRatio - base.dependencyRatio >= 0 ? '+' : ''}${(snap.dependencyRatio - base.dependencyRatio).toFixed(2)} vs today`,
      trendUp: snap.dependencyRatio <= base.dependencyRatio,
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((m) => (
        <Stat
          key={m.label}
          label={m.label}
          value={m.value}
          hint={m.hint}
          trend={m.trend}
          trendUp={m.trendUp}
        />
      ))}
    </div>
  )
}

interface ProjectionChartProps {
  primary: SimulationResult
  secondary?: SimulationResult | null
}

export function PopulationChart({ primary, secondary }: ProjectionChartProps) {
  const data = primary.trajectory
    .filter((_, i) => i % 2 === 0)
    .map((point, idx) => {
      const realIdx = idx * 2
      return {
        year: point.year,
        selected: Math.round(point.population / 1_000_000),
        ...(secondary
          ? { compare: Math.round(secondary.trajectory[realIdx]!.population / 1_000_000) }
          : {}),
      }
    })

  const lines = [
    {
      key: 'selected',
      label: MIGRATION_POLICY_LABELS[primary.scenario.migrationPolicy],
      color: '#2563eb',
    },
  ]
  if (secondary) {
    lines.push({
      key: 'compare',
      label: MIGRATION_POLICY_LABELS[secondary.scenario.migrationPolicy],
      color: '#ea580c',
    })
  }

  return (
    <div className="rounded-xl border border-border bg-white p-5 sm:p-6">
      <h3 className="text-base font-semibold text-ink">Population over time</h3>
      <p className="mt-1 text-sm text-ink-muted">Millions of people, {primary.countryName}</p>
      <div className="mt-5">
        <SimpleLineChart
          data={data}
          xKey="year"
          lines={lines}
          yLabel="Millions"
          formatY={(v) => `${v}M`}
        />
      </div>
    </div>
  )
}

export function IncomeChart({ primary, secondary }: ProjectionChartProps) {
  const data = primary.trajectory
    .filter((_, i) => i % 2 === 0)
    .map((point, idx) => {
      const realIdx = idx * 2
      return {
        year: point.year,
        selected: Math.round(point.gdpPerCapita / 1000),
        ...(secondary
          ? { compare: Math.round(secondary.trajectory[realIdx]!.gdpPerCapita / 1000) }
          : {}),
      }
    })

  const lines = [
    {
      key: 'selected',
      label: MIGRATION_POLICY_LABELS[primary.scenario.migrationPolicy],
      color: '#2563eb',
    },
  ]
  if (secondary) {
    lines.push({
      key: 'compare',
      label: MIGRATION_POLICY_LABELS[secondary.scenario.migrationPolicy],
      color: '#ea580c',
    })
  }

  return (
    <div className="rounded-xl border border-border bg-white p-5 sm:p-6">
      <h3 className="text-base font-semibold text-ink">Income per person</h3>
      <p className="mt-1 text-sm text-ink-muted">GDP per capita in thousands of dollars</p>
      <div className="mt-5">
        <SimpleLineChart
          data={data}
          xKey="year"
          lines={lines}
          yLabel="Thousands ($)"
          formatY={(v) => `$${v}k`}
        />
      </div>
    </div>
  )
}

interface HorizonTabsProps {
  horizon: HorizonYears
  onChange: (h: HorizonYears) => void
}

export function HorizonTabs({ horizon, onChange }: HorizonTabsProps) {
  const options: Array<HorizonYears> = [10, 20, 50]

  return (
    <div className="inline-flex rounded-lg border border-border bg-white p-1">
      {options.map((h) => (
        <button
          key={h}
          type="button"
          onClick={() => onChange(h)}
          className={`rounded-md px-4 py-2 text-sm font-medium transition ${
            horizon === h
              ? 'bg-accent text-white'
              : 'text-ink-muted hover:text-ink'
          }`}
        >
          {h} years
        </button>
      ))}
    </div>
  )
}
