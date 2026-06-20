import type { HorizonYears } from '#/lib/simulation/types'

interface TimelineScrubberProps {
  baselineYear: number
  maxYears: number
  yearIndex: number
  onChange: (index: number) => void
  onHorizonJump: (horizon: HorizonYears) => void
}

export function TimelineScrubber({
  baselineYear,
  maxYears,
  yearIndex,
  onChange,
  onHorizonJump,
}: TimelineScrubberProps) {
  const currentYear = baselineYear + yearIndex
  const horizons: Array<HorizonYears> = [10, 20, 50]

  return (
    <div className="flex-1 rounded-xl border border-border bg-white p-4 sm:p-5">
      <div className="flex items-baseline justify-between">
        <div>
          <p className="text-sm text-ink-muted">Jump to year</p>
          <p className="text-3xl font-semibold tabular-nums text-ink">{currentYear}</p>
        </div>
        <div className="flex gap-1">
          {horizons.map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => onHorizonJump(h)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium ${
                yearIndex === h
                  ? 'bg-accent text-white'
                  : 'bg-paper-warm text-ink-muted hover:text-ink'
              }`}
            >
              {baselineYear + h}
            </button>
          ))}
        </div>
      </div>

      <input
        type="range"
        min={0}
        max={maxYears}
        value={yearIndex}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-4 h-2 w-full cursor-pointer appearance-none rounded-full bg-paper-warm accent-accent"
        aria-label="Simulation year"
      />

      <div className="mt-2 flex justify-between text-xs text-ink-muted">
        <span>{baselineYear}</span>
        <span>{baselineYear + maxYears}</span>
      </div>
    </div>
  )
}
