import { SlidersHorizontal, X } from 'lucide-react'
import type { MigrationPolicy } from '#/lib/simulation/types'
import {
  PolicySelector,
  PolicySliders,
} from '#/components/simulation/PolicyControls'
import { CountrySelector } from '#/components/simulation/CountrySelector'

interface PolicyDrawerProps {
  open: boolean
  onClose: () => void
  countryId: string
  onCountryChange: (id: string) => void
  migrationPolicy: MigrationPolicy
  onPolicyChange: (policy: MigrationPolicy) => void
  sliders: {
    integrationInvestment: number
    birthRateIncentive: number
    refugeeIntakePer1000: number
    skilledMigrationShare: number
  }
  onSliderChange: (key: string, value: number) => void
  comparePolicy: MigrationPolicy | null
  onCompareChange: (policy: MigrationPolicy | null) => void
}

export function PolicyDrawer({
  open,
  onClose,
  countryId,
  onCountryChange,
  migrationPolicy,
  onPolicyChange,
  sliders,
  onSliderChange,
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
      <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-border bg-paper shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={18} className="text-accent" />
            <h2 className="font-display text-xl text-ink">Policy pathways</h2>
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

        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-6">
          <div className="rounded-sm border border-border bg-white p-4">
            <CountrySelector value={countryId} onChange={onCountryChange} />
          </div>
          <div className="rounded-sm border border-border bg-white p-4">
            <PolicySelector value={migrationPolicy} onChange={onPolicyChange} />
          </div>
          <div className="rounded-sm border border-border bg-white p-4">
            <PolicySliders {...sliders} onChange={onSliderChange} />
          </div>
          <div className="rounded-sm border border-border bg-white p-4">
            <label className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
              Compare against
            </label>
            <select
              value={comparePolicy ?? ''}
              onChange={(e) =>
                onCompareChange(
                  e.target.value ? (e.target.value as MigrationPolicy) : null,
                )
              }
              className="mt-2 w-full rounded-sm border border-border bg-paper px-3 py-2.5 text-sm"
            >
              <option value="">None</option>
              {(
                [
                  'status_quo',
                  'restrictive',
                  'mass_deportation',
                  'moderate_immigration',
                  'high_skilled_immigration',
                  'humanitarian_refuge',
                ] as const
              ).map((p) => (
                <option key={p} value={p}>
                  {p.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>
      </aside>
    </>
  )
}
