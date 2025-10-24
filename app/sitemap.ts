import { MetadataRoute } from 'next'
import { getPortfolioData } from '@/lib/data'

export default function sitemap(): MetadataRoute.Sitemap {
  const portfolioData = getPortfolioData()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://localhost:3000'
  
  // Get the most recent update date from experiences or projects
  const getLastModified = () => {
    const dates = [
      ...portfolioData.experiences.map(exp => new Date(exp.startDate)),
      ...portfolioData.projects.map(() => new Date()), // Projects don't have dates, use current
      new Date() // Fallback to current date
    ]
    return dates.reduce((latest, current) => current > latest ? current : latest)
  }

  return [
    {
      url: siteUrl,
      lastModified: getLastModified(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${siteUrl}/portfolio`,
      lastModified: getLastModified(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/chat`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ]
}