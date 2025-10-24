import { ImageResponse } from 'next/og'
import { getPortfolioData } from '@/lib/data'

export const runtime = 'edge'
export const alt = 'Portfolio'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  const portfolioData = getPortfolioData()

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0f172a',
          backgroundImage: 'linear-gradient(45deg, #0f172a 0%, #1e293b 100%)',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            color: 'white',
            padding: '40px',
          }}
        >
          <div
            style={{
              fontSize: '48px',
              marginBottom: '20px',
              background: 'linear-gradient(90deg, #10b981 0%, #06b6d4 100%)',
              backgroundClip: 'text',
              color: 'transparent',
              fontWeight: 'bold',
            }}
          >
            📋 PORTFOLIO
          </div>
          <h1
            style={{
              fontSize: '64px',
              fontWeight: 'bold',
              marginBottom: '20px',
              color: 'white',
            }}
          >
            {portfolioData.profile.name}
          </h1>
          <p
            style={{
              fontSize: '32px',
              marginBottom: '30px',
              color: '#e2e8f0',
            }}
          >
            {portfolioData.profile.title}
          </p>
          <div
            style={{
              display: 'flex',
              gap: '20px',
              fontSize: '20px',
              color: '#cbd5e1',
            }}
          >
            <span>{portfolioData.experiences.length} Experiences</span>
            <span>•</span>
            <span>{portfolioData.projects.length} Projects</span>
            <span>•</span>
            <span>{portfolioData.achievements.length} Awards</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}