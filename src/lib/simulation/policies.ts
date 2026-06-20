import type { MigrationPolicy, PolicyScenario } from './types'

export const MIGRATION_POLICY_LABELS: Record<MigrationPolicy, string> = {
  status_quo: 'Status quo',
  restrictive: 'Restrictive immigration',
  mass_deportation: 'Large-scale deportation',
  moderate_immigration: 'Moderate immigration expansion',
  high_skilled_immigration: 'High-skilled immigration focus',
  humanitarian_refuge: 'Humanitarian & refugee expansion',
}

export const MIGRATION_POLICY_DESCRIPTIONS: Record<MigrationPolicy, string> = {
  status_quo:
    'Continues current net migration rates based on recent national trends.',
  restrictive:
    'Reduces legal immigration by ~60% and increases emigration pressure on undocumented populations.',
  mass_deportation:
    'Models removal of ~2–4% of population over 5 years with reduced future inflows. Economic disruption included.',
  moderate_immigration:
    'Increases net migration ~50% with balanced age and skill composition.',
  high_skilled_immigration:
    'Prioritizes working-age skilled migrants; boosts productivity but may widen short-term inequality.',
  humanitarian_refuge:
    'Elevated refugee resettlement and family reunification with integration spending.',
}

export const PRESET_SCENARIOS: Record<
  MigrationPolicy,
  Omit<PolicyScenario, 'migrationPolicy'>
> = {
  status_quo: {
    integrationInvestment: 0.5,
    birthRateIncentive: 0.3,
    refugeeIntakePer1000: 0,
    skilledMigrationShare: 0.45,
  },
  restrictive: {
    integrationInvestment: 0.3,
    birthRateIncentive: 0.2,
    refugeeIntakePer1000: 0,
    skilledMigrationShare: 0.5,
  },
  mass_deportation: {
    integrationInvestment: 0.2,
    birthRateIncentive: 0.15,
    refugeeIntakePer1000: 0,
    skilledMigrationShare: 0.4,
  },
  moderate_immigration: {
    integrationInvestment: 0.55,
    birthRateIncentive: 0.35,
    refugeeIntakePer1000: 0.5,
    skilledMigrationShare: 0.5,
  },
  high_skilled_immigration: {
    integrationInvestment: 0.65,
    birthRateIncentive: 0.25,
    refugeeIntakePer1000: 0.2,
    skilledMigrationShare: 0.75,
  },
  humanitarian_refuge: {
    integrationInvestment: 0.7,
    birthRateIncentive: 0.3,
    refugeeIntakePer1000: 2.0,
    skilledMigrationShare: 0.35,
  },
}

export function buildScenario(
  migrationPolicy: MigrationPolicy,
  overrides?: Partial<PolicyScenario>,
): PolicyScenario {
  return {
    migrationPolicy,
    ...PRESET_SCENARIOS[migrationPolicy],
    ...overrides,
  }
}

/** Net migration multiplier relative to baseline rate */
export function migrationMultiplier(policy: MigrationPolicy): number {
  switch (policy) {
    case 'status_quo':
      return 1
    case 'restrictive':
      return 0.35
    case 'mass_deportation':
      return -2.5
    case 'moderate_immigration':
      return 1.55
    case 'high_skilled_immigration':
      return 1.35
    case 'humanitarian_refuge':
      return 1.85
  }
}

/** One-time population shock from deportation (fraction of population) */
export function deportationShock(policy: MigrationPolicy, yearOffset: number): number {
  if (policy !== 'mass_deportation' || yearOffset > 5) return 0
  // ~0.6% per year for 5 years
  return 0.006
}
