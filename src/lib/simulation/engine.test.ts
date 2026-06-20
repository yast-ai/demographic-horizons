import { describe, expect, it } from 'vitest'
import { runSimulation } from './engine'
import { buildScenario } from './policies'

describe('demographic simulation engine', () => {
  it('produces stable baseline trajectory for status quo', () => {
    const result = runSimulation('usa', buildScenario('status_quo'), 50)
    expect(result.trajectory).toHaveLength(51)
    expect(result.horizons[10].population).toBeGreaterThan(0)
    expect(result.horizons[50].population).toBeGreaterThan(result.baseline.population * 0.8)
  })

  it('mass deportation reduces population vs status quo at 20 years', () => {
    const statusQuo = runSimulation('usa', buildScenario('status_quo'), 20)
    const deportation = runSimulation('usa', buildScenario('mass_deportation'), 20)
    expect(deportation.horizons[20].population).toBeLessThan(
      statusQuo.horizons[20].population,
    )
  })

  it('high skilled immigration improves wealth index vs restrictive policy', () => {
    const skilled = runSimulation('germany', buildScenario('high_skilled_immigration'), 20)
    const restrictive = runSimulation('germany', buildScenario('restrictive'), 20)
    expect(skilled.horizons[20].wealthIndex).toBeGreaterThan(
      restrictive.horizons[20].wealthIndex,
    )
  })

  it('low TFR countries warn about population decline', () => {
    const result = runSimulation('japan', buildScenario('status_quo'), 50)
    expect(result.warnings.some((w) => w.includes('TFR'))).toBe(true)
  })
})
