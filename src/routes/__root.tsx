import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { getAuthAction } from '@workos/authkit-tanstack-react-start/client'
import ConvexProvider from '../integrations/convex/provider'
import { PostHogProvider } from '../integrations/posthog/provider'
import { SiteHeader } from '../components/layout/SiteHeader'
import { SiteFooter } from '../components/layout/SiteFooter'

import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Demographic Horizons — Migration Policy Simulation',
      },
      {
        name: 'description',
        content:
          'Simulate how immigration and deportation policies affect population, economy, health, and wealth over 10, 20, and 50 years. Neutral, citation-ready research tool.',
      },
      {
        property: 'og:title',
        content: 'Demographic Horizons — Migration Policy Simulation',
      },
      {
        property: 'og:description',
        content:
          'Explore long-run demographic futures under different migration policies. Built for researchers, students, and policymakers.',
      },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
      {
        name: 'keywords',
        content:
          'immigration simulation, demographic projection, deportation policy, population forecast, migration policy research',
      },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'canonical', href: 'https://demographic-horizons.org' },
      {
        rel: 'preconnect',
        href: 'https://fonts.googleapis.com',
      },
      {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossOrigin: 'anonymous',
      },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&family=Instrument+Serif:ital@0;1&display=swap',
      },
    ],
  }),
  loader: async () => {
    try {
      const auth = await getAuthAction()
      return { auth }
    } catch {
      return { auth: undefined }
    }
  },
  notFoundComponent: () => (
    <div className="flex min-h-[50vh] items-center justify-center">
      <p className="font-display text-2xl text-ink-muted">Page not found</p>
    </div>
  ),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  const { auth } = Route.useLoaderData()

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="grain flex min-h-screen flex-col antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'Demographic Horizons',
              description:
                'Cohort-based simulation of immigration and deportation policy effects on population, economy, health, and wealth over 10, 20, and 50 years.',
              url: 'https://demographic-horizons.org',
              applicationCategory: 'EducationalApplication',
              operatingSystem: 'Web',
              offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
              creator: { '@type': 'Organization', name: 'YAST AI' },
            }),
          }}
        />
        <ConvexProvider initialAuth={auth}>
          <PostHogProvider>
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </PostHogProvider>
        </ConvexProvider>
        <Scripts />
      </body>
    </html>
  )
}
