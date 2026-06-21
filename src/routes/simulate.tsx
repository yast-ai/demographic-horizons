import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { useConvexAuth, useAction, useMutation } from 'convex/react'
import { Download, Settings2, Sparkles } from 'lucide-react'
import { api } from '../../convex/_generated/api'
import { DEFAULT_COUNTRY_ID, getCountryById } from '#/lib/data/countries'
import { formatPopulation } from '#/lib/simulation/engine'
import { runCenturyView } from '#/lib/simulation/century'
import { buildScenario, MIGRATION_POLICY_LABELS } from '#/lib/simulation/policies'
import type { MigrationPolicy, YearSnapshot } from '#/lib/simulation/types'
import { PRESENT_YEAR } from '#/lib/simulation/types'
import { PolicyDrawer } from '#/components/simulation/PolicyDrawer'
import {
  getSnapshotAtYear,
  TimelineScrubber,
} from '#/components/simulation/TimelineScrubber'
import { CenturyMetrics } from '#/components/simulation/CenturyMetrics'
import {
  CenturyPopulationChart,
  MigrationFlowChart,
} from '#/components/charts/CenturyChart'
import { captureEvent } from '#/integrations/posthog/provider'

export const Route = createFileRoute('/simulate')({
  validateSearch: (search: Record<string, unknown>) => ({
    country: typeof search.country === 'string' ? search.country : undefined,
    policy:
      typeof search.policy === 'string'
        ? (search.policy as MigrationPolicy)
        : undefined,
  }),
  component: SimulatePage,
})

/** Pad for Convex logging (legacy snapshot shape) */
function toLegacySnapshot(s: YearSnapshot) {
  return {
    ...s,
    lifeExpectancy: 0,
    gdpPerCapita: 0,
    gdpTotal: 0,
    laborForceParticipation: 0,
    healthIndex: 0,
    wealthIndex: 0,
    inequalityIndex: 0,
    pensionBurden: 0,
    healthcareCapacityIndex: 0,
  }
}

