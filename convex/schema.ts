import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

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

export default defineSchema({
  users: defineTable({
    tokenIdentifier: v.string(),
    name: v.string(),
    email: v.string(),
    pictureUrl: v.optional(v.string()),
    role: v.union(v.literal('user'), v.literal('researcher'), v.literal('admin')),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index('by_token', ['tokenIdentifier'])
    .index('by_email', ['email']),

  savedScenarios: defineTable({
    userId: v.id('users'),
    title: v.string(),
    description: v.optional(v.string()),
    countryId: v.string(),
    scenario: policyScenario,
    isPublic: v.boolean(),
    citationSlug: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_user', ['userId'])
    .index('by_slug', ['citationSlug'])
    .index('by_public', ['isPublic']),

  simulationRuns: defineTable({
    userId: v.optional(v.id('users')),
    countryId: v.string(),
    scenario: policyScenario,
    baseline: yearSnapshot,
    horizon10: yearSnapshot,
    horizon20: yearSnapshot,
    horizon50: yearSnapshot,
    warnings: v.array(v.string()),
    sessionId: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index('by_user', ['userId'])
    .index('by_country', ['countryId'])
    .index('by_created', ['createdAt']),

  aiBriefs: defineTable({
    userId: v.id('users'),
    countryId: v.string(),
    scenario: policyScenario,
    briefMarkdown: v.string(),
    model: v.string(),
    createdAt: v.number(),
  }).index('by_user', ['userId']),
})
