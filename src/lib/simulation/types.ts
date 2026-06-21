export const PRESENT_YEAR = 2026
export const HISTORY_START = 1976
export const FUTURE_END = 2076
export const PROJECTION_YEARS = 50

export type MigrationPolicy =
  | 'status_quo'
  | 'restrictive'
  | 'mass_deportation'
  | 'moderate_immigration'
  | 'high_skilled_immigration'
  | 'humanitarian_refuge'

export interface CountryBaseline {
  id: string
  name: string
  region: string
  population: number
  /** Total fertility rate (births per woman) */
  tfr: number
  lifeExpectancy: number
  gdpPerCapita: number
  /** Net migrants per 1,000 population annually */
  netMigrationRate: number
  youthPct: number
  workingAgePct: number
  elderlyPct: number
  healthSpendingPctGdp: number
  giniIndex: number
  /** Annual labor productivity growth baseline */
  productivityGrowth: number
  dataYear: number
  sources: Array<string>
}

export interface PolicyScenario {
  migrationPolicy: MigrationPolicy
  /** 0–1 integration & settlement investment intensity */
  integrationInvestment: number
  /** 0–1 pro-natal policy intensity */
  birthRateIncentive: number
  /** Additional refugee intake per 1,000 population */
  refugeeIntakePer1000: number
  /** Share of immigrants that are working-age skilled (0–1) */
  skilledMigrationShare: number
}

/** Population-focused snapshot — immigration & demographics only */
export interface YearSnapshot {
  year: number
  population: number
  births: number
  deaths: number
  netMigration: number
  tfr: number
  medianAge: number
  dependencyRatio: number
  elderlyPct: number
}

export interface SimulationResult {
  countryId: string
  countryName: string
  baselineYear: number
  scenario: PolicyScenario
  baseline: YearSnapshot
  /** Snapshot at +50 years */
  horizon: YearSnapshot
  trajectory: Array<YearSnapshot>
  warnings: Array<string>
  methodologyNotes: Array<string>
}

export interface CenturyInsights {
  population1976: number
  populationTodayActual: number
  populationTodayCounterfactual: number
  population2076: number
  pastPolicyGapToday: number
  pastPolicyGapPctToday: number
  futureChangePct: number
  cumulativeMigration1976: number
  cumulativeMigrationCounterfactual: number
}

export interface CenturyResult {
  countryId: string
  countryName: string
  pastPolicy: PolicyScenario
  futurePolicy: PolicyScenario
  /** UN-aligned recorded population path, 1976–2026 */
  recorded: Array<YearSnapshot>
  /** Counterfactual: if pastPolicy had applied since 1976 */
  counterfactualPast: Array<YearSnapshot>
  /** Forward projection from actual 2026 with futurePolicy */
  future: Array<YearSnapshot>
  futureCompare?: Array<YearSnapshot>
  /** Full 1976–2076 timeline for scrubber */
  timeline: Array<YearSnapshot>
  insights: CenturyInsights
  warnings: Array<string>
}
