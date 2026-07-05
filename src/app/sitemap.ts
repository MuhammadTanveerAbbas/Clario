import { MetadataRoute } from 'next'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://clario-hub.vercel.app'

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ['', '/pricing', '/privacy', '/terms', '/refund', '/sign-in', '/sign-up']

  return routes.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === '' ? 'weekly' : 'monthly',
    priority: path === '' ? 1 : 0.7,
  }))
}
