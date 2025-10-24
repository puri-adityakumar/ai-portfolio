import { ImageResponse } from 'next/og'
import { getPortfolioData } from '@/lib/data'

export const runtime = 'edge'
export const alt = 'Chat with AI'
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
          backgroundColor: '#1e1b4b',
          backgroundImage: 'linear-gradient(45deg, #1e1b4b 0%, #3730a3 100%)',
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
              fontSize: '72px',
              marginBottom: '20px',
            }}
          >
            💬
          </div>
          <div
            style={{
              fontSize: '48px',
              marginBottom: '20px',
              background: 'linear-gradient(90deg, #60a5fa 0%, #a78bfa 100%)',
              backgroundClip: 'text',
              color: 'transparent',
              fontWeight: 'bold',
            }}
          >
            CHAT WITH AI
          </div>
          <h1
            style={{
              fontSize: '56px',
              fontWeight: 'bold',
              marginBottom: '20px',
              color: 'white',
            }}
          >
            About {portfolioData.profile.name}
          </h1>
          <p
            style={{
              fontSize: '28px',
              marginBottom: '30px',
              color: '#e2e8f0',
            }}
          >
            {portfolioData.profile.title}
          </p>
          <p
            style={{
              fontSize: '22px',
              color: '#cbd5e1',
              maxWidth: '800px',
              lineHeight: '1.4',
            }}
          >
            Ask me anything about experience, projects, and skills
          </p>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}