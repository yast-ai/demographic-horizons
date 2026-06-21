import { Link, createFileRoute } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import {
  ChartCard,
  CountryPopulationChart,
  FertilityBarChart,
  PolicyCompareChart,
  Stat,
} from '#/components/charts/SimpleCharts'
import { CenturyPopulationChart } from '#/components/charts/CenturyChart'
import { CountryExploreGrid } from '#/components/landing/CountryExploreGrid'
import { captureEvent } from '#/integrations/posthog/provider'
import {
  getCountryPopulationOutlook,
  getFertilityInsights,
  getGlobalHeadlineStats,
  getPolicyCompareInsights,
  getUsaCenturyPreview,
} from '#/lib/landing/insights'
import { formatPopulation } from '#/lib/simulation/engine'
import { HISTORY_START } from '#/lib/simulation/types'

export const Route = createFileRoute('/')({
  component: LandingPage,
})

function LandingPage() {
  const fertility = getFertilityInsights()
  const policyCompare = getPolicyCompareInsights()
  const populationOutlook = getCountryPopulationOutlook()
  const stats = getGlobalHeadlineStats()
  const usaCentury = getUsaCenturyPreview()

  return (
    <div className="bg-paper-warm">
      <section className="border-b border-border bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
          <h1 className="max-w-2xl text-3xl font-semibold leading-tight text-ink sm:text-4xl">
            100 years of population — past and future
          </h1>
          <p className="mt-4 max-w-xl text-base text-ink-muted">
            See how immigration shaped {HISTORY_START}–{stats.presentYear}, what today would
            look like under different past policies, and where the next 50 years go.
          </p>
          <Link
            to="/simulate"
            search={{ country: undefined, policy: undefined }}
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-white hover:bg-accent/90"
            onClick={() => captureEvent('cta_simulate_clicked', { source: 'hero' })}
          >
            Open century simulator
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat
            label="Time span"
            value="100 years"
            hint={`${HISTORY_START} recorded · 2076 projected`}
          />
          <Stat
            label="Countries"
            value={String(stats.totalCountries)}
            hint="Major economies with UN-aligned history"
          />
          <Stat
            label="US: past policy gap today"
            value={`${stats.usaPastGap}M people`}
            hint="Restrictive vs actual path since 1976"
          />
          <Stat
            label="US: to 2076 (status quo)"
            value={`${stats.usaFutureSpread}%`}
            hint="Population change from today"
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-10 sm:px-6">
        <CenturyPopulationChart result={usaCentury} />
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-10 sm:px-6">
        <ChartCard
          title="Fertility rate by country (today)"
          subtitle="Below 2.1, populations shrink without immigration."
        >
          <FertilityBarChart data={fertility} />
        </ChartCard>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-10 sm:px-6">
        <ChartCard
          title="Migration policy impact by 2076"
          subtitle="Percent change from today — restrictive vs more immigration over the next 50 years."
        >
          <PolicyCompareChart data={policyCompare} />
        </ChartCard>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-10 sm:px-6">
        <ChartCard
          title="Projected population in 2076"
          subtitle="Three future policy paths for each country."
        >
          <CountryPopulationChart data={populationOutlook} />
          <p className="mt-4 text-sm text-ink-muted">
            USA today: {formatPopulation(usaCentury.insights.populationTodayActual)} → 2076
            status quo: {formatPopulation(usaCentury.insights.population2076)}
          </p>
        </ChartCard>
      </section>

      <section className="border-t border-border bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <h2 className="text-xl font-semibold text-ink">Explore by country</h2>
          <p className="mt-2 text-sm text-ink-muted">
            Full century view: recorded history, counterfactual past, and 50-year projection.
          </p>
          <div className="mt-6">
            <CountryExploreGrid countries={populationOutlook} />
          </div>
        </div>
      </section>
    </div>
  )
}
