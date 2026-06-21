import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { CHART, changeColor } from '#/components/charts/SimpleCharts'
import type { CenturyResult } from '#/lib/simulation/types'
import { PRESENT_YEAR } from '#/lib/simulation/types'
import { formatPopulation } from '#/lib/simulation/engine'
import { MIGRATION_POLICY_LABELS } from '#/lib/simulation/policies'

const tooltipStyle = {
  background: '#fff',
  border: '1px solid #e8eaed',
  borderRadius: 8,
  fontSize: 13,
  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
}

interface CenturyPopulationChartProps {
  result: CenturyResult
}

export function CenturyPopulationChart({ result }: CenturyPopulationChartProps) {
  const data = buildChartData(result)

  return (
    <div className="rounded-xl border border-border bg-white p-5 sm:p-6">
      <h3 className="text-base font-semibold text-ink">Immigration & population — 100 years</h3>
      <p className="mt-1 text-sm text-ink-muted">
        How migration shaped headcount: recorded history (1976–2026), counterfactual past
        policies, and projected future (2026–2076)
      </p>
      <div className="mt-5 h-[380px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 12, right: 12, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} vertical={false} />
            <ReferenceArea
              x1={1976}
              x2={PRESENT_YEAR}
              fill="#f1f5f9"
              fillOpacity={0.6}
              strokeOpacity={0}
            />
            <ReferenceArea
              x1={PRESENT_YEAR}
              x2={2076}
              fill="#eff6ff"
              fillOpacity={0.5}
              strokeOpacity={0}
            />
            <XAxis
              dataKey="year"
              tick={{ fill: CHART.text, fontSize: 11 }}
              tickLine={false}
              interval={9}
            />
            <YAxis
              tick={{ fill: CHART.text, fontSize: 11 }}
              tickLine={false}
              tickFormatter={(v: number) => `${v}M`}
              width={48}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              labelFormatter={(year) => `Year ${year}${Number(year) === PRESENT_YEAR ? ' (today)' : ''}`}
              formatter={(v, name) => {
                const num = typeof v === 'number' ? v : 0
                const labels: Record<string, string> = {
                  recorded: 'Recorded history',
                  counterfactual: 'If past policy differed',
                  future: 'Future projection',
                  futureCompare: 'Future compare',
                }
                return [`${num}M people`, labels[String(name)] ?? String(name)]
              }}
            />
            <ReferenceLine
              x={PRESENT_YEAR}
              stroke={CHART.ink}
              strokeWidth={2}
              strokeDasharray="4 4"
              label={{
                value: 'Today · 2026',
                position: 'insideTopRight',
                fill: CHART.ink,
                fontSize: 11,
                fontWeight: 600,
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
              formatter={(value: string) => {
                if (value === 'recorded') return 'Recorded (1976–2026)'
                if (value === 'counterfactual') {
                  return `If ${MIGRATION_POLICY_LABELS[result.pastPolicy.migrationPolicy]} since 1976`
                }
                if (value === 'future') {
                  return `${MIGRATION_POLICY_LABELS[result.futurePolicy.migrationPolicy]} (2026–2076)`
                }
                if (value === 'futureCompare' && result.futureCompare) {
                  return 'Future compare policy'
                }
                return value
              }}
            />
            <Line
              type="monotone"
              dataKey="recorded"
              name="recorded"
              stroke={CHART.ink}
              strokeWidth={2.5}
              dot={false}
              connectNulls={false}
            />
            <Line
              type="monotone"
              dataKey="counterfactual"
              name="counterfactual"
              stroke={CHART.orange}
              strokeWidth={2}
              strokeDasharray="6 4"
              dot={false}
              connectNulls={false}
            />
            <Line
              type="monotone"
              dataKey="future"
              name="future"
              stroke={CHART.blue}
              strokeWidth={2.5}
              dot={false}
              connectNulls={false}
            />
            {result.futureCompare && (
              <Line
                type="monotone"
                dataKey="futureCompare"
                name="futureCompare"
                stroke={CHART.green}
                strokeWidth={2}
                strokeDasharray="4 3"
                dot={false}
                connectNulls={false}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 grid gap-3 border-t border-border pt-4 sm:grid-cols-3">
        <Insight
          label="1976 population"
          value={formatPopulation(result.insights.population1976)}
        />
        <Insight
          label="Today — actual vs counterfactual"
          value={formatPopulation(result.insights.populationTodayActual)}
          sub={
            result.insights.pastPolicyGapToday !== 0
              ? `${result.insights.pastPolicyGapToday > 0 ? '+' : ''}${formatPopulation(result.insights.pastPolicyGapToday)} vs alternate past policy`
              : 'Same as alternate past policy'
          }
          subDelta={result.insights.pastPolicyGapToday}
        />
        <Insight
          label="2076 projection"
          value={formatPopulation(result.insights.population2076)}
          sub={`${result.insights.futureChangePct >= 0 ? '+' : ''}${result.insights.futureChangePct.toFixed(1)}% from today`}
          subDelta={result.insights.futureChangePct}
        />
      </div>
    </div>
  )
}

function Insight({
  label,
  value,
  sub,
  subDelta,
}: {
  label: string
  value: string
  sub?: string
  subDelta?: number
}) {
  const subColor =
    subDelta !== undefined && subDelta !== 0
      ? subDelta > 0
        ? 'text-green'
        : 'text-red'
      : 'text-ink-muted'

  return (
    <div className="text-sm">
      <p className="text-ink-muted">{label}</p>
      <p className="mt-0.5 font-semibold tabular-nums text-ink">{value}</p>
      {sub && <p className={`mt-0.5 text-xs font-medium ${subColor}`}>{sub}</p>}
    </div>
  )
}

interface MigrationFlowChartProps {
  result: CenturyResult
}

export function MigrationFlowChart({ result }: MigrationFlowChartProps) {
  const data = buildMigrationData(result)

  return (
    <div className="rounded-xl border border-border bg-white p-5 sm:p-6">
      <h3 className="text-base font-semibold text-ink">Net immigration flow</h3>
      <p className="mt-1 text-sm text-ink-muted">
        Annual net migrants — green inflow, red outflow; recorded vs counterfactual past policy
      </p>
      <div className="mt-5 h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} vertical={false} />
            <XAxis dataKey="year" tick={{ fill: CHART.text, fontSize: 11 }} interval={9} />
            <YAxis
              tick={{ fill: CHART.text, fontSize: 11 }}
              tickFormatter={(v: number) => `${v >= 0 ? '+' : ''}${v}M`}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(v, name) => {
                const num = typeof v === 'number' ? v : 0
                const labels: Record<string, string> = {
                  recorded: 'Recorded est.',
                  counterfactual: 'Counterfactual',
                  future: 'Future projection',
                }
                return [`${num >= 0 ? '+' : ''}${num}M`, labels[String(name)] ?? String(name)]
              }}
            />
            <ReferenceLine y={0} stroke={CHART.ink} strokeOpacity={0.35} />
            <ReferenceLine x={PRESENT_YEAR} stroke={CHART.ink} strokeDasharray="4 4" />
            <Bar dataKey="recorded" name="recorded" maxBarSize={6} isAnimationActive={false}>
              {data.map((entry) => (
                <Cell
                  key={`rec-${entry.year}`}
                  fill={
                    entry.recorded !== undefined
                      ? changeColor(entry.recorded)
                      : 'transparent'
                  }
                />
              ))}
            </Bar>
            <Line
              type="monotone"
              dataKey="counterfactual"
              name="counterfactual"
              stroke={CHART.orange}
              strokeWidth={2}
              strokeDasharray="5 3"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="future"
              name="future"
              stroke={CHART.blue}
              strokeWidth={2}
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function buildChartData(result: CenturyResult) {
  const years = new Set<number>()
  for (const s of result.recorded) years.add(s.year)
  for (const s of result.counterfactualPast) years.add(s.year)
  for (const s of result.future) years.add(s.year)
  if (result.futureCompare) {
    for (const s of result.futureCompare) years.add(s.year)
  }

  const sorted = [...years].sort((a, b) => a - b)
  const rec = new Map(result.recorded.map((s) => [s.year, s]))
  const counter = new Map(result.counterfactualPast.map((s) => [s.year, s]))
  const fut = new Map(result.future.map((s) => [s.year, s]))
  const futCmp = new Map(result.futureCompare?.map((s) => [s.year, s]) ?? [])

  return sorted.map((year) => ({
    year,
    recorded:
      year <= PRESENT_YEAR && rec.has(year)
        ? Math.round(rec.get(year)!.population / 1_000_000)
        : undefined,
    counterfactual:
      year <= PRESENT_YEAR && counter.has(year)
        ? Math.round(counter.get(year)!.population / 1_000_000)
        : undefined,
    future:
      year >= PRESENT_YEAR && fut.has(year)
        ? Math.round(fut.get(year)!.population / 1_000_000)
        : undefined,
    futureCompare:
      year >= PRESENT_YEAR && futCmp.has(year)
        ? Math.round(futCmp.get(year)!.population / 1_000_000)
        : undefined,
  }))
}

function buildMigrationData(result: CenturyResult) {
  const years = new Set<number>()
  for (const s of [...result.recorded, ...result.counterfactualPast, ...result.future]) {
    years.add(s.year)
  }

  const sorted = [...years].sort((a, b) => a - b)
  const rec = new Map(result.recorded.map((s) => [s.year, s]))
  const counter = new Map(result.counterfactualPast.map((s) => [s.year, s]))
  const fut = new Map(result.future.map((s) => [s.year, s]))

  return sorted
    .filter((_, i) => i % 2 === 0)
    .map((year) => ({
      year,
      recorded:
        year <= PRESENT_YEAR && rec.has(year)
          ? Math.round(rec.get(year)!.netMigration / 1_000_000)
          : undefined,
      counterfactual:
        year <= PRESENT_YEAR && counter.has(year)
          ? Math.round(counter.get(year)!.netMigration / 1_000_000)
          : undefined,
      future:
        year >= PRESENT_YEAR && fut.has(year)
          ? Math.round(fut.get(year)!.netMigration / 1_000_000)
          : undefined,
    }))
}
