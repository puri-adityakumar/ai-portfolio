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
          backgroundColor: '#1e293b',
          backgroundImage: 'linear-gradient(45deg, #1e293b 0%, #334155 100%)',
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
          <h1
            style={{
              fontSize: '72px',
              fontWeight: 'bold',
              marginBottom: '20px',
              background: 'linear-gradient(90deg, #60a5fa 0%, #a78bfa 100%)',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            {portfolioData.profile.name}
          </h1>
          <p
            style={{
              fontSize: '36px',
              marginBottom: '30px',
              color: '#e2e8f0',
            }}
          >
            {portfolioData.profile.title}
          </p>
          <p
            style={{
              fontSize: '24px',
              color: '#cbd5e1',
              maxWidth: '800px',
              lineHeight: '1.4',
            }}
          >
            {portfolioData.profile.bio.substring(0, 120)}...
          </p>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}