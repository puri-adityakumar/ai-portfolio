# Environment Setup Guide

## Overview

This guide covers the environment setup and deployment preparation for the AI Portfolio Chatbot application.

## Environment Variables

### Required Variables (for Chat Functionality)

The chat functionality requires an LLM API to be configured. The application supports multiple LLM providers through environment variables.

```bash
# LLM Configuration
LLM_API_KEY=your_api_key_here
LLM_MODEL=gpt-3.5-turbo
LLM_BASE_URL=https://api.openai.com/v1
```

### Optional Variables

```bash
# Site Configuration
NEXT_PUBLIC_SITE_URL=https://yoursite.com

# Analytics (if needed)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Development
NODE_ENV=development
```

## Supported LLM Providers

### 1. OpenAI (Default)
```bash
LLM_API_KEY=sk-your-openai-api-key
LLM_MODEL=gpt-3.5-turbo
LLM_BASE_URL=https://api.openai.com/v1
```

### 2. Anthropic Claude
```bash
LLM_API_KEY=sk-ant-your-anthropic-key
LLM_MODEL=claude-3-haiku-20240307
LLM_BASE_URL=https://api.anthropic.com/v1
```

### 3. Local LLM (Ollama)
```bash
LLM_API_KEY=not-required
LLM_MODEL=llama2
LLM_BASE_URL=http://localhost:11434/v1
```

### 4. Azure OpenAI
```bash
LLM_API_KEY=your-azure-api-key
LLM_MODEL=gpt-35-turbo
LLM_BASE_URL=https://your-resource.openai.azure.com/openai/deployments/your-deployment/chat/completions?api-version=2023-05-15
```

### 5. Custom LLM Provider
```bash
LLM_API_KEY=your-custom-api-key
LLM_MODEL=your-model-name
LLM_BASE_URL=https://your-custom-provider.com/v1
```

## Environment Files

### Development (.env.local)
Create a `.env.local` file in the root directory:

```bash
# Copy from .env.example and fill in your values
LLM_API_KEY=your_development_api_key
LLM_MODEL=gpt-3.5-turbo
LLM_BASE_URL=https://api.openai.com/v1
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Production (.env.production)
For production deployment:

```bash
LLM_API_KEY=your_production_api_key
LLM_MODEL=gpt-3.5-turbo
LLM_BASE_URL=https://api.openai.com/v1
NEXT_PUBLIC_SITE_URL=https://your-production-domain.com
NODE_ENV=production
```

## Deployment Configurations

### 1. Vercel Deployment

#### Environment Variables Setup
1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add the following variables:

```
LLM_API_KEY (Production) = your_production_api_key
LLM_MODEL (Production) = gpt-3.5-turbo
LLM_BASE_URL (Production) = https://api.openai.com/v1
NEXT_PUBLIC_SITE_URL (Production) = https://your-vercel-app.vercel.app
```

#### Vercel Configuration (vercel.json)
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "functions": {
    "app/api/chat/route.ts": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, DELETE, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type, Authorization"
        }
      ]
    }
  ]
}
```

### 2. Netlify Deployment

#### Environment Variables Setup
1. Go to Site settings → Environment variables
2. Add the required variables

#### Netlify Configuration (netlify.toml)
```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[functions]
  node_bundler = "esbuild"
```

### 3. Docker Deployment

#### Dockerfile
```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

#### Docker Compose (docker-compose.yml)
```yaml
version: '3.8'
services:
  ai-portfolio:
    build: .
    ports:
      - "3000:3000"
    environment:
      - LLM_API_KEY=${LLM_API_KEY}
      - LLM_MODEL=${LLM_MODEL}
      - LLM_BASE_URL=${LLM_BASE_URL}
      - NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
    env_file:
      - .env.production
```

### 4. Static Export (GitHub Pages, etc.)

For static hosting without API functionality:

#### Next.js Configuration
```typescript
// next.config.ts
const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  }
};
```

#### Build Commands
```bash
npm run build
npm run export
```

## Build Configuration

### Production Build Optimization

#### Next.js Configuration (next.config.ts)
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Production optimizations
  experimental: {
    optimizePackageImports: ['@/lib', '@/types'],
    optimizeCss: true,
  },
  
  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },

  // Enable compression
  compress: true,

  // For standalone deployment
  output: process.env.BUILD_STANDALONE === 'true' ? 'standalone' : undefined,

  // Security and performance headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

## Testing Different LLM Configurations

### 1. Local Testing Script

Create `scripts/test-llm-config.js`:

```javascript
const { spawn } = require('child_process');

