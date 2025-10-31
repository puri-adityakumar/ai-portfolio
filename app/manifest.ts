import { MetadataRoute } from 'next'
import { getPortfolioData } from '@/lib/data'

export default function manifest(): MetadataRoute.Manifest {
  const portfolioData = getPortfolioData()
  
  return {
    name: portfolioData.profile.name,
    short_name: portfolioData.profile.name,
    description: portfolioData.profile.bio,
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#1e293b',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}