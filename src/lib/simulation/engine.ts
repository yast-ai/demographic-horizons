import { getCountryById } from '../data/countries'
import { COUNTRY_HISTORICAL } from '../data/historical'
import {
  deportationShock,
  migrationMultiplier,
} from './policies'
import type {
  CountryBaseline,
  PolicyScenario,
  SimulationResult,
  YearSnapshot,
} from './types'
import {
  HISTORY_START,
  PRESENT_YEAR,
  PROJECTION_YEARS,
} from './types'

export {
  FUTURE_END,
  HISTORY_START,
  PRESENT_YEAR,
  PROJECTION_YEARS,
} from './types'

const REPLACEMENT_TFR = 2.1

interface InternalState {
  population: number
  tfr: number
  lifeExpectancy: number
  gdpPerCapita: number
  youthPct: number
  workingAgePct: number
  elderlyPct: number
  gini: number
  healthSpendingPct: number
  healthcareCapacity: number
  births: number
  deaths: number
  netMigration: number
  productivityGrowth: number
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function mortalityRate(lifeExpectancy: number): number {
  return clamp(1 / (lifeExpectancy * 0.95), 0.004, 0.025)
}

function birthRateFromTfr(tfr: number, workingAgePct: number): number {
  const reproductiveShare = workingAgePct * 0.45
  return (tfr * reproductiveShare) / 35
}

function computeMedianAge(
  youthPct: number,
  elderlyPct: number,
  workingAgePct: number,
): number {
  return youthPct * 10 + workingAgePct * 42 + elderlyPct * 75
}

function evolveAgeStructure(
  youth: number,
  working: number,
  elderly: number,
  births: number,
  deaths: number,
  netMigration: number,
  skilledShare: number,
  population: number,
): { youth: number; working: number; elderly: number } {
  const total = population + births - deaths + netMigration
  if (total <= 0) return { youth, working, elderly }

  const migrantWorkingBias = 0.55 + skilledShare * 0.25
  const birthYouth = births / total
  const deathElderly = (deaths * 0.72) / total
  const deathWorking = (deaths * 0.28) / total
  const migrantWorking = (netMigration * migrantWorkingBias) / total
  const migrantYouth = (netMigration * (1 - migrantWorkingBias) * 0.35) / total

  let newYouth = youth + birthYouth + migrantYouth - youth * 0.035
  let newWorking =
    working + youth * 0.035 - deathWorking + migrantWorking - working * 0.018
  let newElderly = elderly + working * 0.018 - deathElderly

  const sum = newYouth + newWorking + newElderly
  return {
    youth: newYouth / sum,
    working: newWorking / sum,
    elderly: newElderly / sum,
  }
}

function toSnapshot(year: number, state: InternalState): YearSnapshot {
  const dependencyRatio =
    (state.youthPct + state.elderlyPct) / Math.max(state.workingAgePct, 0.01)

  return {
    year,
    population: Math.round(state.population),
    births: Math.round(state.births),
    deaths: Math.round(state.deaths),
    netMigration: Math.round(state.netMigration),
    tfr: Number(state.tfr.toFixed(2)),
    medianAge: Number(
      computeMedianAge(state.youthPct, state.elderlyPct, state.workingAgePct).toFixed(1),
    ),
    dependencyRatio: Number(dependencyRatio.toFixed(2)),
    elderlyPct: Number(state.elderlyPct.toFixed(3)),
  }
}

function simulateYear(
  country: CountryBaseline,
  scenario: PolicyScenario,
  yearOffset: number,
  prev: Omit<InternalState, 'births' | 'deaths' | 'netMigration' | 'productivityGrowth'>,
): InternalState {
  const migMult = migrationMultiplier(scenario.migrationPolicy)
  const deportShock = deportationShock(scenario.migrationPolicy, yearOffset)

  const economicPressure = prev.gdpPerCapita < country.gdpPerCapita * 0.92 ? -0.02 : 0.01
  const tfrTarget =
    REPLACEMENT_TFR * (0.85 + scenario.birthRateIncentive * 0.2) + economicPressure
  const tfr = prev.tfr + (tfrTarget - prev.tfr) * 0.04

  const births = prev.population * birthRateFromTfr(tfr, prev.workingAgePct)
  const deaths = prev.population * mortalityRate(prev.lifeExpectancy)

  let netMigration =
    prev.population *
    ((country.netMigrationRate * migMult + scenario.refugeeIntakePer1000) / 1000)

  if (deportShock > 0) {
    netMigration -= prev.population * deportShock
  }
  if (scenario.migrationPolicy === 'restrictive') {
    netMigration -= prev.population * 0.0008
  }

  let population = prev.population + births - deaths + netMigration
  population = Math.max(population, prev.population * 0.5)

  const age = evolveAgeStructure(
    prev.youthPct,
    prev.workingAgePct,
    prev.elderlyPct,
    births,
    deaths,
    netMigration,
    scenario.skilledMigrationShare,
    prev.population,
  )

  const dependencyRatio = (age.youth + age.elderly) / Math.max(age.working, 0.01)
  const skilledBoost = scenario.skilledMigrationShare * 0.004 * Math.max(migMult, 0)
  const integrationBoost = scenario.integrationInvestment * 0.002
  const deportationDrag =
    scenario.migrationPolicy === 'mass_deportation' && yearOffset <= 8 ? -0.006 : 0
  const dependencyDrag = (dependencyRatio - 0.55) * 0.003

  const productivityGrowth =
    country.productivityGrowth +
    skilledBoost +
    integrationBoost +
    deportationDrag -
    dependencyDrag

  const laborForceGrowth =
    (netMigration * (0.55 + scenario.skilledMigrationShare * 0.25) +
      births * 0.02 -
      deaths * 0.01) /
    prev.population

  const gdpPerCapita =
    prev.gdpPerCapita * (1 + productivityGrowth + laborForceGrowth * 0.35)

  const leDelta =
    scenario.integrationInvestment * 0.04 +
    (scenario.migrationPolicy === 'mass_deportation' && yearOffset <= 5 ? -0.08 : 0.02)
  const lifeExpectancy = clamp(prev.lifeExpectancy + leDelta * 0.1, 52, 90)

  const giniDelta =
    scenario.skilledMigrationShare * 0.08 * Math.max(migMult - 1, 0) -
    scenario.integrationInvestment * 0.06
  const gini = clamp(prev.gini + giniDelta * 0.05, 25, 60)

  const healthSpendingPct = clamp(
    country.healthSpendingPctGdp * (1 + age.elderly * 0.15 + scenario.integrationInvestment * 0.05),
    2.5,
    20,
  )

  const healthcareCapacity = clamp(
    prev.healthcareCapacity +
      scenario.integrationInvestment * 0.008 -
      (population / country.population - 1) * 0.005,
    0.4,
    1.4,
  )

  return {
    population,
    tfr,
    lifeExpectancy,
    gdpPerCapita,
    youthPct: age.youth,
    workingAgePct: age.working,
    elderlyPct: age.elderly,
    gini,
    healthSpendingPct,
    healthcareCapacity,
    births,
    deaths,
    netMigration,
    productivityGrowth,
  }
}

function countryBaselineFrom1976(countryId: string): CountryBaseline | null {
  const modern = getCountryById(countryId)
  const hist = COUNTRY_HISTORICAL[countryId]
  if (!modern || !hist) return null

  const b = hist.baseline1976
  return {
    ...modern,
    population: b.population,
    tfr: b.tfr,
    lifeExpectancy: b.lifeExpectancy,
    netMigrationRate: b.netMigrationRate,
    youthPct: b.youthPct,
    workingAgePct: b.workingAgePct,
    elderlyPct: b.elderlyPct,
    giniIndex: b.giniIndex,
    productivityGrowth: b.productivityGrowth,
    dataYear: 1976,
  }
}

function initialStateFromBaseline(
  country: CountryBaseline,
  historicalStart: boolean,
): InternalState {
  return {
    population: country.population,
    tfr: country.tfr,
    lifeExpectancy: country.lifeExpectancy,
    gdpPerCapita: historicalStart ? country.gdpPerCapita * 0.35 : country.gdpPerCapita,
    youthPct: country.youthPct,
    workingAgePct: country.workingAgePct,
    elderlyPct: country.elderlyPct,
    gini: country.giniIndex,
    healthSpendingPct: country.healthSpendingPctGdp * (historicalStart ? 0.85 : 1),
    healthcareCapacity: historicalStart ? 0.85 : 1.0,
    births: 0,
    deaths: 0,
    netMigration: 0,
    productivityGrowth: country.productivityGrowth,
  }
}

/** Run simulation forward from a country baseline for N years */
export function runForwardFromBaseline(
  country: CountryBaseline,
  scenario: PolicyScenario,
  startYear: number,
  years: number,
  historicalStart = startYear <= HISTORY_START,
): Array<YearSnapshot> {
  let state: InternalState = initialStateFromBaseline(country, historicalStart)

  const trajectory: Array<YearSnapshot> = [
    toSnapshot(startYear, { ...state, births: 0, deaths: 0, netMigration: 0 }),
  ]

  for (let y = 1; y <= years; y++) {
    state = simulateYear(country, scenario, y, state)
    trajectory.push(toSnapshot(startYear + y, state))
  }

  return trajectory
}

export function runSimulation(
  countryId: string,
  scenario: PolicyScenario,
  maxYears: number = PROJECTION_YEARS,
): SimulationResult {
  const country = getCountryById(countryId)
  if (!country) {
    throw new Error(`Unknown country: ${countryId}`)
  }

  const warnings: Array<string> = []
  const methodologyNotes = [
    'Cohort-component model with annual time steps.',
    'Migration impacts age structure with working-age bias for skilled inflows.',
    'Recorded history (1976–2026) uses UN-aligned population anchors.',
    'Counterfactual past paths re-simulate from 1976 with alternate migration policy.',
    'Results are projections, not predictions.',
  ]

  if (country.tfr < 1.4) {
    warnings.push(
      `${country.name} is below 1.4 TFR. Long-run population decline is likely without migration.`,
    )
  }
  if (scenario.migrationPolicy === 'mass_deportation') {
    warnings.push('Deportation scenarios model labor-market disruption in early years.')
  }

  const trajectory = runForwardFromBaseline(country, scenario, PRESENT_YEAR, maxYears)
  const baseline = trajectory[0]!
  const horizon = trajectory[maxYears]!

  return {
    countryId: country.id,
    countryName: country.name,
    baselineYear: PRESENT_YEAR,
    scenario,
    baseline,
    horizon,
    trajectory,
    warnings,
    methodologyNotes,
  }
}

/** Counterfactual: what if pastPolicy applied from 1976 to 2026 */
export function runCounterfactualPast(
  countryId: string,
  pastPolicy: PolicyScenario,
): Array<YearSnapshot> {
  const country1976 = countryBaselineFrom1976(countryId)
  if (!country1976) {
    throw new Error(`No historical baseline for: ${countryId}`)
  }
  return runForwardFromBaseline(country1976, pastPolicy, HISTORY_START, PROJECTION_YEARS)
}

export function formatPopulation(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return n.toLocaleString()
}

export function pctChange(from: number, to: number): number {
  if (from === 0) return 0
  return ((to - from) / from) * 100
}

export function sumNetMigration(series: Array<YearSnapshot>): number {
  return series.reduce((s, p) => s + p.netMigration, 0)
}
