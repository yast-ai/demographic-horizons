'use node'

import { v } from 'convex/values'
import { action } from './_generated/server'
import { createGateway } from '@ai-sdk/gateway'
import { generateText } from 'ai'
import { getCurrentUserViaAction } from './lib/actionAuth'

const migrationPolicy = v.union(
  v.literal('status_quo'),
  v.literal('restrictive'),
  v.literal('mass_deportation'),
  v.literal('moderate_immigration'),
  v.literal('high_skilled_immigration'),
  v.literal('humanitarian_refuge'),
)

export const generatePolicyBrief = action({
  args: {
    countryName: v.string(),
    migrationPolicy,
    horizon10Summary: v.string(),
    horizon20Summary: v.string(),
    horizon50Summary: v.string(),
    warnings: v.array(v.string()),
  },
  returns: v.object({
    brief: v.string(),
    model: v.string(),
  }),
  handler: async (ctx, args) => {
    await getCurrentUserViaAction(ctx)

    const gateway = createGateway({
      apiKey: process.env.AI_GATEWAY_API_KEY,
    })

    const modelId = 'openai/gpt-5.4-mini'
    const model = gateway(modelId)

    const { text } = await generateText({
      model,
      providerOptions: {
        gateway: {
          serviceTier: 'flex',
        },
      },
      system: `You are a neutral demographic policy analyst writing for academic and government audiences.
Write in clear, citation-ready prose. No political advocacy. No bias toward any country, religion, or ethnicity.
Present trade-offs honestly. Use markdown with sections: Executive Summary, Demographic Outlook, Economic Implications, Health & Social Systems, Key Uncertainties, Recommended Further Reading.
Keep under 800 words.`,
      prompt: `Country: ${args.countryName}
Policy: ${args.migrationPolicy}

10-year outlook: ${args.horizon10Summary}
20-year outlook: ${args.horizon20Summary}
50-year outlook: ${args.horizon50Summary}

Model warnings: ${args.warnings.join('; ')}

Generate a neutral policy brief based on these simulation outputs.`,
    })

    return { brief: text, model: modelId }
  },
})
