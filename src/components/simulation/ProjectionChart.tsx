import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { SimulationResult, HorizonYears } from '#/lib/simulation/types'
import { formatPopulation, formatCurrency, pctChange } from '#/lib/simulation/engine'

interface MetricsGridProps {
  result: SimulationResult
  horizon: HorizonYears
  compareResult?: SimulationResult | null
}

export function MetricsGrid({ result, horizon, compareResult }: MetricsGridProps) {
  const snap = result.horizons[horizon]
  const base = result.baseline
  const compareSnap = compareResult?.horizons[horizon]

  const metrics = [
    {
      label: 'Population',
      value: formatPopulation(snap.population),
      delta: pctChange(base.population, snap.population),
      compareDelta: compareSnap
        ? pctChange(compareSnap.population, snap.population)
        : null,
    },
    {
      label: 'Median age',
      value: `${snap.medianAge} yrs`,
      delta: snap.medianAge - base.medianAge,
      compareDelta: compareSnap ? snap.medianAge - compareSnap.medianAge : null,
      isAbsolute: true,
    },
    {
      label: 'GDP per capita',
      value: formatCurrency(snap.gdpPerCapita),
      delta: pctChange(base.gdpPerCapita, snap.gdpPerCapita),
      compareDelta: compareSnap
        ? pctChange(compareSnap.gdpPerCapita, snap.gdpPerCapita)
        : null,
    },
    {
      label: 'Health index',
      value: snap.healthIndex.toFixed(0),
      delta: snap.healthIndex - base.healthIndex,
      compareDelta: compareSnap ? snap.healthIndex - compareSnap.healthIndex : null,
      isAbsolute: true,
    },
    {
      label: 'Wealth index',
      value: snap.wealthIndex.toFixed(0),
      delta: snap.wealthIndex - base.wealthIndex,
      compareDelta: compareSnap ? snap.wealthIndex - compareSnap.wealthIndex : null,
      isAbsolute: true,
    },
    {
      label: 'Dependency ratio',
      value: snap.dependencyRatio.toFixed(2),
      delta: snap.dependencyRatio - base.dependencyRatio,
      compareDelta: compareSnap
        ? snap.dependencyRatio - compareSnap.dependencyRatio
        : null,
      isAbsolute: true,
      invertColor: true,
    },
  ]

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {metrics.map((m) => (
        <div
          key={m.label}
          className="rounded-sm border border-border bg-white p-4 shadow-sm"
        >
          <p className="text-xs font-medium uppercase tracking-wider text-ink-muted">
            {m.label}
          </p>
          <p className="mt-1 font-display text-2xl text-ink">{m.value}</p>
          <p
            className={`mt-1 text-xs font-medium ${
              m.invertColor
                ? m.delta > 0
                  ? 'text-accent'
                  : 'text-sage'
                : m.delta >= 0
                  ? 'text-sage'
                  : 'text-accent'
            }`}
          >
            {m.isAbsolute
              ? `${m.delta >= 0 ? '+' : ''}${m.delta.toFixed(1)} vs baseline`
              : `${m.delta >= 0 ? '+' : ''}${m.delta.toFixed(1)}% vs baseline`}
          </p>
          {m.compareDelta != null && (
            <p className="mt-0.5 text-xs text-ink-muted">
              {m.isAbsolute
                ? `${m.compareDelta >= 0 ? '+' : ''}${m.compareDelta.toFixed(1)} vs comparison`
                : `${m.compareDelta >= 0 ? '+' : ''}${m.compareDelta.toFixed(1)}% vs comparison`}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}

interface ProjectionChartProps {
  primary: SimulationResult
  secondary?: SimulationResult | null
}

export function ProjectionChart({ primary, secondary }: ProjectionChartProps) {
  const data = primary.trajectory.map((point, i) => ({
    year: point.year,
    population: point.population / 1_000_000,
    gdpPerCapita: point.gdpPerCapita / 1000,
    healthIndex: point.healthIndex,
    wealthIndex: point.wealthIndex,
    comparePop: secondary ? secondary.trajectory[i]!.population / 1_000_000 : undefined,
  }))

  return (
    <div className="rounded-sm border border-border bg-white p-4 shadow-sm lg:p-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
        50-year trajectory
      </p>
      <div className="mt-4 h-72 w-full sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(12,18,34,0.08)" />
            <XAxis
              dataKey="year"
              tick={{ fontSize: 11, fill: '#3d4a63' }}
              tickLine={false}
            />
            <YAxis
              yAxisId="pop"
              tick={{ fontSize: 11, fill: '#3d4a63' }}
              tickLine={false}
              label={{
                value: 'Population (M)',
                angle: -90,
                position: 'insideLeft',
                style: { fontSize: 10, fill: '#3d4a63' },
              }}
            />
            <YAxis
              yAxisId="index"
              orientation="right"
              domain={[0, 100]}
              tick={{ fontSize: 11, fill: '#3d4a63' }}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: '#f7f3eb',
                border: '1px solid rgba(12,18,34,0.1)',
                borderRadius: 4,
                fontSize: 12,
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line
              yAxisId="pop"
              type="monotone"
              dataKey="population"
              name={`${primary.countryName} population`}
              stroke="#c45c3a"
              strokeWidth={2}
              dot={false}
            />
            {secondary && (
              <Line
                yAxisId="pop"
                type="monotone"
                dataKey="comparePop"
                name={`${secondary.countryName} (compare)`}
                stroke="#4a6b5d"
                strokeWidth={2}
                strokeDasharray="6 4"
                dot={false}
              />
            )}
            <Line
              yAxisId="index"
              type="monotone"
              dataKey="healthIndex"
              name="Health index"
              stroke="#7a9a8a"
              strokeWidth={1.5}
              dot={false}
            />
            <Line
              yAxisId="index"
              type="monotone"
              dataKey="wealthIndex"
              name="Wealth index"
              stroke="#b8956a"
              strokeWidth={1.5}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export function PopulationAreaChart({ result }: { result: SimulationResult }) {
  const data = result.trajectory.map((p) => ({
    year: p.year,
    births: p.births / 1000,
    deaths: -(p.deaths / 1000),
    migration: p.netMigration / 1000,
  }))

  return (
    <div className="rounded-sm border border-border bg-white p-4 shadow-sm lg:p-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
        Population change components (thousands / year)
      </p>
      <div className="mt-4 h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(12,18,34,0.08)" />
            <XAxis dataKey="year" tick={{ fontSize: 11 }} tickLine={false} />
            <YAxis tick={{ fontSize: 11 }} tickLine={false} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Area
              type="monotone"
              dataKey="births"
              stackId="1"
              stroke="#4a6b5d"
              fill="#7a9a8a"
              name="Births"
            />
            <Area
              type="monotone"
              dataKey="migration"
              stackId="1"
              stroke="#c45c3a"
              fill="#e8a48a"
              name="Net migration"
            />
            <Area
              type="monotone"
              dataKey="deaths"
              stackId="1"
              stroke="#1a2332"
              fill="#3d4a63"
              name="Deaths"
            />
          </AreaChart>
        </ResponsiveContainer>
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
    <div className="inline-flex rounded-sm border border-border bg-paper-warm p-1">
      {options.map((h) => (
        <button
          key={h}
          type="button"
          onClick={() => onChange(h)}
          className={`rounded-sm px-4 py-2 text-sm font-medium transition ${
            horizon === h
              ? 'bg-white text-ink shadow-sm'
              : 'text-ink-muted hover:text-ink'
          }`}
        >
          {h} years
        </button>
      ))}
    </div>
  )
}
