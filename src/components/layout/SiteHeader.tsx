import { Link } from '@tanstack/react-router'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
// Auth disabled — public benefit site, no sign-in required
// import { useAuth } from '@workos/authkit-tanstack-react-start/client'
import { SITE_NAME } from '#/lib/site'

const NAV = [
  { to: '/simulate', label: 'Simulation' },
  { to: '/methodology', label: 'Methodology' },
  { to: '/sources', label: 'Sources' },
] as const

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  // const { user, loading } = useAuth()

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="text-lg font-semibold text-ink">
          {SITE_NAME}
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              search={item.to === '/simulate' ? { country: undefined, policy: undefined } : undefined}
              className="text-sm text-ink-muted transition-colors hover:text-ink"
              activeProps={{ className: 'text-ink font-medium' }}
            >
              {item.label}
            </Link>
          ))}
          {/* Sign-in disabled — no account needed to explore data
          {!loading && (
            user ? (
              <span className="text-sm text-ink-muted">{user.firstName ?? 'Account'}</span>
            ) : (
              <a
                href="/api/auth/sign-in?returnPathname=/simulate"
                className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white hover:bg-slate-deep"
              >
                Sign in
              </a>
            )
          )}
          */}
        </nav>

        <button
          type="button"
          className="rounded-lg p-2 text-ink md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-white px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-3">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                search={item.to === '/simulate' ? { country: undefined, policy: undefined } : undefined}
                className="py-2 text-base font-medium text-ink"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
