import { getCountryById } from '../data/countries'
import {
  deportationShock,
  migrationMultiplier,
} from './policies'
import type {
  CountryBaseline,
  HorizonYears,
  PolicyScenario,
  SimulationResult,
  YearSnapshot,
} from './types'

const REPLACEMENT_TFR = 2.1
const BASELINE_YEAR = 2026
const HORIZONS: Array<HorizonYears> = [10, 20, 50]

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function mortalityRate(lifeExpectancy: number): number {
  // Gompertz-style approximation: higher LE → lower crude death rate
  return clamp(1 / (lifeExpectancy * 0.95), 0.004, 0.025)
}

function birthRateFromTfr(tfr: number, workingAgePct: number): number {
  // Crude birth rate approximation from TFR and age structure
  const reproductiveShare = workingAgePct * 0.45
  return (tfr * reproductiveShare) / 35
}

function computeMedianAge(
  youthPct: number,
  elderlyPct: number,
  workingAgePct: number,
): number {
  const youthAge = 10
  const workingAge = 42
  const elderlyAge = 75
  return youthPct * youthAge + workingAgePct * workingAge + elderlyPct * elderlyAge
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

function computeHealthIndex(
  lifeExpectancy: number,
  healthSpendingPct: number,
  elderlyPct: number,
  healthcareCapacity: number,
  integration: number,
): number {
  const leScore = (lifeExpectancy / 85) * 40
  const spendScore = Math.min(healthSpendingPct / 12, 1.2) * 25
  const capacityScore = healthcareCapacity * 20
  const agingPenalty = elderlyPct * 8
  const integrationBonus = integration * 5
  return clamp(leScore + spendScore + capacityScore - agingPenalty + integrationBonus, 20, 100)
}

function computeWealthIndex(
  gdpPerCapita: number,
  gini: number,
  dependencyRatio: number,
  productivityTrend: number,
): number {
  const incomeScore = Math.log10(gdpPerCapita / 1000) * 22
  const equalityBonus = ((50 - gini) / 50) * 12
  const dependencyPenalty = (dependencyRatio - 0.5) * 15
  const productivityBonus = productivityTrend * 100
  return clamp(incomeScore + equalityBonus - dependencyPenalty + productivityBonus, 15, 100)
}

function createSnapshot(
  year: number,
  country: CountryBaseline,
  state: {
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
  },
  integration: number,
  productivityGrowth: number,
): YearSnapshot {
  const dependencyRatio =
    (state.youthPct + state.elderlyPct) / Math.max(state.workingAgePct, 0.01)
  const laborForceParticipation = clamp(
    state.workingAgePct * (0.88 - state.elderlyPct * 0.15),
    0.45,
    0.75,
  )
  const pensionBurden = state.elderlyPct / Math.max(laborForceParticipation, 0.01)

  return {
    year,
    population: Math.round(state.population),
    births: Math.round(state.births),
    deaths: Math.round(state.deaths),
    netMigration: Math.round(state.netMigration),
    tfr: Number(state.tfr.toFixed(2)),
    medianAge: Number(
      computeMedianAge(state.youthPct, state.workingAgePct, state.elderlyPct).toFixed(1),
    ),
    lifeExpectancy: Number(state.lifeExpectancy.toFixed(1)),
    gdpPerCapita: Math.round(state.gdpPerCapita),
    gdpTotal: Math.round(state.gdpPerCapita * state.population),
    dependencyRatio: Number(dependencyRatio.toFixed(2)),
    laborForceParticipation: Number(laborForceParticipation.toFixed(2)),
    healthIndex: Number(
      computeHealthIndex(
        state.lifeExpectancy,
        state.healthSpendingPct,
        state.elderlyPct,
        state.healthcareCapacity,
        integration,
      ).toFixed(1),
    ),
    wealthIndex: Number(
      computeWealthIndex(
        state.gdpPerCapita,
        state.gini,
        dependencyRatio,
        productivityGrowth,
      ).toFixed(1),
    ),
    inequalityIndex: Number(state.gini.toFixed(1)),
    pensionBurden: Number(pensionBurden.toFixed(2)),
    healthcareCapacityIndex: Number(state.healthcareCapacity.toFixed(2)),
  }
}

function simulateYear(
  country: CountryBaseline,
  scenario: PolicyScenario,
  yearOffset: number,
  prev: {
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
  },
): {
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
} {
  const migMult = migrationMultiplier(scenario.migrationPolicy)
  const deportShock = deportationShock(scenario.migrationPolicy, yearOffset)

  // TFR dynamics: pro-natal policies + economic feedback
  const economicPressure = prev.gdpPerCapita < country.gdpPerCapita * 0.92 ? -0.02 : 0.01
  const tfrTarget =
    REPLACEMENT_TFR * (0.85 + scenario.birthRateIncentive * 0.2) + economicPressure
  const tfr = prev.tfr + (tfrTarget - prev.tfr) * 0.04

  const births = prev.population * birthRateFromTfr(tfr, prev.workingAgePct)
  const deaths = prev.population * mortalityRate(prev.lifeExpectancy)

  let netMigration =
    prev.population *
    ((country.netMigrationRate * migMult + scenario.refugeeIntakePer1000) / 1000)

  // Deportation shock
  if (deportShock > 0) {
    netMigration -= prev.population * deportShock
  }

  // Restrictive policies increase emigration among recent immigrants
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

  // Productivity: skilled migration boosts, dependency & deportation disrupt
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

  // Life expectancy: integration + health spending; deportation stress reduces LE
  const leDelta =
    scenario.integrationInvestment * 0.04 +
    (scenario.migrationPolicy === 'mass_deportation' && yearOffset <= 5 ? -0.08 : 0.02)
  const lifeExpectancy = clamp(prev.lifeExpectancy + leDelta * 0.1, 52, 90)

  // Inequality: skilled immigration can widen gap short-term; integration reduces it
  const giniDelta =
    scenario.skilledMigrationShare * 0.08 * Math.max(migMult - 1, 0) -
    scenario.integrationInvestment * 0.06
  const gini = clamp(prev.gini + giniDelta * 0.05, 25, 60)

  const healthSpendingPct = clamp(
    country.healthSpendingPctGdp *
      (1 + age.elderly * 0.15 + scenario.integrationInvestment * 0.05),
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

export function runSimulation(
  countryId: string,
  scenario: PolicyScenario,
  maxYears: HorizonYears = 50,
): SimulationResult {
  const country = getCountryById(countryId)
  if (!country) {
    throw new Error(`Unknown country: ${countryId}`)
  }

  const warnings: Array<string> = []
  const methodologyNotes = [
    'Cohort-component model with annual time steps.',
    'Migration impacts age structure with working-age bias for skilled inflows.',
    'GDP per capita driven by productivity, labor force growth, and dependency ratio.',
    'Results are projections, not predictions. Uncertainty increases with horizon length.',
  ]

  if (country.tfr < 1.4) {
    warnings.push(
      `${country.name} is already below 1.4 TFR. Long-run population decline is likely without migration.`,
    )
  }

  if (scenario.migrationPolicy === 'mass_deportation') {
    warnings.push(
      'Deportation scenarios model labor market disruption and reduced tax base in early years.',
    )
  }

  let state = {
    population: country.population,
    tfr: country.tfr,
    lifeExpectancy: country.lifeExpectancy,
    gdpPerCapita: country.gdpPerCapita,
    youthPct: country.youthPct,
    workingAgePct: country.workingAgePct,
    elderlyPct: country.elderlyPct,
    gini: country.giniIndex,
    healthSpendingPct: country.healthSpendingPctGdp,
    healthcareCapacity: 1.0,
    births: 0,
    deaths: 0,
    netMigration: 0,
    productivityGrowth: country.productivityGrowth,
  }

  const trajectory: Array<YearSnapshot> = []

  const baseline = createSnapshot(
    BASELINE_YEAR,
    country,
    { ...state, births: 0, deaths: 0, netMigration: 0 },
    scenario.integrationInvestment,
    country.productivityGrowth,
  )
  trajectory.push(baseline)

  for (let y = 1; y <= maxYears; y++) {
    const next = simulateYear(country, scenario, y, state)
    state = next
    trajectory.push(
      createSnapshot(
        BASELINE_YEAR + y,
        country,
        state,
        scenario.integrationInvestment,
        next.productivityGrowth,
      ),
    )
  }

  const horizons = {} as Record<HorizonYears, YearSnapshot>
  for (const h of HORIZONS) {
    if (h <= maxYears) {
      horizons[h] = trajectory[h]!
    }
  }

  return {
    countryId: country.id,
    countryName: country.name,
    baselineYear: BASELINE_YEAR,
    scenario,
    baseline,
    horizons,
    trajectory,
    warnings,
    methodologyNotes,
  }
}

export function compareToBaseline(
  result: SimulationResult,
  baselinePolicy: PolicyScenario,
): SimulationResult {
  const baselineResult = runSimulation(result.countryId, baselinePolicy, 50)
  return baselineResult
}

export function formatPopulation(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return n.toLocaleString()
}

export function formatCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n)
}

export function pctChange(from: number, to: number): number {
  if (from === 0) return 0
  return ((to - from) / from) * 100
}
