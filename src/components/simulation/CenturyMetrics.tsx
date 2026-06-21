import { Stat } from '#/components/charts/SimpleCharts'
import type { CenturyResult, YearSnapshot } from '#/lib/simulation/types'
import { formatPopulation, pctChange } from '#/lib/simulation/engine'
import { PRESENT_YEAR } from '#/lib/simulation/types'

interface CenturyMetricsProps {
  result: CenturyResult
  yearSnap: YearSnapshot
}

export function CenturyMetrics({ result, yearSnap }: CenturyMetricsProps) {
  const { insights } = result
  const isPast = yearSnap.year <= PRESENT_YEAR
  const base1976 = result.recorded[0]!

  const metrics = isPast
    ? [
        {
          label: 'Population',
          value: formatPopulation(yearSnap.population),
          trend: `${pctChange(base1976.population, yearSnap.population) >= 0 ? '+' : ''}${pctChange(base1976.population, yearSnap.population).toFixed(1)}% since 1976`,
          trendUp: yearSnap.population >= base1976.population,
        },
        {
          label: 'Median age',
          value: `${yearSnap.medianAge} yrs`,
          hint: 'Population aging over the century',
        },
        {
          label: 'Fertility (TFR)',
          value: yearSnap.tfr.toFixed(2),
          hint: 'Children per woman',
        },
        {
          label: 'Net migration (year)',
          value: formatPopulation(Math.abs(yearSnap.netMigration)),
          trend: yearSnap.netMigration >= 0 ? 'Net inflow' : 'Net outflow',
          trendUp: yearSnap.netMigration >= 0,
        },
      ]
    : [
        {
          label: 'Population',
          value: formatPopulation(yearSnap.population),
          trend: `${pctChange(insights.populationTodayActual, yearSnap.population) >= 0 ? '+' : ''}${pctChange(insights.populationTodayActual, yearSnap.population).toFixed(1)}% from today`,
          trendUp: yearSnap.population >= insights.populationTodayActual,
        },
        {
          label: 'Median age',
          value: `${yearSnap.medianAge} yrs`,
          trend: `${(yearSnap.medianAge - result.recorded[result.recorded.length - 1]!.medianAge).toFixed(1)} yrs vs today`,
          trendUp: yearSnap.medianAge <= result.recorded[result.recorded.length - 1]!.medianAge,
        },
        {
          label: 'Elderly share',
          value: `${(yearSnap.elderlyPct * 100).toFixed(1)}%`,
          hint: 'Share of population 65+',
        },
        {
          label: 'Dependency ratio',
          value: yearSnap.dependencyRatio.toFixed(2),
          hint: 'Young + old relative to working-age',
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
