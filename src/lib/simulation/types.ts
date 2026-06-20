export type HorizonYears = 10 | 20 | 50

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

export interface YearSnapshot {
  year: number
  population: number
  births: number
  deaths: number
  netMigration: number
  tfr: number
  medianAge: number
  lifeExpectancy: number
  gdpPerCapita: number
  gdpTotal: number
  dependencyRatio: number
  laborForceParticipation: number
  healthIndex: number
  wealthIndex: number
  inequalityIndex: number
  pensionBurden: number
  healthcareCapacityIndex: number
}

export interface SimulationResult {
  countryId: string
  countryName: string
  baselineYear: number
  scenario: PolicyScenario
  baseline: YearSnapshot
  horizons: Record<HorizonYears, YearSnapshot>
  trajectory: Array<YearSnapshot>
  warnings: Array<string>
  methodologyNotes: Array<string>
}

export interface CompareResult {
  scenarios: Array<SimulationResult>
  deltaAtHorizon: Record<
    HorizonYears,
    {
      populationPct: number
      gdpPerCapitaPct: number
      healthIndexPct: number
      dependencyRatioDelta: number
    }
  >
}
