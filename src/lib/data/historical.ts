/**
 * Historical population anchors (circa UN WPP 2024 revision).
 * Used for the recorded 1976–2026 path; counterfactuals use the simulation engine.
 */

import { HISTORY_START, PRESENT_YEAR } from '../simulation/types'

export interface HistoricalAnchor {
  year: number
  population: number
  medianAge: number
  tfr: number
}

export interface Historical1976Baseline {
  population: number
  tfr: number
  lifeExpectancy: number
  netMigrationRate: number
  youthPct: number
  workingAgePct: number
  elderlyPct: number
  giniIndex: number
  productivityGrowth: number
}

export interface CountryHistorical {
  id: string
  anchors: Array<HistoricalAnchor>
  baseline1976: Historical1976Baseline
}

/** Population & age-structure milestones every 10 years, 1976–2026 */
export const COUNTRY_HISTORICAL: Record<string, CountryHistorical> = {
  usa: {
    id: 'usa',
    anchors: [
      { year: 1976, population: 218_000_000, medianAge: 28.0, tfr: 1.77 },
      { year: 1986, population: 240_000_000, medianAge: 31.0, tfr: 1.89 },
      { year: 1996, population: 269_000_000, medianAge: 34.0, tfr: 2.03 },
      { year: 2006, population: 298_000_000, medianAge: 36.2, tfr: 2.11 },
      { year: 2016, population: 323_000_000, medianAge: 37.9, tfr: 1.82 },
      { year: 2026, population: 341_000_000, medianAge: 38.9, tfr: 1.62 },
    ],
    baseline1976: {
      population: 218_000_000,
      tfr: 1.77,
      lifeExpectancy: 72.8,
      netMigrationRate: 0.9,
      youthPct: 0.28,
      workingAgePct: 0.6,
      elderlyPct: 0.12,
      giniIndex: 38,
      productivityGrowth: 0.014,
    },
  },
  canada: {
    id: 'canada',
    anchors: [
      { year: 1976, population: 24_000_000, medianAge: 27.5, tfr: 1.75 },
      { year: 1986, population: 26_000_000, medianAge: 30.0, tfr: 1.65 },
      { year: 1996, population: 29_000_000, medianAge: 35.5, tfr: 1.55 },
      { year: 2006, population: 33_000_000, medianAge: 38.5, tfr: 1.53 },
      { year: 2016, population: 36_000_000, medianAge: 40.5, tfr: 1.53 },
      { year: 2026, population: 41_000_000, medianAge: 41.5, tfr: 1.33 },
    ],
    baseline1976: {
      population: 24_000_000,
      tfr: 1.75,
      lifeExpectancy: 75.0,
      netMigrationRate: 2.8,
      youthPct: 0.29,
      workingAgePct: 0.62,
      elderlyPct: 0.09,
      giniIndex: 32,
      productivityGrowth: 0.011,
    },
  },
  mexico: {
    id: 'mexico',
    anchors: [
      { year: 1976, population: 62_000_000, medianAge: 20.0, tfr: 4.5 },
      { year: 1986, population: 78_000_000, medianAge: 22.0, tfr: 3.6 },
      { year: 1996, population: 94_000_000, medianAge: 24.0, tfr: 2.8 },
      { year: 2006, population: 107_000_000, medianAge: 26.5, tfr: 2.3 },
      { year: 2016, population: 120_000_000, medianAge: 28.0, tfr: 2.1 },
      { year: 2026, population: 130_000_000, medianAge: 29.5, tfr: 1.85 },
    ],
    baseline1976: {
      population: 62_000_000,
      tfr: 4.5,
      lifeExpectancy: 65.0,
      netMigrationRate: -0.8,
      youthPct: 0.42,
      workingAgePct: 0.52,
      elderlyPct: 0.06,
      giniIndex: 45,
      productivityGrowth: 0.018,
    },
  },
  germany: {
    id: 'germany',
    anchors: [
      { year: 1976, population: 78_000_000, medianAge: 36.0, tfr: 1.45 },
      { year: 1986, population: 78_000_000, medianAge: 37.5, tfr: 1.37 },
      { year: 1996, population: 82_000_000, medianAge: 39.0, tfr: 1.28 },
      { year: 2006, population: 82_000_000, medianAge: 42.0, tfr: 1.33 },
      { year: 2016, population: 83_000_000, medianAge: 45.5, tfr: 1.5 },
      { year: 2026, population: 85_000_000, medianAge: 47.5, tfr: 1.35 },
    ],
    baseline1976: {
      population: 78_000_000,
      tfr: 1.45,
      lifeExpectancy: 72.5,
      netMigrationRate: 0.3,
      youthPct: 0.22,
      workingAgePct: 0.64,
      elderlyPct: 0.14,
      giniIndex: 30,
      productivityGrowth: 0.012,
    },
  },
  uk: {
    id: 'uk',
    anchors: [
      { year: 1976, population: 56_000_000, medianAge: 32.0, tfr: 1.74 },
      { year: 1986, population: 57_000_000, medianAge: 35.0, tfr: 1.78 },
      { year: 1996, population: 58_000_000, medianAge: 37.0, tfr: 1.71 },
      { year: 2006, population: 61_000_000, medianAge: 39.0, tfr: 1.76 },
      { year: 2016, population: 66_000_000, medianAge: 40.5, tfr: 1.8 },
      { year: 2026, population: 68_000_000, medianAge: 41.0, tfr: 1.49 },
    ],
    baseline1976: {
      population: 56_000_000,
      tfr: 1.74,
      lifeExpectancy: 73.5,
      netMigrationRate: 0.2,
      youthPct: 0.26,
      workingAgePct: 0.62,
      elderlyPct: 0.12,
      giniIndex: 32,
      productivityGrowth: 0.011,
    },
  },
  france: {
    id: 'france',
    anchors: [
      { year: 1976, population: 53_000_000, medianAge: 31.0, tfr: 1.85 },
      { year: 1986, population: 55_000_000, medianAge: 33.0, tfr: 1.78 },
      { year: 1996, population: 58_000_000, medianAge: 35.5, tfr: 1.73 },
      { year: 2006, population: 61_000_000, medianAge: 38.0, tfr: 1.98 },
      { year: 2016, population: 65_000_000, medianAge: 40.5, tfr: 1.96 },
      { year: 2026, population: 68_000_000, medianAge: 42.0, tfr: 1.68 },
    ],
    baseline1976: {
      population: 53_000_000,
      tfr: 1.85,
      lifeExpectancy: 73.8,
      netMigrationRate: 0.6,
      youthPct: 0.27,
      workingAgePct: 0.62,
      elderlyPct: 0.11,
      giniIndex: 31,
      productivityGrowth: 0.01,
    },
  },
  japan: {
    id: 'japan',
    anchors: [
      { year: 1976, population: 113_000_000, medianAge: 31.0, tfr: 1.75 },
      { year: 1986, population: 121_000_000, medianAge: 34.0, tfr: 1.72 },
      { year: 1996, population: 126_000_000, medianAge: 39.0, tfr: 1.43 },
      { year: 2006, population: 128_000_000, medianAge: 43.0, tfr: 1.32 },
      { year: 2016, population: 127_000_000, medianAge: 46.5, tfr: 1.44 },
      { year: 2026, population: 123_000_000, medianAge: 49.0, tfr: 1.2 },
    ],
    baseline1976: {
      population: 113_000_000,
      tfr: 1.75,
      lifeExpectancy: 75.0,
      netMigrationRate: 0.05,
      youthPct: 0.24,
      workingAgePct: 0.66,
      elderlyPct: 0.1,
      giniIndex: 28,
      productivityGrowth: 0.015,
    },
  },
  china: {
    id: 'china',
    anchors: [
      { year: 1976, population: 943_000_000, medianAge: 20.0, tfr: 2.8 },
      { year: 1986, population: 1_065_000_000, medianAge: 23.0, tfr: 2.5 },
      { year: 1996, population: 1_220_000_000, medianAge: 27.0, tfr: 1.65 },
      { year: 2006, population: 1_314_000_000, medianAge: 32.0, tfr: 1.55 },
      { year: 2016, population: 1_379_000_000, medianAge: 37.0, tfr: 1.62 },
      { year: 2026, population: 1_409_000_000, medianAge: 40.0, tfr: 1.09 },
    ],
    baseline1976: {
      population: 943_000_000,
      tfr: 2.8,
      lifeExpectancy: 65.5,
      netMigrationRate: -0.05,
      youthPct: 0.38,
      workingAgePct: 0.55,
      elderlyPct: 0.07,
      giniIndex: 32,
      productivityGrowth: 0.045,
    },
  },
  india: {
    id: 'india',
    anchors: [
      { year: 1976, population: 643_000_000, medianAge: 19.0, tfr: 4.8 },
      { year: 1986, population: 788_000_000, medianAge: 21.0, tfr: 4.2 },
      { year: 1996, population: 964_000_000, medianAge: 23.0, tfr: 3.4 },
      { year: 2006, population: 1_134_000_000, medianAge: 25.0, tfr: 2.7 },
      { year: 2016, population: 1_326_000_000, medianAge: 27.5, tfr: 2.2 },
      { year: 2026, population: 1_441_000_000, medianAge: 29.0, tfr: 2.0 },
    ],
    baseline1976: {
      population: 643_000_000,
      tfr: 4.8,
      lifeExpectancy: 52.0,
      netMigrationRate: -0.1,
      youthPct: 0.4,
      workingAgePct: 0.54,
      elderlyPct: 0.06,
      giniIndex: 38,
      productivityGrowth: 0.035,
    },
  },
  australia: {
    id: 'australia',
    anchors: [
      { year: 1976, population: 14_000_000, medianAge: 28.0, tfr: 1.9 },
      { year: 1986, population: 16_000_000, medianAge: 30.5, tfr: 1.85 },
      { year: 1996, population: 18_000_000, medianAge: 34.0, tfr: 1.78 },
      { year: 2006, population: 20_000_000, medianAge: 37.0, tfr: 1.81 },
      { year: 2016, population: 24_000_000, medianAge: 37.5, tfr: 1.79 },
      { year: 2026, population: 27_000_000, medianAge: 38.5, tfr: 1.58 },
    ],
    baseline1976: {
      population: 14_000_000,
      tfr: 1.9,
      lifeExpectancy: 74.0,
      netMigrationRate: 3.5,
      youthPct: 0.28,
      workingAgePct: 0.62,
      elderlyPct: 0.1,
      giniIndex: 34,
      productivityGrowth: 0.013,
    },
  },
  brazil: {
    id: 'brazil',
    anchors: [
      { year: 1976, population: 114_000_000, medianAge: 20.0, tfr: 4.0 },
      { year: 1986, population: 144_000_000, medianAge: 22.0, tfr: 3.2 },
      { year: 1996, population: 164_000_000, medianAge: 24.0, tfr: 2.4 },
      { year: 2006, population: 188_000_000, medianAge: 27.0, tfr: 2.0 },
      { year: 2016, population: 207_000_000, medianAge: 31.0, tfr: 1.75 },
      { year: 2026, population: 217_000_000, medianAge: 34.0, tfr: 1.64 },
    ],
    baseline1976: {
      population: 114_000_000,
      tfr: 4.0,
      lifeExpectancy: 62.0,
      netMigrationRate: 0.1,
      youthPct: 0.38,
      workingAgePct: 0.55,
      elderlyPct: 0.07,
      giniIndex: 52,
      productivityGrowth: 0.02,
    },
  },
  nigeria: {
    id: 'nigeria',
    anchors: [
      { year: 1976, population: 66_000_000, medianAge: 17.0, tfr: 6.8 },
      { year: 1986, population: 85_000_000, medianAge: 17.5, tfr: 6.5 },
      { year: 1996, population: 110_000_000, medianAge: 18.0, tfr: 6.0 },
      { year: 2006, population: 140_000_000, medianAge: 18.5, tfr: 5.5 },
      { year: 2016, population: 186_000_000, medianAge: 18.0, tfr: 5.3 },
      { year: 2026, population: 230_000_000, medianAge: 18.5, tfr: 4.3 },
    ],
    baseline1976: {
      population: 66_000_000,
      tfr: 6.8,
      lifeExpectancy: 47.0,
      netMigrationRate: -0.2,
      youthPct: 0.44,
      workingAgePct: 0.52,
      elderlyPct: 0.04,
      giniIndex: 43,
      productivityGrowth: 0.022,
    },
  },
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

function interpolateAnchors(
  anchors: Array<HistoricalAnchor>,
  year: number,
): HistoricalAnchor {
  if (year <= anchors[0]!.year) return anchors[0]!
  if (year >= anchors[anchors.length - 1]!.year) return anchors[anchors.length - 1]!

  for (let i = 0; i < anchors.length - 1; i++) {
    const left = anchors[i]!
    const right = anchors[i + 1]!
    if (year >= left.year && year <= right.year) {
      const t = (year - left.year) / (right.year - left.year)
      return {
        year,
        population: Math.round(lerp(left.population, right.population, t)),
        medianAge: Number(lerp(left.medianAge, right.medianAge, t).toFixed(1)),
        tfr: Number(lerp(left.tfr, right.tfr, t).toFixed(2)),
      }
    }
  }
  return anchors[anchors.length - 1]!
}

export function getCountryHistorical(countryId: string): CountryHistorical | undefined {
  return COUNTRY_HISTORICAL[countryId]
}

/** Interpolate recorded population path, one point per year 1976–2026 */
export function buildRecordedSeries(countryId: string): Array<{
  year: number
  population: number
  medianAge: number
  tfr: number
}> {
  const hist = COUNTRY_HISTORICAL[countryId]
  if (!hist) return []

  const series: Array<{ year: number; population: number; medianAge: number; tfr: number }> = []
  for (let year = HISTORY_START; year <= PRESENT_YEAR; year++) {
    const point = interpolateAnchors(hist.anchors, year)
    series.push(point)
  }
  return series
}
