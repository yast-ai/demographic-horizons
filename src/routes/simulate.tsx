import { createFileRoute } from '@tanstack/react-router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useConvexAuth, useAction, useMutation } from 'convex/react'
import { AlertTriangle, Download, Settings2, Sparkles } from 'lucide-react'
import { api } from '../../convex/_generated/api'
import { DEFAULT_COUNTRY_ID, getCountryById } from '#/lib/data/countries'
import { runSimulation } from '#/lib/simulation/engine'
import { buildScenario, MIGRATION_POLICY_LABELS, PRESET_SCENARIOS } from '#/lib/simulation/policies'
import type { HorizonYears, MigrationPolicy } from '#/lib/simulation/types'
import { PolicyDrawer } from '#/components/simulation/PolicyDrawer'
import { ScenarioNarrative } from '#/components/simulation/ScenarioNarrative'
import { SystemsPanel } from '#/components/simulation/SystemsPanel'
import { TimelineScrubber } from '#/components/simulation/TimelineScrubber'
import {
  MetricsGrid,
  PopulationAreaChart,
  ProjectionChart,
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
    a.download = `demographic-horizons-${countryId}-${migrationPolicy}.json`
    a.click()
    URL.revokeObjectURL(url)
    captureEvent('simulation_exported', { country: countryId, policy: migrationPolicy })
  }

  return (
    <div className="min-h-screen bg-paper">
      <section className="border-b border-border bg-gradient-to-b from-white to-paper">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sage">
                World simulation · {MIGRATION_POLICY_LABELS[migrationPolicy]}
              </p>
              <h1 className="mt-2 font-display text-4xl text-ink sm:text-5xl">
                {country?.name}
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                Baseline {country?.dataYear}: TFR {country?.tfr}, life expectancy{' '}
                {country?.lifeExpectancy} yrs, net migration {country?.netMigrationRate}
                /1,000. Scrub through decades to see how policy reshapes people,
                economy, health, and wealth.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="inline-flex shrink-0 items-center gap-2 self-start rounded-sm border border-border bg-white px-5 py-3 text-sm font-semibold text-ink shadow-sm transition hover:border-accent"
            >
              <Settings2 size={16} />
              Policy pathways
            </button>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        {result.warnings.length > 0 && (
          <div className="flex gap-3 rounded-sm border border-accent/30 bg-accent/5 p-4">
            <AlertTriangle className="shrink-0 text-accent" size={20} />
            <ul className="space-y-1 text-sm text-ink-muted">
              {result.warnings.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          </div>
        )}

        <TimelineScrubber
          baselineYear={result.baselineYear}
          maxYears={50}
          yearIndex={yearIndex}
          onChange={setYearIndex}
          onHorizonJump={handleHorizonJump}
          activeHorizon={horizon}
        />

        <SystemsPanel result={result} yearIndex={yearIndex} />

        <ScenarioNarrative result={result} yearIndex={yearIndex} />

        <MetricsGrid
          result={result}
          horizon={horizon}
          compareResult={compareResult}
        />

        <ProjectionChart primary={result} secondary={compareResult} />
        <PopulationAreaChart result={result} />

        <div className="flex flex-wrap gap-3 border-t border-border pt-6">
          <button
            type="button"
            onClick={exportJson}
            className="inline-flex items-center gap-2 rounded-sm border border-border bg-white px-4 py-2.5 text-sm font-medium text-ink hover:border-sage"
          >
            <Download size={16} />
            Export JSON (citation-ready)
          </button>
          <button
            type="button"
            onClick={handleGenerateBrief}
            disabled={aiLoading}
            className="inline-flex items-center gap-2 rounded-sm bg-ink px-4 py-2.5 text-sm font-medium text-paper hover:bg-slate-deep disabled:opacity-60"
          >
            <Sparkles size={16} />
            {aiLoading
              ? 'Generating…'
              : isAuthenticated
                ? 'AI policy brief'
                : 'Sign in for AI brief'}
          </button>
        </div>

        {aiBrief && (
          <article className="rounded-sm border border-border bg-white p-6 shadow-sm">
            <h3 className="font-display text-xl text-ink">AI policy brief</h3>
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
