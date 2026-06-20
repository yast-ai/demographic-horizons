import { createFileRoute } from '@tanstack/react-router'
import { SITE_GITHUB, SITE_NAME } from '#/lib/site'

export const Route = createFileRoute('/methodology')({
  component: MethodologyPage,
})

function MethodologyPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-xs font-semibold uppercase tracking-widest text-sage">
        Technical documentation
      </p>
      <h1 className="mt-2 font-display text-4xl text-ink">Methodology</h1>
      <p className="mt-4 text-ink-muted leading-relaxed">
        {SITE_NAME} uses a transparent cohort-component model with annual
        time steps. This page describes assumptions sufficient for academic
        replication and citation.
      </p>

      <section className="mt-10 space-y-4">
        <h2 className="font-display text-2xl text-ink">1. Model structure</h2>
        <p className="text-sm leading-relaxed text-ink-muted">
          Each simulation begins from a country baseline (population, age
          structure, TFR, life expectancy, GDP per capita, net migration rate,
          health spending, and inequality). The engine advances one year at a
          time for up to 50 years, updating:
        </p>
        <ul className="list-inside list-disc space-y-2 text-sm text-ink-muted">
          <li>
            <strong>Births</strong> — derived from TFR and working-age share
          </li>
          <li>
            <strong>Deaths</strong> — crude mortality from life expectancy
          </li>
          <li>
            <strong>Net migration</strong> — baseline rate × policy multiplier +
            refugee intake + deportation shocks
          </li>
          <li>
            <strong>Age structure</strong> — youth / working / elderly shares
            evolve with cohort aging and migration age bias
          </li>
          <li>
            <strong>Economy</strong> — GDP per capita from productivity growth,
            labor force changes, and dependency drag
          </li>
          <li>
            <strong>Health & wealth indices</strong> — composite 0–100 scores
            from life expectancy, spending, capacity, inequality, and dependency
          </li>
        </ul>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="font-display text-2xl text-ink">2. Policy scenarios</h2>
        <p className="text-sm leading-relaxed text-ink-muted">
          Six preset migration policies calibrate net migration multipliers and
          short-run disruption terms. Users can further adjust integration
          investment, pro-natal intensity, refugee intake, and skilled migration
          share. Deportation scenarios include labor-market disruption in early
          years based on literature on sudden workforce reductions.
        </p>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="font-display text-2xl text-ink">3. Uncertainty & limits</h2>
        <p className="text-sm leading-relaxed text-ink-muted">
          All outputs are <em>projections under stated assumptions</em>, not
          forecasts. Uncertainty grows with horizon length. The model does not
          capture geopolitical shocks, pandemics, climate migration spikes, or
          technological singularities. Cross-country comparisons use consistent
          methodology but different baseline data quality.
        </p>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="font-display text-2xl text-ink">4. Scope</h2>
        <p className="text-sm leading-relaxed text-ink-muted">
          Migration is modeled as flows affecting aggregate indicators. The model does not
          rank countries, religions, or ethnic groups. AI-generated briefs require
          authenticated access for auditability.
        </p>
      </section>

      <section className="mt-10 rounded-sm border border-border bg-paper-warm p-6">
        <h2 className="font-display text-xl text-ink">Version & contact</h2>
        <p className="mt-2 font-mono text-xs text-ink-muted">
          Model version: 1.0.0 · Baseline year: 2026 · Engine: cohort-component
          (TypeScript)
        </p>
        <p className="mt-2 text-sm text-ink-muted">
          Report methodology issues via GitHub Issues on {SITE_GITHUB}.
        </p>
      </section>
    </article>
  )
}
