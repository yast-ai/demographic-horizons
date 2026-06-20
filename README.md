# popline.fyi

Population projections by country and migration policy — over **10, 20, and 50 year** horizons.

Built for researchers, students, and policymakers who need citation-ready demographic projections.

## Stack

- **[TanStack Start](https://tanstack.com/start)** — full-stack React with SSR
- **[Convex](https://convex.dev)** — scenario persistence, analytics aggregation, AI actions
- **[WorkOS AuthKit](https://workos.com/docs/authkit)** — authentication (AI briefs, saved scenarios)
- **[PostHog](https://posthog.com)** — product analytics & error tracking
- **[Vercel AI Gateway](https://vercel.com/docs/ai-gateway)** — GPT-5.4 mini with flex pricing for policy briefs
- **[Vercel](https://vercel.com)** — deployment

## Quick start

```bash
cp .env.example .env.local
# Fill in Convex, WorkOS, PostHog, and AI Gateway keys

npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Simulation engine

The cohort-component model (`src/lib/simulation/engine.ts`) advances country baselines year-by-year:

- Births & deaths from TFR and life expectancy
- Net migration with policy multipliers and deportation shocks
- Age structure evolution with migration age bias
- GDP per capita from productivity, labor force, and dependency ratio
- Composite health & wealth indices

Run tests:

```bash
npm test
```

## Auth model

| Feature | Access |
|---------|--------|
| Landing, methodology, sources | Public |
| Full simulation & export | Public |
| AI policy brief | Sign in (WorkOS) |
| Save scenarios | Sign in (WorkOS) |

## Deployment

**Live:** https://popline.fyi

### Convex

| Deployment | URL |
|------------|-----|
| Dev | `https://robust-guineapig-942.convex.cloud` |
| Prod | `https://graceful-jellyfish-679.convex.cloud` |

```bash
npx convex dev     # development
npx convex deploy  # production (also runs via Vercel build:production)
```

**Where env vars live:**
- **Convex dev** (`npx convex env set`): `AI_GATEWAY_API_KEY` + WorkOS (auto-provisioned by AuthKit)
- **Convex prod** (`npx convex env set --prod`): `AI_GATEWAY_API_KEY` + WorkOS (auto-provisioned on deploy)
- **Vercel production only**: `CONVEX_DEPLOY_KEY`, `VITE_CONVEX_URL`, WorkOS server/client vars, PostHog

### Vercel

Point the production domain to `popline.fyi` in Vercel project settings, then:

```bash
vercel --prod
```

See `.env.example` for the full variable map.

## Citation

```
YAST AI. (2026). popline.fyi: Population projections by country and migration policy.
Retrieved from https://popline.fyi
```

## Growth strategy (1M+ views)

1. **SEO** — methodology & sources pages target “immigration demographic projection” queries
2. **Universities** — APA citation block, JSON export, transparent assumptions
3. **Shareable URLs** — `/simulate?country=usa&policy=restrictive`
4. **Embeds** — iframe-friendly charts for newsrooms (future)
5. **Open data** — GitHub-hosted baseline CSV for reproducibility (future)

## License

MIT — model code and baselines are open for academic use with attribution.
