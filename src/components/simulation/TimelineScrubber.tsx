import type { CenturyResult } from '#/lib/simulation/types'
import { getYearFromIndex, PRESENT_YEAR } from '#/lib/simulation/century'

interface TimelineScrubberProps {
  yearIndex: number
  onChange: (index: number) => void
}

export function TimelineScrubber({ yearIndex, onChange }: TimelineScrubberProps) {
  const currentYear = getYearFromIndex(yearIndex)
  const isPast = currentYear <= PRESENT_YEAR

  return (
    <div className="flex-1 rounded-xl border border-border bg-white p-4 sm:p-5">
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <p className="text-sm text-ink-muted">
            {isPast ? 'Recorded & counterfactual past' : 'Projected future'}
          </p>
          <p className="text-3xl font-semibold tabular-nums text-ink">{currentYear}</p>
        </div>
        <div className="flex gap-1">
          <JumpButton label="1976" index={0} current={yearIndex} onChange={onChange} />
          <JumpButton label="Today" index={50} current={yearIndex} onChange={onChange} />
          <JumpButton label="2076" index={100} current={yearIndex} onChange={onChange} />
        </div>
      </div>

      <input
        type="range"
        min={0}
        max={100}
        value={yearIndex}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-4 h-2 w-full cursor-pointer appearance-none rounded-full bg-paper-warm accent-accent"
        aria-label="Century year"
      />

      <div className="mt-2 flex justify-between text-xs text-ink-muted">
        <span>1976 · past</span>
        <span className="font-medium text-ink">{PRESENT_YEAR}</span>
        <span>2076 · future</span>
      </div>
    </div>
  )
}

function JumpButton({
  label,
  index,
  current,
  onChange,
}: {
  label: string
  index: number
  current: number
  onChange: (i: number) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(index)}
      className={`rounded-md px-3 py-1.5 text-xs font-medium ${
        current === index
          ? 'bg-accent text-white'
          : 'bg-paper-warm text-ink-muted hover:text-ink'
      }`}
    >
      {label}
    </button>
  )
}

export function getSnapshotAtYear(result: CenturyResult, year: number) {
  if (year <= PRESENT_YEAR) {
    return (
      result.recorded.find((s) => s.year === year) ??
      result.counterfactualPast.find((s) => s.year === year) ??
      result.recorded[result.recorded.length - 1]!
    )
  }
  return (
    result.future.find((s) => s.year === year) ??
    result.future[result.future.length - 1]!
  )
}
