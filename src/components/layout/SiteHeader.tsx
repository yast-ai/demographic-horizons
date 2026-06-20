import { Link } from '@tanstack/react-router'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@workos/authkit-tanstack-react-start/client'

const NAV = [
  { to: '/simulate', label: 'Simulation' },
  { to: '/methodology', label: 'Methodology' },
  { to: '/sources', label: 'Sources' },
] as const

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const { user, loading } = useAuth()

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-paper/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="group flex items-baseline gap-2">
          <span className="font-display text-2xl text-ink sm:text-[1.65rem]">
            Demographic Horizons
          </span>
          <span className="hidden text-[10px] font-medium uppercase tracking-[0.2em] text-sage sm:inline">
            2026–2076
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-sm font-medium text-ink-muted transition-colors hover:text-accent"
              activeProps={{ className: 'text-accent' }}
            >
              {item.label}
            </Link>
          ))}
          {!loading && (
            user ? (
              <span className="text-sm text-ink-muted">{user.firstName ?? 'Account'}</span>
            ) : (
              <a
                href="/api/auth/sign-in?returnPathname=/simulate"
                className="rounded-sm bg-ink px-4 py-2 text-sm font-medium text-paper transition hover:bg-slate-deep"
              >
                Sign in
              </a>
            )
          )}
        </nav>

        <button
          type="button"
          className="rounded-sm p-2 text-ink md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-paper px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-3">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="py-2 text-base font-medium text-ink"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            {!loading && !user && (
              <a
                href="/api/auth/sign-in?returnPathname=/simulate"
                className="mt-2 inline-flex w-fit rounded-sm bg-ink px-4 py-2 text-sm font-medium text-paper"
              >
                Sign in
              </a>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
