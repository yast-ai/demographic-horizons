import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { getAuthAction } from '@workos/authkit-tanstack-react-start/client'
import ConvexProvider from '../integrations/convex/provider'
import { PostHogProvider } from '../integrations/posthog/provider'
import { SiteHeader } from '../components/layout/SiteHeader'
import { SiteFooter } from '../components/layout/SiteFooter'
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_OG_DESCRIPTION,
  SITE_TITLE,
  SITE_URL,
} from '../lib/site'

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
        title: SITE_TITLE,
      },
      {
        name: 'description',
        content: SITE_DESCRIPTION,
      },
      {
        property: 'og:title',
        content: SITE_TITLE,
      },
      {
        property: 'og:description',
        content: SITE_OG_DESCRIPTION,
      },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
      {
        name: 'keywords',
        content:
          'immigration population, migration policy simulation, demographic projection, population forecast, public policy research, century view',
      },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'canonical', href: SITE_URL },
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
        href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
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
      <body className="flex min-h-screen flex-col antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: SITE_NAME,
              description: SITE_DESCRIPTION,
              url: SITE_URL,
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
