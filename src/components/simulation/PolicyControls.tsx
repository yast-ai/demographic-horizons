import type { MigrationPolicy } from '#/lib/simulation/types'
import {
  MIGRATION_POLICY_DESCRIPTIONS,
  MIGRATION_POLICY_LABELS,
} from '#/lib/simulation/policies'

const POLICIES: Array<MigrationPolicy> = [
  'status_quo',
  'restrictive',
  'mass_deportation',
  'moderate_immigration',
  'high_skilled_immigration',
  'humanitarian_refuge',
]

interface PolicySelectorProps {
  value: MigrationPolicy
  onChange: (policy: MigrationPolicy) => void
}

export function PolicySelector({ value, onChange }: PolicySelectorProps) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
        Migration policy scenario
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {POLICIES.map((policy) => {
          const selected = value === policy
          return (
            <button
              key={policy}
              type="button"
              onClick={() => onChange(policy)}
              className={`rounded-sm border px-4 py-3 text-left transition ${
                selected
                  ? 'border-accent bg-accent/5 ring-1 ring-accent/30'
                  : 'border-border bg-white hover:border-sage/40'
              }`}
            >
              <span className="block text-sm font-semibold text-ink">
                {MIGRATION_POLICY_LABELS[policy]}
              </span>
              <span className="mt-1 block text-xs leading-relaxed text-ink-muted">
                {MIGRATION_POLICY_DESCRIPTIONS[policy]}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

interface PolicySlidersProps {
  integrationInvestment: number
  birthRateIncentive: number
  refugeeIntakePer1000: number
  skilledMigrationShare: number
  onChange: (key: string, value: number) => void
}

export function PolicySliders({
  integrationInvestment,
  birthRateIncentive,
  refugeeIntakePer1000,
  skilledMigrationShare,
  onChange,
}: PolicySlidersProps) {
  const sliders = [
    {
      key: 'integrationInvestment',
      label: 'Integration investment',
      value: integrationInvestment,
      min: 0,
      max: 1,
      step: 0.05,
      hint: 'Language training, credential recognition, settlement services',
    },
    {
      key: 'birthRateIncentive',
      label: 'Pro-natal policy intensity',
      value: birthRateIncentive,
      min: 0,
      max: 1,
      step: 0.05,
      hint: 'Childcare subsidies, parental leave, housing support',
    },
    {
      key: 'refugeeIntakePer1000',
      label: 'Refugee intake (per 1,000 pop.)',
      value: refugeeIntakePer1000,
      min: 0,
      max: 5,
      step: 0.1,
      hint: 'Additional humanitarian resettlement above baseline',
    },
    {
      key: 'skilledMigrationShare',
      label: 'Skilled migrant share',
      value: skilledMigrationShare,
      min: 0.2,
      max: 0.9,
      step: 0.05,
      hint: 'Share of immigrants with tertiary education / in-demand skills',
    },
  ] as const

  return (
    <div className="space-y-5">
      <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
        Policy levers
      </p>
      {sliders.map((s) => (
        <div key={s.key}>
          <div className="flex items-baseline justify-between gap-2">
            <label htmlFor={s.key} className="text-sm font-medium text-ink">
              {s.label}
            </label>
            <span className="font-mono text-xs text-sage">
              {s.key === 'refugeeIntakePer1000'
                ? s.value.toFixed(1)
                : `${Math.round(s.value * 100)}%`}
            </span>
          </div>
          <input
            id={s.key}
            type="range"
            min={s.min}
            max={s.max}
            step={s.step}
            value={s.value}
            onChange={(e) => onChange(s.key, Number(e.target.value))}
            className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-paper-warm accent-accent"
          />
          <p className="mt-1 text-xs text-ink-muted">{s.hint}</p>
        </div>
      ))}
    </div>
  )
}
