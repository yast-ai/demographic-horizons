import type { ActionCtx } from '../_generated/server'

export async function getCurrentUserViaAction(ctx: ActionCtx): Promise<void> {
  const identity = await ctx.auth.getUserIdentity()
  if (!identity) {
    throw new Error('Sign in required for AI policy briefs')
  }
}
