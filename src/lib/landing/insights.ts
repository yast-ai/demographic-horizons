import { COUNTRIES } from '#/lib/data/countries'
import { buildRecordedSeries } from '#/lib/data/historical'
import { runCenturyView } from '#/lib/simulation/century'
import { pctChange } from '#/lib/simulation/engine'
import { buildScenario } from '#/lib/simulation/policies'
import { PRESENT_YEAR, PROJECTION_YEARS } from '#/lib/simulation/types'

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
    const restrictive = buildScenario('restrictive')
    const expansion = buildScenario('moderate_immigration')
    const centuryRestrict = runCenturyView(country.id, restrictive, restrictive)
    const centuryExpand = runCenturyView(country.id, expansion, expansion)
    const r2076 = centuryRestrict.future[PROJECTION_YEARS]!
    const e2076 = centuryExpand.future[PROJECTION_YEARS]!
    const today = centuryRestrict.recorded[centuryRestrict.recorded.length - 1]!

    return {
      country: COUNTRY_SHORT[country.id] ?? country.name,
      countryId: country.id,
      restrictive: pctChange(today.population, r2076.population),
      expansion: pctChange(today.population, e2076.population),
    }
  })
}

export function getCountryPopulationOutlook() {
  return COUNTRIES.map((country) => {
    const century = runCenturyView(
      country.id,
      buildScenario('status_quo'),
      buildScenario('status_quo'),
    )
    const restrictive = runCenturyView(
      country.id,
      buildScenario('restrictive'),
      buildScenario('restrictive'),
    )
    const expansion = runCenturyView(
      country.id,
      buildScenario('moderate_immigration'),
      buildScenario('moderate_immigration'),
    )
    const sq = century.future[PROJECTION_YEARS]!
    const r = restrictive.future[PROJECTION_YEARS]!
    const e = expansion.future[PROJECTION_YEARS]!

    return {
      countryId: country.id,
      name: COUNTRY_SHORT[country.id] ?? country.name,
      fullName: country.name,
      statusQuoM: Math.round(sq.population / 1_000_000),
      restrictiveM: Math.round(r.population / 1_000_000),
      expansionM: Math.round(e.population / 1_000_000),
      policySpreadPct: ((e.population - r.population) / r.population) * 100,
    }
  }).sort((a, b) => b.statusQuoM - a.statusQuoM)
}

export function getCenturyGrowthInsights() {
  return COUNTRIES.map((country) => {
    const recorded = buildRecordedSeries(country.id)
    const pop1976 = recorded[0]!.population
    const pop2026 = recorded[recorded.length - 1]!.population
    const century = runCenturyView(
      country.id,
      buildScenario('moderate_immigration'),
      buildScenario('status_quo'),
    )

    return {
      countryId: country.id,
      name: COUNTRY_SHORT[country.id] ?? country.name,
      growth1976to2026: pctChange(pop1976, pop2026),
      counterfactualGapToday: century.insights.pastPolicyGapToday,
      future2076: century.insights.population2076,
    }
  })
}

export function getGlobalHeadlineStats() {
  const belowReplacement = COUNTRIES.filter((c) => c.tfr < REPLACEMENT_TFR).length
  const avgTfr = COUNTRIES.reduce((s, c) => s + c.tfr, 0) / COUNTRIES.length

  const usa = runCenturyView(
    'usa',
    buildScenario('restrictive'),
    buildScenario('moderate_immigration'),
  )

  return {
    belowReplacement,
    totalCountries: COUNTRIES.length,
    avgTfr: avgTfr.toFixed(2),
    usaPastGap: Math.abs(usa.insights.pastPolicyGapToday / 1_000_000).toFixed(1),
    usaPastGapSigned: usa.insights.pastPolicyGapToday / 1_000_000,
    usaFutureSpread: usa.insights.futureChangePct,
    presentYear: PRESENT_YEAR,
  }
}

/** Landing hero: USA century chart data */
export function getUsaCenturyPreview() {
  return runCenturyView(
    'usa',
    buildScenario('restrictive'),
    buildScenario('status_quo'),
    buildScenario('moderate_immigration'),
  )
}
