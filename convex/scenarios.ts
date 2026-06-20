import { mutation, query } from './_generated/server'
import { v } from 'convex/values'
import { getCurrentUser, getCurrentUserOrNull } from './lib/auth'

const migrationPolicy = v.union(
  v.literal('status_quo'),
  v.literal('restrictive'),
  v.literal('mass_deportation'),
  v.literal('moderate_immigration'),
  v.literal('high_skilled_immigration'),
  v.literal('humanitarian_refuge'),
)

const policyScenario = v.object({
  migrationPolicy,
  integrationInvestment: v.number(),
  birthRateIncentive: v.number(),
  refugeeIntakePer1000: v.number(),
  skilledMigrationShare: v.number(),
})

const yearSnapshot = v.object({
  year: v.number(),
  population: v.number(),
  births: v.number(),
  deaths: v.number(),
  netMigration: v.number(),
  tfr: v.number(),
  medianAge: v.number(),
  lifeExpectancy: v.number(),
  gdpPerCapita: v.number(),
  gdpTotal: v.number(),
  dependencyRatio: v.number(),
  laborForceParticipation: v.number(),
  healthIndex: v.number(),
  wealthIndex: v.number(),
  inequalityIndex: v.number(),
  pensionBurden: v.number(),
  healthcareCapacityIndex: v.number(),
})

export const saveScenario = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    countryId: v.string(),
    scenario: policyScenario,
    isPublic: v.boolean(),
  },
  returns: v.id('savedScenarios'),
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx)
    const slug = args.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .slice(0, 48)

    const now = Date.now()
    return await ctx.db.insert('savedScenarios', {
      userId: user._id,
      title: args.title,
      description: args.description,
      countryId: args.countryId,
      scenario: args.scenario,
      isPublic: args.isPublic,
      citationSlug: `${slug}-${now.toString(36)}`,
      createdAt: now,
      updatedAt: now,
    })
  },
})

export const listMyScenarios = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id('savedScenarios'),
      title: v.string(),
      countryId: v.string(),
      citationSlug: v.optional(v.string()),
      isPublic: v.boolean(),
      createdAt: v.number(),
    }),
  ),
  handler: async (ctx) => {
    const user = await getCurrentUserOrNull(ctx)
    if (!user) return []

    const scenarios = await ctx.db
      .query('savedScenarios')
      .withIndex('by_user', (q) => q.eq('userId', user._id))
      .order('desc')
      .take(50)

    return scenarios.map((s) => ({
      _id: s._id,
      title: s.title,
      countryId: s.countryId,
      citationSlug: s.citationSlug,
      isPublic: s.isPublic,
      createdAt: s.createdAt,
    }))
  },
})

export const logSimulationRun = mutation({
  args: {
    countryId: v.string(),
    scenario: policyScenario,
    baseline: yearSnapshot,
    horizon10: yearSnapshot,
    horizon20: yearSnapshot,
    horizon50: yearSnapshot,
    warnings: v.array(v.string()),
    sessionId: v.optional(v.string()),
  },
  returns: v.id('simulationRuns'),
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrNull(ctx)

    return await ctx.db.insert('simulationRuns', {
      userId: user?._id,
      countryId: args.countryId,
      scenario: args.scenario,
      baseline: args.baseline,
      horizon10: args.horizon10,
      horizon20: args.horizon20,
      horizon50: args.horizon50,
      warnings: args.warnings,
      sessionId: args.sessionId,
      createdAt: Date.now(),
    })
  },
})

export const getAggregateStats = query({
  args: {},
  returns: v.object({
    totalRuns: v.number(),
    topCountries: v.array(
      v.object({ countryId: v.string(), count: v.number() }),
    ),
  }),
  handler: async (ctx) => {
    const runs = await ctx.db.query('simulationRuns').order('desc').take(500)
    const counts = new Map<string, number>()
    for (const run of runs) {
      counts.set(run.countryId, (counts.get(run.countryId) ?? 0) + 1)
    }
    const topCountries = [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([countryId, count]) => ({ countryId, count }))

    return { totalRuns: runs.length, topCountries }
  },
})
