import { describe, expect, it } from 'vitest'
import { runCenturyView } from './century'
import { runSimulation } from './engine'
import { buildScenario } from './policies'
import { PROJECTION_YEARS } from './types'

describe('demographic simulation engine', () => {
  it('produces 51-year forward trajectory from 2026', () => {
    const result = runSimulation('usa', buildScenario('status_quo'))
    expect(result.trajectory).toHaveLength(PROJECTION_YEARS + 1)
    expect(result.horizon.year).toBe(2026 + PROJECTION_YEARS)
    expect(result.horizon.population).toBeGreaterThan(result.baseline.population * 0.8)
  })

  it('mass deportation reduces population vs status quo at 2076', () => {
    const statusQuo = runSimulation('usa', buildScenario('status_quo'))
    const deportation = runSimulation('usa', buildScenario('mass_deportation'))
    expect(deportation.horizon.population).toBeLessThan(statusQuo.horizon.population)
  })

  it('restrictive past policy diverges from recorded path by 2026', () => {
    const century = runCenturyView(
      'usa',
      buildScenario('restrictive'),
      buildScenario('status_quo'),
    )
    expect(century.insights.pastPolicyGapToday).not.toBe(0)
    expect(century.recorded).toHaveLength(51)
    expect(century.future).toHaveLength(51)
  })

  it('low TFR countries warn about population decline', () => {
    const result = runSimulation('japan', buildScenario('status_quo'))
    expect(result.warnings.some((w) => w.includes('TFR'))).toBe(true)
  })
})