const configs = [
  {
    name: 'OpenAI GPT-3.5',
    env: {
      LLM_API_KEY: process.env.OPENAI_API_KEY,
      LLM_MODEL: 'gpt-3.5-turbo',
      LLM_BASE_URL: 'https://api.openai.com/v1'
    }
  },
  {
    name: 'Local Ollama',
    env: {
      LLM_API_KEY: 'not-required',
      LLM_MODEL: 'llama2',
      LLM_BASE_URL: 'http://localhost:11434/v1'
    }
  }
];

async function testConfig(config) {
  console.log(`Testing ${config.name}...`);
  
  const env = { ...process.env, ...config.env };
  
  return new Promise((resolve) => {
    const child = spawn('npm', ['run', 'dev'], { env, stdio: 'pipe' });
    
    let output = '';
    child.stdout.on('data', (data) => {
      output += data.toString();
      if (output.includes('Ready in')) {
        child.kill();
        resolve(true);
      }
    });
    
    child.stderr.on('data', (data) => {
      console.error(`Error with ${config.name}:`, data.toString());
    });
    
    setTimeout(() => {
      child.kill();
      resolve(false);
    }, 30000); // 30 second timeout
  });
}

async function runTests() {
  for (const config of configs) {
    const success = await testConfig(config);
    console.log(`${config.name}: ${success ? '✅ PASS' : '❌ FAIL'}`);
  }
}

runTests();
```

### 2. Environment Validation

Create `lib/env-validation.ts`:

```typescript
export function validateEnvironment(): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check required environment variables for chat functionality
  if (!process.env.LLM_API_KEY) {
    warnings.push('LLM_API_KEY not set - chat functionality will be disabled');
  }

  if (!process.env.LLM_MODEL) {
    warnings.push('LLM_MODEL not set - using default model');
  }

  if (!process.env.LLM_BASE_URL) {
    warnings.push('LLM_BASE_URL not set - using default OpenAI URL');
  }

  // Check for common configuration issues
  if (process.env.LLM_BASE_URL && !process.env.LLM_BASE_URL.startsWith('http')) {
    errors.push('LLM_BASE_URL must start with http:// or https://');
  }

  // Validate site URL format
  if (process.env.NEXT_PUBLIC_SITE_URL && !process.env.NEXT_PUBLIC_SITE_URL.startsWith('http')) {
    errors.push('NEXT_PUBLIC_SITE_URL must start with http:// or https://');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}
```

## Deployment Checklist

### Pre-deployment
- [ ] Environment variables configured
- [ ] Build process tested locally
- [ ] LLM configuration validated
- [ ] Portfolio data updated in `data.json`
- [ ] SEO metadata reviewed
- [ ] Performance optimizations applied

### Post-deployment
- [ ] Site loads correctly
- [ ] Navigation works between all pages
- [ ] Chat functionality works (if configured)
- [ ] Portfolio content displays properly
- [ ] Mobile responsiveness verified
- [ ] SEO tags and meta data correct
- [ ] Performance metrics acceptable

## Troubleshooting

### Common Issues

1. **Chat not working**: Check LLM_API_KEY and LLM_BASE_URL
2. **Build failures**: Verify all dependencies are installed
3. **Images not loading**: Check image optimization settings
4. **Slow performance**: Review bundle size and optimize imports

### Debug Mode

Set `DEBUG=true` in environment to enable additional logging:

```bash
DEBUG=true npm run dev
```

## Security Considerations

1. **API Keys**: Never commit API keys to version control
2. **Environment Files**: Add `.env*` to `.gitignore`
3. **CORS**: Configure appropriate CORS headers for API routes
4. **Rate Limiting**: Implement rate limiting for chat API
5. **Input Validation**: Sanitize all user inputs

## Performance Optimization

1. **Bundle Analysis**: Use `ANALYZE=true npm run build` to analyze bundle size
2. **Image Optimization**: Ensure images are properly optimized
3. **Caching**: Configure appropriate cache headers
4. **CDN**: Use CDN for static assets in production
5. **Monitoring**: Set up performance monitoring tools