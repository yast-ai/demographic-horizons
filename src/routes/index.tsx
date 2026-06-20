import { Link, createFileRoute } from '@tanstack/react-router'
import { ArrowRight, BookOpen, Globe2, Scale, TrendingDown } from 'lucide-react'
import { captureEvent } from '#/integrations/posthog/provider'
import { COUNTRIES } from '#/lib/data/countries'
import { runSimulation } from '#/lib/simulation/engine'
import { buildScenario } from '#/lib/simulation/policies'

export const Route = createFileRoute('/')({
  component: LandingPage,
})

const FEATURED = ['usa', 'germany', 'japan', 'india'] as const

function LandingPage() {
  const previews = FEATURED.map((id) => {
    const restrictive = runSimulation(id, buildScenario('restrictive'), 20)
    const expansion = runSimulation(id, buildScenario('moderate_immigration'), 20)
    const country = COUNTRIES.find((c) => c.id === id)!
    const r20 = restrictive.horizons[20]
    const e20 = expansion.horizons[20]
    return {
      id,
      name: country.name,
      tfr: country.tfr,
      restrictivePop: ((r20.population - restrictive.baseline.population) / restrictive.baseline.population) * 100,
      expansionPop: ((e20.population - expansion.baseline.population) / expansion.baseline.population) * 100,
    }
  })

  return (
    <>
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(196,92,58,0.08),transparent_55%),radial-gradient(ellipse_at_bottom_left,rgba(74,107,93,0.1),transparent_50%)]" />
        <div className="absolute right-0 top-0 hidden h-full w-1/3 opacity-[0.07] lg:block">
          <svg viewBox="0 0 400 400" className="h-full w-full" aria-hidden>
            <circle cx="200" cy="200" r="160" fill="none" stroke="#c45c3a" strokeWidth="0.5" />
            <circle cx="200" cy="200" r="120" fill="none" stroke="#4a6b5d" strokeWidth="0.5" />
            <circle cx="200" cy="200" r="80" fill="none" stroke="#b8956a" strokeWidth="0.5" />
          </svg>
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sage">
            Open research platform · 2026
          </p>
          <h1 className="mt-4 max-w-4xl text-balance font-display text-4xl leading-[1.05] text-ink sm:text-5xl lg:text-6xl">
            See how migration policy reshapes nations over decades
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-muted">
            Demographic Horizons is a cohort-based world simulation that models
            population, economy, health, and wealth under immigration and
            deportation scenarios — at 10, 20, and 50 year horizons. Neutral by
            design. Citation-ready for universities and policy teams.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              to="/simulate"
              search={{ country: undefined, policy: undefined }}
              className="inline-flex items-center gap-2 rounded-sm bg-accent px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-accent/90"
              onClick={() => captureEvent('cta_simulate_clicked', { source: 'hero' })}
            >
              Enter the simulation
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/methodology"
              className="inline-flex items-center gap-2 rounded-sm border border-border bg-white px-6 py-3.5 text-sm font-semibold text-ink transition hover:border-sage"
            >
              Read methodology
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
            Policy divergence preview · 20-year horizon
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {previews.map((p) => (
              <Link
                key={p.id}
                to="/simulate"
                search={{ country: p.id, policy: undefined }}
                className="group rounded-sm border border-border p-5 transition hover:border-accent/40 hover:shadow-md"
              >
                <p className="font-display text-xl text-ink group-hover:text-accent">
                  {p.name}
                </p>
                <p className="mt-1 text-xs text-ink-muted">TFR {p.tfr}</p>
                <div className="mt-4 flex gap-4 text-xs">
                  <span className="text-accent">
                    Restrictive: {p.restrictivePop >= 0 ? '+' : ''}
                    {p.restrictivePop.toFixed(1)}%
                  </span>
                  <span className="text-sage">
                    Expansion: {p.expansionPop >= 0 ? '+' : ''}
                    {p.expansionPop.toFixed(1)}%
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          {[
            {
              icon: Globe2,
              title: '12 major economies',
              body: 'Baseline data from UN WPP, World Bank, and national statistics — USA, Germany, Japan, India, and more.',
            },
            {
              icon: Scale,
              title: 'No political bias',
              body: 'We model trade-offs, not winners. Every scenario shows costs and benefits across population, GDP, health, and inequality.',
            },
            {
              icon: BookOpen,
              title: 'Built to be cited',
              body: 'Transparent assumptions, downloadable scenarios, and APA-ready citation format for academic work.',
            },
          ].map(({ icon: Icon, title, body }) => (
            <article
              key={title}
              className="rounded-sm border border-border bg-white p-6 shadow-sm"
            >
              <Icon className="text-accent" size={28} strokeWidth={1.5} />
              <h2 className="mt-4 font-display text-xl text-ink">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-slate-deep text-paper">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gold">
                Why this matters in 2026
              </p>
              <h2 className="mt-3 font-display text-3xl leading-tight sm:text-4xl">
                Most countries are already below replacement fertility
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-paper/75">
                With global TFR near 2.2 and falling, migration policy is no
                longer a side debate — it is central to labor markets, pension
                systems, healthcare capacity, and long-run growth. Small policy
                shifts today compound over generations.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { stat: '2.1', label: 'Replacement fertility rate' },
                { stat: '1.2', label: 'Japan TFR (2024)' },
                { stat: '2040s', label: 'Peak 65+ share in many OECD nations' },
                { stat: '50yr', label: 'Maximum simulation horizon' },
              ].map(({ stat, label }) => (
                <div
                  key={label}
                  className="rounded-sm border border-white/10 bg-white/5 p-5"
                >
                  <p className="font-display text-3xl text-accent-soft">{stat}</p>
                  <p className="mt-1 text-xs text-paper/60">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-start gap-4 rounded-sm border border-border bg-paper-warm p-6">
          <TrendingDown className="shrink-0 text-sage" size={24} />
          <div>
            <h2 className="font-display text-2xl text-ink">
              Not another slider dashboard
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              Scrub through years on a timeline, read narrative projections as
              societies evolve, and watch people, economy, health, and wealth
              systems interact. Policy levers live in a dedicated pathway panel —
              the simulation is the experience.
            </p>
          </div>
        </div>

        <h2 className="mt-12 font-display text-3xl text-ink">
          How governments & universities use this
        </h2>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {[
            'Compare restrictive vs. expansionary migration before legislative votes',
            'Teach demographic transition and dependency ratios with live policy levers',
            'Stress-test pension and healthcare systems under aging + migration shocks',
            'Generate neutral AI policy briefs (sign-in required) for briefing documents',
          ].map((item) => (
            <li
              key={item}
              className="flex gap-3 rounded-sm border border-border bg-white px-5 py-4 text-sm text-ink-muted"
            >
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
              {item}
            </li>
          ))}
        </ul>
        <Link
          to="/simulate"
          search={{ country: undefined, policy: undefined }}
          className="mt-10 inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline"
        >
          Start exploring scenarios
          <ArrowRight size={14} />
        </Link>
      </section>
    </>
  )
}
