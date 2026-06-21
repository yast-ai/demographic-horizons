import { createFileRoute } from '@tanstack/react-router'
import { COUNTRIES } from '#/lib/data/countries'
import { SITE_NAME, SITE_URL } from '#/lib/site'

export const Route = createFileRoute('/sources')({
  component: SourcesPage,
})

function SourcesPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-xs font-semibold uppercase tracking-widest text-sage">
        References & citation
      </p>
      <h1 className="mt-2 font-display text-4xl text-ink">Data sources</h1>

      <section className="mt-10">
        <h2 className="font-display text-2xl text-ink">How to cite</h2>
        <blockquote className="mt-4 rounded-sm border-l-4 border-accent bg-white p-5 font-mono text-xs leading-relaxed text-ink-muted">
          YAST AI. (2026). <em>{SITE_NAME}</em>: Immigration and population projections by
          country and migration policy. Retrieved {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}, from{' '}
          {SITE_URL}/simulate
        </blockquote>
        <p className="mt-4 text-sm text-ink-muted">
          For APA 7th edition. Include the access date and specific scenario
          parameters when referencing individual runs. Export JSON from the
          simulator for reproducibility.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-2xl text-ink">Primary data sources</h2>
        <ul className="mt-4 space-y-3 text-sm text-ink-muted">
          <li>
            United Nations, Department of Economic and Social Affairs, Population
            Division (2024). <em>World Population Prospects 2024</em>.
          </li>
          <li>
            World Bank (2024). World Development Indicators — GDP per capita (PPP),
            health expenditure, Gini index.
          </li>
          <li>
            OECD (2024). International Migration Outlook — net migration benchmarks.
          </li>
          <li>
            National statistical offices: US Census Bureau, Destatis, Statistics
            Japan, INEGI, ONS, INSEE, ABS, IBGE, NBS China/India/Nigeria.
          </li>
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-2xl text-ink">Country baselines</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[600px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wider text-ink-muted">
                <th className="py-2 pr-4">Country</th>
                <th className="py-2 pr-4">Pop.</th>
                <th className="py-2 pr-4">TFR</th>
                <th className="py-2 pr-4">Net mig.</th>
                <th className="py-2">Sources</th>
              </tr>
            </thead>
            <tbody>
              {COUNTRIES.map((c) => (
                <tr key={c.id} className="border-b border-border/60">
                  <td className="py-2 pr-4 font-medium text-ink">{c.name}</td>
                  <td className="py-2 pr-4 text-ink-muted">
                    {(c.population / 1e6).toFixed(0)}M
                  </td>
                  <td className="py-2 pr-4 text-ink-muted">{c.tfr}</td>
                  <td className="py-2 pr-4 text-ink-muted">
                    {c.netMigrationRate}/1k
                  </td>
                  <td className="py-2 text-xs text-ink-muted">
                    {c.sources.join(', ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </article>
  )
}
