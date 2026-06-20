import { createFileRoute } from '@tanstack/react-router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useConvexAuth, useAction, useMutation } from 'convex/react'
import { Download, Settings2, Sparkles } from 'lucide-react'
import { api } from '../../convex/_generated/api'
import { DEFAULT_COUNTRY_ID, getCountryById } from '#/lib/data/countries'
import { runSimulation, formatPopulation } from '#/lib/simulation/engine'
import { buildScenario, MIGRATION_POLICY_LABELS, PRESET_SCENARIOS } from '#/lib/simulation/policies'
import type { HorizonYears, MigrationPolicy } from '#/lib/simulation/types'
import { PolicyDrawer } from '#/components/simulation/PolicyDrawer'
import { TimelineScrubber } from '#/components/simulation/TimelineScrubber'
import {
  HorizonTabs,
  IncomeChart,
  MetricsGrid,
  PopulationChart,
} from '#/components/simulation/ProjectionChart'
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

function SimulatePage() {
  const { country: countryParam, policy: policyParam } = Route.useSearch()
  const [countryId, setCountryId] = useState(countryParam ?? DEFAULT_COUNTRY_ID)
  const [migrationPolicy, setMigrationPolicy] = useState<MigrationPolicy>(
    policyParam ?? 'status_quo',
  )
  const [sliders, setSliders] = useState(PRESET_SCENARIOS.status_quo)
  const [horizon, setHorizon] = useState<HorizonYears>(20)
  const [yearIndex, setYearIndex] = useState(20)
  const [comparePolicy, setComparePolicy] = useState<MigrationPolicy | null>(
    'restrictive',
  )
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [aiBrief, setAiBrief] = useState<string | null>(null)
  const [aiLoading, setAiLoading] = useState(false)

  const { isAuthenticated } = useConvexAuth()
  const logRun = useMutation(api.scenarios.logSimulationRun)
  const generateBrief = useAction(api.ai.generatePolicyBrief)

  const scenario = useMemo(
    () =>
      buildScenario(migrationPolicy, {
        ...sliders,
        migrationPolicy,
      }),
    [migrationPolicy, sliders],
  )

  const result = useMemo(
    () => runSimulation(countryId, scenario, 50),
    [countryId, scenario],
  )

  const compareResult = useMemo(() => {
    if (!comparePolicy) return null
    return runSimulation(countryId, buildScenario(comparePolicy), 50)
  }, [countryId, comparePolicy])

  const country = getCountryById(countryId)
  const yearSnap = result.trajectory[yearIndex] ?? result.baseline

  useEffect(() => {
    setSliders(PRESET_SCENARIOS[migrationPolicy])
    captureEvent('simulation_run', {
      country: countryId,
      policy: migrationPolicy,
    })
  }, [migrationPolicy, countryId])

  useEffect(() => {
    if (!import.meta.env.VITE_CONVEX_URL) return
    void logRun({
      countryId,
      scenario,
      baseline: result.baseline,
      horizon10: result.horizons[10],
      horizon20: result.horizons[20],
      horizon50: result.horizons[50],
      warnings: result.warnings,
    }).catch(() => {})
  }, [countryId, scenario, result, logRun])

  const handleSliderChange = useCallback((key: string, value: number) => {
    setSliders((prev) => ({ ...prev, [key]: value }))
  }, [])

  const handleHorizonJump = useCallback((h: HorizonYears) => {
    setHorizon(h)
    setYearIndex(h)
  }, [])

  const handleGenerateBrief = async () => {
    if (!isAuthenticated) {
      window.location.href = '/api/auth/sign-in?returnPathname=/simulate'
      return
    }
    setAiLoading(true)
    try {
      const h10 = result.horizons[10]
      const h20 = result.horizons[20]
      const h50 = result.horizons[50]
      const { brief } = await generateBrief({
        countryName: result.countryName,
        migrationPolicy: scenario.migrationPolicy,
        horizon10Summary: `Pop ${(h10.population / 1e6).toFixed(1)}M, GDP/cap $${h10.gdpPerCapita.toLocaleString()}, health ${h10.healthIndex}, dependency ${h10.dependencyRatio}`,
        horizon20Summary: `Pop ${(h20.population / 1e6).toFixed(1)}M, GDP/cap $${h20.gdpPerCapita.toLocaleString()}, health ${h20.healthIndex}, dependency ${h20.dependencyRatio}`,
        horizon50Summary: `Pop ${(h50.population / 1e6).toFixed(1)}M, GDP/cap $${h50.gdpPerCapita.toLocaleString()}, health ${h50.healthIndex}, dependency ${h50.dependencyRatio}`,
        warnings: result.warnings,
      })
      setAiBrief(brief)
      captureEvent('ai_brief_generated', { country: countryId, policy: migrationPolicy })
    } catch (e) {
      setAiBrief(
        e instanceof Error ? e.message : 'Failed to generate brief. Check auth & API keys.',
      )
    } finally {
      setAiLoading(false)
    }
  }

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(result, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `popline-${countryId}-${migrationPolicy}.json`
    a.click()
    URL.revokeObjectURL(url)
    captureEvent('simulation_exported', { country: countryId, policy: migrationPolicy })
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
                Policy: <strong className="text-ink">{MIGRATION_POLICY_LABELS[migrationPolicy]}</strong>
                {comparePolicy && (
                  <> · Comparing with <strong className="text-ink">{MIGRATION_POLICY_LABELS[comparePolicy]}</strong></>
                )}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-medium text-ink hover:bg-paper-warm"
            >
              <Settings2 size={16} />
              Change country or policy
            </button>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
        {/* Plain-English summary */}
        <div className="rounded-xl border border-border bg-white p-5">
          <p className="text-sm text-ink-muted">In {yearSnap.year}, this country has</p>
          <p className="mt-1 text-xl font-semibold text-ink">
            {formatPopulation(yearSnap.population)} people · median age {yearSnap.medianAge} · ${(yearSnap.gdpPerCapita / 1000).toFixed(0)}k income per person
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <TimelineScrubber
            baselineYear={result.baselineYear}
            maxYears={50}
            yearIndex={yearIndex}
            onChange={setYearIndex}
            onHorizonJump={handleHorizonJump}
          />
          <HorizonTabs horizon={horizon} onChange={(h) => { setHorizon(h); setYearIndex(h) }} />
        </div>

        <div>
          <p className="mb-3 text-sm font-medium text-ink-muted">Key numbers at {2026 + horizon}</p>
          <MetricsGrid result={result} horizon={horizon} />
        </div>

        <PopulationChart primary={result} secondary={compareResult} />
        <IncomeChart primary={result} secondary={compareResult} />

        {result.warnings.length > 0 && (
          <div className="rounded-xl border border-orange/30 bg-orange/5 p-4 text-sm text-ink-muted">
            {result.warnings.map((w) => (
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
            Download data
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
        migrationPolicy={migrationPolicy}
        onPolicyChange={setMigrationPolicy}
        sliders={sliders}
        onSliderChange={handleSliderChange}
        comparePolicy={comparePolicy}
        onCompareChange={setComparePolicy}
      />
    </div>
  )
}
