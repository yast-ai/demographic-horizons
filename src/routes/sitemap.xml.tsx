import { createFileRoute } from '@tanstack/react-router'

const BASE = 'https://demographic-horizons.org'

const PAGES = [
  { loc: '/', priority: '1.0', changefreq: 'weekly' },
  { loc: '/simulate', priority: '0.9', changefreq: 'weekly' },
  { loc: '/methodology', priority: '0.8', changefreq: 'monthly' },
  { loc: '/sources', priority: '0.8', changefreq: 'monthly' },
]

export const Route = createFileRoute('/sitemap/xml')({
  server: {
    handlers: {
      GET: () => {
        const lastmod = new Date().toISOString().split('T')[0]
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${PAGES.map(
  (p) => `  <url>
    <loc>${BASE}${p.loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`,
).join('\n')}
</urlset>`

        return new Response(xml, {
          headers: { 'Content-Type': 'application/xml' },
        })
      },
    },
  },
})
