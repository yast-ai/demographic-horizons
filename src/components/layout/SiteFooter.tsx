import { Link } from '@tanstack/react-router'

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-slate-deep text-paper">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-3 lg:px-8">
        <div>
          <p className="font-display text-2xl">Demographic Horizons</p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-paper/70">
            An open demographic simulation for understanding how migration policy
            shapes population, economy, health, and wealth over 10, 20, and 50
            years. Built for researchers, students, and policymakers.
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gold">
            Explore
          </p>
          <ul className="mt-4 space-y-2 text-sm text-paper/80">
            <li>
              <Link to="/simulate" className="hover:text-accent-soft">
                Run simulation
              </Link>
            </li>
            <li>
              <Link to="/methodology" className="hover:text-accent-soft">
                Methodology
              </Link>
            </li>
            <li>
              <Link to="/sources" className="hover:text-accent-soft">
                Data sources & citation
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gold">
            Cite this work
          </p>
          <p className="mt-4 font-mono text-xs leading-relaxed text-paper/60">
            YAST AI. (2026). <em>Demographic Horizons</em>: Migration policy
            simulation platform. Retrieved from https://demographic-horizons.org
          </p>
          <p className="mt-4 text-xs text-paper/50">
            Neutral by design. No affiliation with any government or political
            movement.
          </p>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-paper/40">
        © {new Date().getFullYear()} YAST AI. Models are projections, not
        predictions.
      </div>
    </footer>
  )
}
