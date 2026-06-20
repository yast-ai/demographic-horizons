import { mutation, query } from './_generated/server'
import { v } from 'convex/values'
import { getCurrentUser } from './lib/auth'

export const storeUser = mutation({
  args: {},
  returns: v.id('users'),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Not authenticated')
    }

    const existing = await ctx.db
      .query('users')
      .withIndex('by_token', (q) =>
        q.eq('tokenIdentifier', identity.tokenIdentifier),
      )
      .unique()

    if (existing) {
      await ctx.db.patch(existing._id, { updatedAt: Date.now() })
      return existing._id
    }

    return await ctx.db.insert('users', {
      tokenIdentifier: identity.tokenIdentifier,
      name: identity.name ?? 'Researcher',
      email: identity.email ?? '',
      pictureUrl: identity.pictureUrl,
      role: 'user',
      createdAt: Date.now(),
    })
  },
})

export const currentUser = query({
  args: {},
  returns: v.union(
    v.object({
      _id: v.id('users'),
      name: v.string(),
      email: v.string(),
      role: v.union(
        v.literal('user'),
        v.literal('researcher'),
        v.literal('admin'),
      ),
    }),
    v.null(),
  ),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return null

    const user = await ctx.db
      .query('users')
      .withIndex('by_token', (q) =>
        q.eq('tokenIdentifier', identity.tokenIdentifier),
      )
      .unique()

    if (!user) return null

    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    }
  },
})
