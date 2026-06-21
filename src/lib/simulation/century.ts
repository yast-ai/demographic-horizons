import { buildRecordedSeries } from '../data/historical'
import {
  pctChange,
  runCounterfactualPast,
  runForwardFromBaseline,
  sumNetMigration,
} from './engine'
import { getCountryById } from '../data/countries'
import type {
  CenturyInsights,
  CenturyResult,
  PolicyScenario,
  YearSnapshot,
} from './types'
import {
  FUTURE_END,
  HISTORY_START,
  PRESENT_YEAR,
  PROJECTION_YEARS,
} from './types'

function recordedToSnapshots(
  recorded: Array<{ year: number; population: number; medianAge: number; tfr: number }>,
): Array<YearSnapshot> {
  return recorded.map((r, i) => {
    const prev = recorded[i - 1]
    const popChange = prev ? r.population - prev.population : 0
    const elderlyPct = clampElderlyFromMedianAge(r.medianAge)
    const youthPct = clampYouthFromMedianAge(r.medianAge)
    const workingAgePct = Math.max(0.1, 1 - youthPct - elderlyPct)

    return {
      year: r.year,
      population: r.population,
      births: Math.round(Math.max(popChange * 0.4, 0)),
      deaths: Math.round(Math.max(-popChange * 0.2, 0)),
      netMigration: prev ? Math.round(popChange * 0.35) : 0,
      tfr: r.tfr,
      medianAge: r.medianAge,
      dependencyRatio: Number(((youthPct + elderlyPct) / workingAgePct).toFixed(2)),
      elderlyPct,
    }
  })
}

function clampElderlyFromMedianAge(medianAge: number): number {
  return Math.min(0.25, Math.max(0.04, (medianAge - 30) * 0.012))
}

function clampYouthFromMedianAge(medianAge: number): number {
  return Math.min(0.45, Math.max(0.12, 0.42 - medianAge * 0.006))
}

export function runCenturyView(
  countryId: string,
  pastPolicy: PolicyScenario,
  futurePolicy: PolicyScenario,
  futureComparePolicy?: PolicyScenario,
): CenturyResult {
  const country = getCountryById(countryId)
  if (!country) {
    throw new Error(`Unknown country: ${countryId}`)
  }

  const recordedRaw = buildRecordedSeries(countryId)
  const recorded = recordedToSnapshots(recordedRaw)
  const counterfactualPast = runCounterfactualPast(countryId, pastPolicy)
  const future = runForwardFromBaseline(country, futurePolicy, PRESENT_YEAR, PROJECTION_YEARS)
  const futureCompare = futureComparePolicy
    ? runForwardFromBaseline(country, futureComparePolicy, PRESENT_YEAR, PROJECTION_YEARS)
    : undefined

  const timeline: Array<YearSnapshot> = [
    ...recorded.slice(0, -1),
    ...future,
  ]

  const pop1976 = recorded[0]!.population
  const popTodayActual = recorded[recorded.length - 1]!.population
  const popTodayCounter = counterfactualPast[counterfactualPast.length - 1]!.population
  const pop2076 = future[future.length - 1]!.population

  const insights: CenturyInsights = {
    population1976: pop1976,
    populationTodayActual: popTodayActual,
    populationTodayCounterfactual: popTodayCounter,
    population2076: pop2076,
    pastPolicyGapToday: popTodayActual - popTodayCounter,
    pastPolicyGapPctToday: pctChange(popTodayCounter, popTodayActual),
    futureChangePct: pctChange(popTodayActual, pop2076),
    cumulativeMigration1976: sumNetMigration(recorded),
    cumulativeMigrationCounterfactual: sumNetMigration(counterfactualPast),
  }

  const warnings: Array<string> = []
  if (country.tfr < 1.4) {
    warnings.push(`${country.name} is below 1.4 TFR — aging accelerates without migration.`)
  }
  if (Math.abs(insights.pastPolicyGapToday) > popTodayActual * 0.05) {
    warnings.push(
      `Alternate past policy would change today's population by ${formatGap(insights.pastPolicyGapToday)}.`,
    )
  }

  return {
    countryId,
    countryName: country.name,
    pastPolicy,
    futurePolicy,
    recorded,
    counterfactualPast,
    future,
    futureCompare,
    timeline,
    insights,
    warnings,
  }
}

function formatGap(n: number): string {
  const abs = Math.abs(n)
  const sign = n >= 0 ? '+' : '−'
  if (abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000) return `${sign}${(abs / 1_000).toFixed(0)}K`
  return `${sign}${abs}`
}

export function getTimelineIndex(year: number): number {
  return year - HISTORY_START
}

export function getYearFromIndex(index: number): number {
  return HISTORY_START + index
}

export { FUTURE_END, HISTORY_START, PRESENT_YEAR }
