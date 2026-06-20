import type { SimulationResult, YearSnapshot } from './types'
import { formatPopulation, formatCurrency } from './engine'
import { MIGRATION_POLICY_LABELS } from './policies'

function describeDependency(ratio: number): string {
  if (ratio < 0.5) return 'a youthful workforce supports growth'
  if (ratio < 0.65) return 'dependency remains manageable'
  if (ratio < 0.8) return 'aging pressures intensify on workers'
  return 'a heavy elderly share strains pensions and care'
}

function describeMigration(net: number, population: number): string {
  const per1000 = (net / population) * 1000
  if (per1000 > 3) return 'strong net inflows expand the labor base'
  if (per1000 > 0.5) return 'modest immigration offsets natural decline'
  if (per1000 > -0.5) return 'migration is near neutral'
  return 'net outflows accelerate population loss'
}

export function buildYearNarrative(
  result: SimulationResult,
  yearIndex: number,
): string {
  const snap = result.trajectory[yearIndex]
  const base = result.baseline
  if (!snap) return ''

  const yearOffset = snap.year - result.baselineYear
  const policy = MIGRATION_POLICY_LABELS[result.scenario.migrationPolicy]

  if (yearOffset === 0) {
    return `${result.countryName} begins at ${formatPopulation(snap.population)} people with TFR ${snap.tfr}. Under the "${policy}" pathway, the cohort-component model projects how births, deaths, and migration reshape society.`
  }

  const popChange = ((snap.population - base.population) / base.population) * 100
  const popDirection =
    popChange > 2
      ? 'grows'
      : popChange < -2
        ? 'contracts'
        : 'remains broadly stable'

  const parts = [
    `By ${snap.year}, ${result.countryName} ${popDirection} to ${formatPopulation(snap.population)} (${popChange >= 0 ? '+' : ''}${popChange.toFixed(1)}% vs baseline).`,
    `Median age rises to ${snap.medianAge} years; ${describeDependency(snap.dependencyRatio)}.`,
    describeMigration(snap.netMigration, snap.population).charAt(0).toUpperCase() +
      describeMigration(snap.netMigration, snap.population).slice(1) +
      '.',
    `GDP per capita reaches ${formatCurrency(snap.gdpPerCapita)}; health index ${snap.healthIndex.toFixed(0)}, wealth index ${snap.wealthIndex.toFixed(0)}.`,
  ]

  if (yearOffset <= 5 && result.scenario.migrationPolicy === 'mass_deportation') {
    parts.push(
      'Early-year labor market disruption from deportation is modeled as reduced productivity and tax base.',
    )
  }

  if (snap.tfr < 1.5 && yearOffset > 10) {
    parts.push(
      `Fertility at ${snap.tfr} remains far below replacement — long-run decline depends heavily on migration policy.`,
    )
  }

  return parts.join(' ')
}

export function buildHorizonSummary(
  snap: YearSnapshot,
  baseline: YearSnapshot,
  countryName: string,
  horizonYears: number,
): string {
  const popDelta =
    ((snap.population - baseline.population) / baseline.population) * 100
  const gdpDelta =
    ((snap.gdpPerCapita - baseline.gdpPerCapita) / baseline.gdpPerCapita) * 100

  return `At the ${horizonYears}-year mark, ${countryName} has ${popDelta >= 0 ? 'grown' : 'shrunk'} ${Math.abs(popDelta).toFixed(1)}% in population and ${gdpDelta >= 0 ? 'gained' : 'lost'} ${Math.abs(gdpDelta).toFixed(1)}% in GDP per capita. Dependency ratio: ${snap.dependencyRatio.toFixed(2)}.`
}

export type SystemDomain = 'people' | 'economy' | 'health' | 'wealth'

export interface SystemMetric {
  domain: SystemDomain
  label: string
  value: number
  display: string
  trend: number
  description: string
}

export function buildSystemMetrics(
  snap: YearSnapshot,
  baseline: YearSnapshot,
): Array<SystemMetric> {
  return [
    {
      domain: 'people',
      label: 'Population',
      value: snap.population,
      display: formatPopulation(snap.population),
      trend:
        ((snap.population - baseline.population) / baseline.population) * 100,
      description: `Median age ${snap.medianAge} · TFR ${snap.tfr}`,
    },
    {
      domain: 'economy',
      label: 'GDP / capita',
      value: snap.gdpPerCapita,
      display: formatCurrency(snap.gdpPerCapita),
      trend:
        ((snap.gdpPerCapita - baseline.gdpPerCapita) / baseline.gdpPerCapita) *
        100,
      description: `Labor participation ${(snap.laborForceParticipation * 100).toFixed(0)}%`,
    },
    {
      domain: 'health',
      label: 'Health index',
      value: snap.healthIndex,
      display: snap.healthIndex.toFixed(0),
      trend: snap.healthIndex - baseline.healthIndex,
      description: `Life expectancy ${snap.lifeExpectancy} yrs · capacity ${snap.healthcareCapacityIndex.toFixed(2)}`,
    },
    {
      domain: 'wealth',
      label: 'Wealth index',
      value: snap.wealthIndex,
      display: snap.wealthIndex.toFixed(0),
      trend: snap.wealthIndex - baseline.wealthIndex,
      description: `Gini ${snap.inequalityIndex} · pension burden ${snap.pensionBurden.toFixed(2)}`,
    },
  ]
}
