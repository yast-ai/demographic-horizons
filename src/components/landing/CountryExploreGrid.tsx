import { Link } from '@tanstack/react-router'

interface CountryExploreGridProps {
  countries: Array<{
    countryId: string
    name: string
    statusQuoM: number
  }>
}

export function CountryExploreGrid({ countries }: CountryExploreGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {countries.map((country) => (
        <Link
          key={country.countryId}
          to="/simulate"
          search={{ country: country.countryId, policy: undefined }}
          className="rounded-lg border border-border bg-white px-4 py-3 transition hover:border-accent hover:bg-paper-warm"
        >
          <p className="font-medium text-ink">{country.name}</p>
          <p className="mt-0.5 text-xs text-ink-muted">{country.statusQuoM}M people by 2046</p>
        </Link>
      ))}
    </div>
  )
}