function SimulatePage() {
  const { country: countryParam, policy: policyParam } = Route.useSearch()
  const [countryId, setCountryId] = useState(countryParam ?? DEFAULT_COUNTRY_ID)
  const [pastPolicy, setPastPolicy] = useState<MigrationPolicy>('moderate_immigration')
  const [futurePolicy, setFuturePolicy] = useState<MigrationPolicy>(
    policyParam ?? 'status_quo',
  )
  const [comparePolicy, setComparePolicy] = useState<MigrationPolicy | null>(
    'restrictive',
  )
  const [yearIndex, setYearIndex] = useState(50)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [aiBrief, setAiBrief] = useState<string | null>(null)
  const [aiLoading, setAiLoading] = useState(false)

  const { isAuthenticated } = useConvexAuth()
  const logRun = useMutation(api.scenarios.logSimulationRun)
  const generateBrief = useAction(api.ai.generatePolicyBrief)

  const pastScenario = useMemo(() => buildScenario(pastPolicy), [pastPolicy])
  const futureScenario = useMemo(() => buildScenario(futurePolicy), [futurePolicy])
  const compareScenario = useMemo(
    () => (comparePolicy ? buildScenario(comparePolicy) : undefined),
    [comparePolicy],
  )

  const century = useMemo(
    () =>
      runCenturyView(
        countryId,
        pastScenario,
        futureScenario,
        compareScenario,
      ),
    [countryId, pastScenario, futureScenario, compareScenario],
  )

  const country = getCountryById(countryId)
  const yearSnap = getSnapshotAtYear(century, 1976 + yearIndex)

  useEffect(() => {
    captureEvent('simulation_run', {
      country: countryId,
      pastPolicy,
      futurePolicy,
    })
  }, [pastPolicy, futurePolicy, countryId])

  useEffect(() => {
    if (!import.meta.env.VITE_CONVEX_URL) return
    const baseline = toLegacySnapshot(century.future[0]!)
    const horizon = toLegacySnapshot(century.future[century.future.length - 1]!)
    void logRun({
      countryId,
      scenario: futureScenario,
      baseline,
      horizon10: baseline,
      horizon20: baseline,
      horizon50: horizon,
      warnings: century.warnings,
    }).catch(() => {})
  }, [countryId, futureScenario, century, logRun])

  const handleGenerateBrief = async () => {
    if (!isAuthenticated) {
      window.location.href = '/api/auth/sign-in?returnPathname=/simulate'
      return
    }
    setAiLoading(true)
    try {
      const today = century.recorded[century.recorded.length - 1]!
      const y2076 = century.future[century.future.length - 1]!
      const counter = century.counterfactualPast[century.counterfactualPast.length - 1]!
      const { brief } = await generateBrief({
        countryName: century.countryName,
        migrationPolicy: futurePolicy,
        horizon10Summary: `1976 pop ${formatPopulation(century.insights.population1976)}`,
        horizon20Summary: `Today actual ${formatPopulation(today.population)} vs counterfactual ${formatPopulation(counter.population)} (gap ${formatPopulation(Math.abs(century.insights.pastPolicyGapToday))})`,
        horizon50Summary: `2076 projected ${formatPopulation(y2076.population)} (${century.insights.futureChangePct.toFixed(1)}% from today), median age ${y2076.medianAge}`,
        warnings: century.warnings,
      })
      setAiBrief(brief)
      captureEvent('ai_brief_generated', { country: countryId, policy: futurePolicy })
    } catch (e) {
      setAiBrief(
        e instanceof Error ? e.message : 'Failed to generate brief. Check auth & API keys.',
      )
    } finally {
      setAiLoading(false)
    }
  }

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(century, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `popline-century-${countryId}.json`
    a.click()
    URL.revokeObjectURL(url)
    captureEvent('simulation_exported', { country: countryId, policy: futurePolicy })
  }

  return (
    <div className="min-h-screen bg-paper-warm">
      <section className="border-b border-border bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-ink sm:text-3xl">
                {country?.name}
              </h1>
              <p className="mt-1 text-sm text-ink-muted">
                Past counterfactual:{' '}
                <strong className="text-ink">{MIGRATION_POLICY_LABELS[pastPolicy]}</strong>
                {' · '}
                Future:{' '}
                <strong className="text-ink">{MIGRATION_POLICY_LABELS[futurePolicy]}</strong>
              </p>
            </div>
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-medium text-ink hover:bg-paper-warm"
            >
              <Settings2 size={16} />
              Change policies
            </button>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
        <CenturyPopulationChart result={century} />

        <div className="rounded-xl border border-border bg-white p-5">
          <p className="text-sm text-ink-muted">
            In {yearSnap.year}
            {yearSnap.year === PRESENT_YEAR ? ' (today)' : ''}
          </p>
          <p className="mt-1 text-xl font-semibold text-ink">
            {formatPopulation(yearSnap.population)} people · median age {yearSnap.medianAge} ·
            TFR {yearSnap.tfr}
          </p>
        </div>

        <TimelineScrubber yearIndex={yearIndex} onChange={setYearIndex} />

        <div>
          <p className="mb-3 text-sm font-medium text-ink-muted">
            Key numbers in {yearSnap.year}
          </p>
          <CenturyMetrics result={century} yearSnap={yearSnap} />
        </div>

        <MigrationFlowChart result={century} />

        {century.warnings.length > 0 && (
          <div className="rounded-xl border border-orange/30 bg-orange/5 p-4 text-sm text-ink-muted">
            {century.warnings.map((w) => (
              <p key={w}>{w}</p>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-3 border-t border-border pt-6">
          <button
            type="button"
            onClick={exportJson}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-medium text-ink hover:bg-paper-warm"
          >
            <Download size={16} />
            Download century data
          </button>
          <button
            type="button"
            onClick={handleGenerateBrief}
            disabled={aiLoading}
            className="inline-flex items-center gap-2 rounded-lg bg-ink px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-deep disabled:opacity-60"
          >
            <Sparkles size={16} />
            {aiLoading ? 'Generating…' : isAuthenticated ? 'AI summary' : 'Sign in for AI summary'}
          </button>
        </div>

        {aiBrief && (
          <article className="rounded-xl border border-border bg-white p-6">
            <h3 className="text-base font-semibold text-ink">AI summary</h3>
            <div className="prose prose-sm mt-4 max-w-none whitespace-pre-wrap text-ink-muted">
              {aiBrief}
            </div>
          </article>
        )}
      </div>

      <PolicyDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        countryId={countryId}
        onCountryChange={setCountryId}
        pastPolicy={pastPolicy}
        onPastPolicyChange={setPastPolicy}
        futurePolicy={futurePolicy}
        onFuturePolicyChange={setFuturePolicy}
        comparePolicy={comparePolicy}
        onCompareChange={setComparePolicy}
      />
    </div>
  )
}
