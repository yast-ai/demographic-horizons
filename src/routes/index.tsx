import { Link, createFileRoute } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import {
  ChartCard,
  CountryPopulationChart,
  FertilityBarChart,
  PolicyCompareChart,
  Stat,
} from '#/components/charts/SimpleCharts'
import { CountryExploreGrid } from '#/components/landing/CountryExploreGrid'
import { captureEvent } from '#/integrations/posthog/provider'
import {
  getCountryPopulationOutlook,
  getFertilityInsights,
  getGlobalHeadlineStats,
  getPolicyCompareInsights,
} from '#/lib/landing/insights'

export const Route = createFileRoute('/')({
  component: LandingPage,
})

function LandingPage() {
  const fertility = getFertilityInsights()
  const policyCompare = getPolicyCompareInsights()
  const populationOutlook = getCountryPopulationOutlook()
  const stats = getGlobalHeadlineStats()

  return (
    <div className="bg-paper-warm">
      <section className="border-b border-border bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
          <h1 className="max-w-2xl text-3xl font-semibold leading-tight text-ink sm:text-4xl">
            What happens when countries change immigration policy?
          </h1>
          <p className="mt-4 max-w-xl text-base text-ink-muted">
            Population, income, health, and age structure over 10, 20, and 50 years — for 12
            major countries.
          </p>
          <Link
            to="/simulate"
            search={{ country: undefined, policy: undefined }}
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-white hover:bg-accent/90"
            onClick={() => captureEvent('cta_simulate_clicked', { source: 'hero' })}
          >
            Open simulation
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat
            label="Countries in this dataset"
            value={String(stats.totalCountries)}
            hint="Major economies across regions"
          />
          <Stat
            label="Below replacement fertility"
            value={`${stats.belowReplacement} of ${stats.totalCountries}`}
            hint="Replacement rate = 2.1 children per woman"
          />
          <Stat
            label="Average fertility"
            value={stats.avgTfr}
            hint="Children per woman, 2026 baseline"
          />
          <Stat
            label="Avg. policy spread by 2046"
            value={`${stats.avgPolicySpread}%`}
            hint="Restrictive vs. more immigration, across all countries"
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-10 sm:px-6">
        <ChartCard
          title="Fertility rate by country"
          subtitle="Children per woman. Below 2.1, the population shrinks without immigration."
        >
          <FertilityBarChart data={fertility} />
          <p className="mt-4 text-sm text-ink-muted">
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-orange align-middle" />{' '}
            Below replacement &nbsp;
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-green align-middle" />{' '}
            At or above replacement. Nigeria (4.30) is capped at 2.5 on the scale.
          </p>
        </ChartCard>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-10 sm:px-6">
        <ChartCard
          title="How migration policy changes population by 2046"
          subtitle="Percent change from today — restrictive policy vs. allowing more immigration."
        >
          <PolicyCompareChart data={policyCompare} />
        </ChartCard>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-10 sm:px-6">
        <ChartCard
          title="Projected population in 2046"
          subtitle="Three policy paths for each country. Millions of people."
        >
          <CountryPopulationChart data={populationOutlook} />
        </ChartCard>
      </section>

      <section className="border-t border-border bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <h2 className="text-xl font-semibold text-ink">Explore by country</h2>
          <p className="mt-2 text-sm text-ink-muted">
            Open the full simulator for any country. Six policy scenarios, year-by-year
            projections, and data export.
          </p>
          <div className="mt-6">
            <CountryExploreGrid countries={populationOutlook} />
          </div>
          <div className="mt-8">
            <Link
              to="/methodology"
              className="text-sm font-medium text-accent hover:underline"
            >
              How we calculate this →
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
