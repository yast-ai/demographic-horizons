import { COUNTRIES } from '#/lib/data/countries'

interface CountrySelectorProps {
  value: string
  onChange: (id: string) => void
}

export function CountrySelector({ value, onChange }: CountrySelectorProps) {
  const grouped = COUNTRIES.reduce<Record<string, typeof COUNTRIES>>(
    (acc, country) => {
      const region = country.region
      if (!acc[region]) acc[region] = []
      acc[region].push(country)
      return acc
    },
    {},
  )

  return (
    <div>
      <label
        htmlFor="country-select"
        className="text-xs font-semibold uppercase tracking-widest text-ink-muted"
      >
        Country / economy
      </label>
      <select
        id="country-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full appearance-none rounded-sm border border-border bg-white px-4 py-3 text-base text-ink shadow-sm focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20"
      >
        {Object.entries(grouped).map(([region, countries]) => (
          <optgroup key={region} label={region}>
            {countries.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({(c.population / 1_000_000).toFixed(0)}M · TFR{' '}
                {c.tfr})
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  )
}
