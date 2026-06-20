import { COUNTRIES } from '#/lib/data/countries'
import { runSimulation } from '#/lib/simulation/engine'
import { buildScenario } from '#/lib/simulation/policies'

const REPLACEMENT_TFR = 2.1

const COUNTRY_SHORT: Record<string, string> = {
  usa: 'USA',
  canada: 'Canada',
  mexico: 'Mexico',
  brazil: 'Brazil',
  uk: 'UK',
  germany: 'Germany',
  france: 'France',
  japan: 'Japan',
  india: 'India',
  china: 'China',
  nigeria: 'Nigeria',
  australia: 'Australia',
}

export function getFertilityInsights() {
  return COUNTRIES.map((c) => ({
    name: COUNTRY_SHORT[c.id] ?? c.name,
    fullName: c.name,
    tfr: c.tfr,
    displayTfr: Math.min(c.tfr, 2.5),
    belowReplacement: c.tfr < REPLACEMENT_TFR,
  })).sort((a, b) => a.tfr - b.tfr)
}

export function getPolicyCompareInsights() {
  return COUNTRIES.map((country) => {
    const restrictive = runSimulation(country.id, buildScenario('restrictive'), 20)
    const expansion = runSimulation(country.id, buildScenario('moderate_immigration'), 20)
    const r20 = restrictive.horizons[20]
    const e20 = expansion.horizons[20]
    return {
      country: COUNTRY_SHORT[country.id] ?? country.name,
      countryId: country.id,
      restrictive:
        ((r20.population - restrictive.baseline.population) /
          restrictive.baseline.population) *
        100,
      expansion:
        ((e20.population - expansion.baseline.population) /
          expansion.baseline.population) *
        100,
    }
  })
}

export function getCountryPopulationOutlook() {
  return COUNTRIES.map((country) => {
    const statusQuo = runSimulation(country.id, buildScenario('status_quo'), 20)
    const restrictive = runSimulation(country.id, buildScenario('restrictive'), 20)
    const expansion = runSimulation(country.id, buildScenario('moderate_immigration'), 20)
    const sq = statusQuo.horizons[20].population
    const r = restrictive.horizons[20].population
    const e = expansion.horizons[20].population

    return {
      countryId: country.id,
      name: COUNTRY_SHORT[country.id] ?? country.name,
      fullName: country.name,
      statusQuoM: Math.round(sq / 1_000_000),
      restrictiveM: Math.round(r / 1_000_000),
      expansionM: Math.round(e / 1_000_000),
      policySpreadPct: ((e - r) / r) * 100,
    }
  }).sort((a, b) => b.statusQuoM - a.statusQuoM)
}

export function getGlobalHeadlineStats() {
  const belowReplacement = COUNTRIES.filter((c) => c.tfr < REPLACEMENT_TFR).length
  const avgTfr = COUNTRIES.reduce((s, c) => s + c.tfr, 0) / COUNTRIES.length

  const policySpreads = COUNTRIES.map((country) => {
    const restrictive = runSimulation(country.id, buildScenario('restrictive'), 20)
    const expansion = runSimulation(country.id, buildScenario('moderate_immigration'), 20)
    const r = restrictive.horizons[20].population
    const e = expansion.horizons[20].population
    return ((e - r) / r) * 100
  })
  const avgPolicySpread =
    policySpreads.reduce((s, v) => s + v, 0) / policySpreads.length

  return {
    belowReplacement,
    totalCountries: COUNTRIES.length,
    avgTfr: avgTfr.toFixed(2),
    avgPolicySpread: avgPolicySpread.toFixed(1),
  }
}
