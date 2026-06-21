import { Link } from '@tanstack/react-router'
import { SITE_NAME, SITE_TAGLINE, SITE_URL } from '#/lib/site'

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-3">
        <div>
          <p className="font-semibold text-ink">{SITE_NAME}</p>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            {SITE_TAGLINE} A free public resource for policymakers, researchers,
            students, and anyone curious about how immigration and population connect.
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-ink">Explore</p>
          <ul className="mt-3 space-y-2 text-sm text-ink-muted">
            <li>
              <Link to="/simulate" search={{ country: undefined, policy: undefined }} className="hover:text-ink">
                Run simulation
              </Link>
            </li>
            <li>
              <Link to="/methodology" className="hover:text-ink">
                Methodology
              </Link>
            </li>
            <li>
              <Link to="/sources" className="hover:text-ink">
                Data sources
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-medium text-ink">Cite this work</p>
          <p className="mt-3 font-mono text-xs leading-relaxed text-ink-muted">
            YAST AI. (2026). {SITE_NAME}. {SITE_URL}
          </p>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-ink-muted">
        © {new Date().getFullYear()} YAST AI · Public benefit · Projections, not predictions
      </div>
    </footer>
  )
}
