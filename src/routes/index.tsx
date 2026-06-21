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
import { SITE_TAGLINE } from '#/lib/site'
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
          <p className="text-xs font-semibold uppercase tracking-widest text-sage">
            Free public resource
          </p>
          <h1 className="mt-3 max-w-2xl text-3xl font-semibold leading-tight text-ink sm:text-4xl">
            Immigration shapes population — across 100 years
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-muted">
            {SITE_TAGLINE} Explore recorded migration history ({HISTORY_START}–
            {stats.presentYear}), counterfactual past policies, and 50-year projections
            for policymakers, researchers, students, and anyone curious.
          </p>
          <Link
            to="/simulate"
            search={{ country: undefined, policy: undefined }}
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-white hover:bg-accent/90"
            onClick={() => captureEvent('cta_simulate_clicked', { source: 'hero' })}
          >
            Explore immigration & population
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat
            label="Time span"
            value="100 years"
            hint={`${HISTORY_START} migration history · 2076 projection`}
          />
          <Stat
            label="Countries"
            value={String(stats.totalCountries)}
            hint="Major economies — immigration & headcount linked"
          />
          <Stat
            label="US: immigration policy gap today"
            value={`${stats.usaPastGap}M people`}
            hint="Alternate past migration path vs actual since 1976"
            trend={
              stats.usaPastGapSigned >= 0
                ? 'Actual path above restrictive counterfactual'
                : 'Actual path below restrictive counterfactual'
            }
            trendUp={stats.usaPastGapSigned >= 0}
          />
          <Stat
            label="US: to 2076 (status quo)"
            value={`${stats.usaFutureSpread >= 0 ? '+' : ''}${stats.usaFutureSpread.toFixed(1)}%`}
            hint="Population change from today"
            trend={stats.usaFutureSpread >= 0 ? 'Growing' : 'Shrinking'}
            trendUp={stats.usaFutureSpread >= 0}
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-10 sm:px-6">
        <CenturyPopulationChart result={usaCentury} />
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-10 sm:px-6">
        <ChartCard
          title="Fertility alone cannot explain population"
          subtitle="Below replacement (2.1), countries depend on immigration to grow or stabilize."
        >
          <FertilityBarChart data={fertility} />
        </ChartCard>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-10 sm:px-6">
        <ChartCard
          title="How immigration policy changes population by 2076"
          subtitle="Percent change from today — green growth, red decline. Restrictive vs expanded migration over 50 years."
        >
          <PolicyCompareChart data={policyCompare} />
        </ChartCard>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-10 sm:px-6">
        <ChartCard
          title="2076 population under three migration paths"
          subtitle="Gray = current policy. Green/red bars show difference from status quo."
        >
          <CountryPopulationChart data={populationOutlook} />
          <p className="mt-4 text-sm text-ink-muted">
            USA today: {formatPopulation(usaCentury.insights.populationTodayActual)} → 2076
            under current immigration policy:{' '}
            {formatPopulation(usaCentury.insights.population2076)}
          </p>
        </ChartCard>
      </section>

      <section className="border-t border-border bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <h2 className="text-xl font-semibold text-ink">Explore by country</h2>
          <p className="mt-2 text-sm text-ink-muted">
            See how immigration history and policy choices shaped each country — then project
            the next 50 years.
          </p>
          <div className="mt-6">
            <CountryExploreGrid countries={populationOutlook} />
          </div>
        </div>
      </section>
    </div>
  )
}
