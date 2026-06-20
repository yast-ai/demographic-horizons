import type { HorizonYears } from '#/lib/simulation/types'

interface TimelineScrubberProps {
  baselineYear: number
  maxYears: number
  yearIndex: number
  onChange: (index: number) => void
  onHorizonJump: (horizon: HorizonYears) => void
  activeHorizon: HorizonYears
}

export function TimelineScrubber({
  baselineYear,
  maxYears,
  yearIndex,
  onChange,
  onHorizonJump,
  activeHorizon,
}: TimelineScrubberProps) {
  const currentYear = baselineYear + yearIndex
  const horizons: Array<HorizonYears> = [10, 20, 50]

  return (
    <div className="rounded-sm border border-border bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
            Time horizon
          </p>
          <p className="mt-1 font-display text-3xl text-ink tabular-nums">
            {currentYear}
          </p>
          <p className="text-xs text-ink-muted">
            Year {yearIndex} of {maxYears}
          </p>
        </div>
        <div className="flex gap-1 rounded-sm border border-border bg-paper-warm p-1">
          {horizons.map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => onHorizonJump(h)}
              className={`rounded-sm px-3 py-1.5 text-xs font-semibold transition ${
                activeHorizon === h && yearIndex === h
                  ? 'bg-white text-ink shadow-sm'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              +{h}y
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
        className="timeline-slider mt-5 h-2 w-full cursor-pointer appearance-none rounded-full bg-paper-warm"
        aria-label="Simulation year"
      />

      <div className="mt-2 flex justify-between font-mono text-[10px] text-ink-muted">
        <span>{baselineYear}</span>
        <span>{baselineYear + 10}</span>
        <span>{baselineYear + 20}</span>
        <span>{baselineYear + maxYears}</span>
      </div>
    </div>
  )
}
