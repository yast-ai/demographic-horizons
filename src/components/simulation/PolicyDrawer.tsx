import { SlidersHorizontal, X } from 'lucide-react'
import type { MigrationPolicy } from '#/lib/simulation/types'
import { PolicySelector } from '#/components/simulation/PolicyControls'
import { CountrySelector } from '#/components/simulation/CountrySelector'
import { MIGRATION_POLICY_LABELS } from '#/lib/simulation/policies'

interface PolicyDrawerProps {
  open: boolean
  onClose: () => void
  countryId: string
  onCountryChange: (id: string) => void
  pastPolicy: MigrationPolicy
  onPastPolicyChange: (policy: MigrationPolicy) => void
  futurePolicy: MigrationPolicy
  onFuturePolicyChange: (policy: MigrationPolicy) => void
  comparePolicy: MigrationPolicy | null
  onCompareChange: (policy: MigrationPolicy | null) => void
}

const POLICIES: Array<MigrationPolicy> = [
  'status_quo',
  'restrictive',
  'mass_deportation',
  'moderate_immigration',
  'high_skilled_immigration',
  'humanitarian_refuge',
]

export function PolicyDrawer({
  open,
  onClose,
  countryId,
  onCountryChange,
  pastPolicy,
  onPastPolicyChange,
  futurePolicy,
  onFuturePolicyChange,
  comparePolicy,
  onCompareChange,
}: PolicyDrawerProps) {
  if (!open) return null

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close policy panel"
      />
      <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-border bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={18} className="text-accent" />
            <h2 className="text-lg font-semibold text-ink">Policies</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-sm p-2 text-ink-muted hover:bg-paper-warm hover:text-ink"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-6">
          <div className="rounded-lg border border-border bg-paper-warm p-4">
            <CountrySelector value={countryId} onChange={onCountryChange} />
          </div>

          <div className="rounded-lg border border-border bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
              Past policy (1976–2026 counterfactual)
            </p>
            <p className="mt-1 text-xs text-ink-muted">
              What if this migration policy had applied since 1976?
            </p>
            <div className="mt-3">
              <PolicySelector value={pastPolicy} onChange={onPastPolicyChange} />
            </div>
          </div>

          <div className="rounded-lg border border-border bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
              Future policy (2026–2076)
            </p>
            <p className="mt-1 text-xs text-ink-muted">
              Projection from today with this policy.
            </p>
            <div className="mt-3">
              <PolicySelector value={futurePolicy} onChange={onFuturePolicyChange} />
            </div>
          </div>

          <div className="rounded-lg border border-border bg-white p-4">
            <label className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
              Compare future policy
            </label>
            <select
              value={comparePolicy ?? ''}
              onChange={(e) =>
                onCompareChange(
                  e.target.value ? (e.target.value as MigrationPolicy) : null,
                )
              }
              className="mt-2 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm"
            >
              <option value="">None</option>
              {POLICIES.map((p) => (
                <option key={p} value={p}>
                  {MIGRATION_POLICY_LABELS[p]}
                </option>
              ))}
            </select>
          </div>
        </div>
      </aside>
    </>
  )
}
