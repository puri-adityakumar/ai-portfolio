# Design Document

## Overview

The AI Portfolio Chatbot is a Next.js application that provides a dual-interface portfolio experience. The system architecture prioritizes simplicity, performance, and maintainability by using a single data source, server-side rendering for SEO, and client-side interactivity for the chat experience.

### Key Design Principles
- **Single Source of Truth**: All portfolio data comes from `data.json`
- **Zero Backend Complexity**: Leverages Next.js API routes for minimal server logic
- **Progressive Enhancement**: Traditional portfolio works without JavaScript, chat requires it
- **Responsive Design**: Mobile-first approach with seamless desktop scaling
- **Accessibility First**: WCAG 2.1 AA compliance throughout

## Architecture

### High-Level Architecture

```mermaid
graph TB
    A[User] --> B[Next.js Frontend]
    B --> C[Homepage - Mode Selection]
    B --> D[Traditional Portfolio Page]
    B --> E[Chat Interface Page]
    
    D --> F[data.json]
    E --> G[API Route /api/chat]
    G --> F
    G --> H[LLM Service]
    
    E --> I[localStorage]
    
    subgraph "Data Layer"
        F[data.json]
    end
    
    subgraph "External Services"
        H[Configured LLM]
    end
```

### Technology Stack
- **Framework**: Next.js 14+ with App Router
- **Styling**: Tailwind CSS for utility-first styling
- **State Management**: React hooks + localStorage for chat persistence
- **LLM Integration**: Configurable through environment variables
- **Deployment**: Static export compatible for easy hosting

## Components and Interfaces

### Core Components

#### 1. Homepage Component (`/`)
- **Purpose**: Mode selection landing page
- **Props**: None (uses data.json for basic info)
- **Features**:
  - Hero section with professional's name and tagline
  - Two prominent CTA buttons for mode selection
  - Brief descriptions of each mode
  - Responsive design with smooth animations

#### 2. Traditional Portfolio Component (`/portfolio`)
- **Purpose**: Server-side rendered portfolio display
- **Props**: Portfolio data from data.json
- **Features**:
  - Professional header with photo and contact info
  - Sectioned layout: Experience, Projects, Skills, Education, Achievements
  - Smooth scroll navigation
  - Download CV functionality
  - SEO optimized with meta tags

#### 3. Chat Interface Component (`/chat`)
- **Purpose**: AI-powered conversational interface
- **Props**: None (loads data client-side)
- **Features**:
  - WhatsApp-like chat UI
  - Message streaming with typing indicators
  - Conversation persistence via localStorage
  - Suggested starter questions
  - Error handling for API failures

#### 4. Shared Components

##### ChatMessage Component
```typescript
interface ChatMessageProps {
  message: string;
  isUser: boolean;
  timestamp: Date;
  isStreaming?: boolean;
}
```

##### PortfolioSection Component
```typescript
interface PortfolioSectionProps {
  title: string;
  content: any;
  sectionId: string;
}
```

##### NavigationMenu Component
```typescript
interface NavigationMenuProps {
  currentPage: 'home' | 'portfolio' | 'chat';
  portfolioData: PortfolioData;
}
```

### API Interfaces

#### Chat API Route (`/api/chat`)
```typescript
// Request
interface ChatRequest {
  message: string;
  conversationHistory: ChatMessage[];
}

// Response (Streaming)
interface ChatResponse {
  content: string;
  done: boolean;
  error?: string;
}
```

#### Data Loading Interface
```typescript
interface PortfolioData {
  profile: {
    name: string;
    email: string;
    phone: string;
    github: string;
    githubUrl: string;
    linkedin: string;
    linkedinUrl: string;
    location: string;
    title: string;
    bio: string;
  };
  skills: {
    languages: string[];
    frameworks: string[];
    devops: string[];
    tools: string[];
  };
  experiences: ExperienceItem[];
  projects: ProjectItem[];
  achievements: Achievement[];
  education: EducationItem[];
}
```

## Data Models

### Primary Data Structure (data.json)

```json
{
  "profile": {
    "name": "Aditya Kumar Puri",
    "email": "kumar.adityapuri@gmail.com",
    "phone": "(+91) 1234567890",
    "github": "puriadityakumar",
    "githubUrl": "https://github.com/puriadityakumar",
    "linkedin": "puri-adityakumar",
    "linkedinUrl": "https://linkedin.com/in/puri-adityakumar",
    "location": "Kolkata, West Bengal, India",
    "title": "Software Engineer",
    "bio": "Software Engineer with expertise in full-stack development, AI/ML systems, and cloud architecture..."
  },
  "skills": {
    "languages": ["JavaScript", "Python", "SQL"],
    "frameworks": ["ReactJS", "NextJS", "FastAPI", "ExpressJS"],
    "devops": ["Git", "CI/CD", "Linux", "Kubernetes", "Docker", "AWS", "Azure"],
    "tools": ["Supabase", "Figma", "Slack", "GitLab", "n8n", "Langflow"]
  },
  "experiences": [
    {
      "id": "exp_1",
      "role": "Software Engineer Intern",
      "company": "FarAlpha",
      "location": "Remote",
      "period": "Apr 2025 – Sept 2025",
      "startDate": "2025-04",
      "endDate": "2025-09",
      "current": false,
      "highlights": [
        "Built file upload optimization and video processing systems using AWS Step Functions and EKS",
        "Set up monitoring infrastructure with Sentry, AWS CloudWatch, and RUM"
      ],
      "technologies": ["AWS Step Functions", "EKS", "Sentry", "AWS CloudWatch"]
    }
  ],
  "projects": [
    {
      "id": "proj_1",
      "name": "Clariq",
      "description": "AI-powered sales research platform automating prospect analysis",
      "techStack": ["FastAPI", "Next.js", "Cerebras LLM", "Exa API"],
      "githubUrl": "",
      "liveUrl": "",
      "highlights": [
        "AI-powered sales research platform automating prospect analysis",
        "Integrated neural search via Exa API with Cerebras LLM"
      ],
      "featured": true
    }
  ],
  "achievements": [
    {
      "id": "ach_1",
      "title": "1st Place: IndiaAI Impact Gen-AI Hackathon",
      "organization": "CNI IISc, IBM & CISCO",
      "date": "2024",
      "description": "Track 3: Agentic AI Applications - 'AyushmanAI'",
      "link": "",
      "category": "Hackathon"
    }
  ],
  "education": [
    {
      "id": "edu_1",
      "institution": "Brainware University",
      "degree": "Master of Computer Applications",
      "field": "Computer Applications",
      "location": "Barasat, West-Bengal",
      "period": "Aug. 2023 – July 2025",
      "startDate": "2023-08",
      "endDate": "2025-07",
      "current": true
    }
  ]
}
```

### Chat Context Formatting

The system transforms `data.json` into LLM-friendly context:

```typescript
function formatPortfolioForLLM(data: PortfolioData): string {
  return `
You are an AI assistant representing ${data.profile.name}, a ${data.profile.title}.

PROFILE:
- Name: ${data.profile.name}
- Title: ${data.profile.title}
- Location: ${data.profile.location}
- Bio: ${data.profile.bio}

EXPERIENCE:
${data.experiences.map(exp => `
- ${exp.role} at ${exp.company} (${exp.period})
  Location: ${exp.location}
  Key Highlights:
${exp.highlights.map(highlight => `  • ${highlight}`).join('\n')}
  Technologies: ${exp.technologies.join(', ')}
`).join('')}

PROJECTS:
${data.projects.map(project => `
- ${project.name}${project.featured ? ' (Featured)' : ''}
  ${project.description}
  Tech Stack: ${project.techStack.join(', ')}
  Key Highlights:
${project.highlights.map(highlight => `  • ${highlight}`).join('\n')}
`).join('')}

[Additional sections formatted similarly...]

Please answer questions about this professional's background, experience, and skills based on this information.
`;
}
```

## Error Handling

### Client-Side Error Handling

#### Chat Interface Errors
- **Network Failures**: Display retry button with exponential backoff
- **API Errors**: Show user-friendly error messages
- **Streaming Interruptions**: Allow message regeneration
- **localStorage Issues**: Graceful degradation without persistence

#### Portfolio Page Errors
- **Data Loading Failures**: Show error boundary with reload option
- **Image Loading Failures**: Fallback to placeholder images
- **Navigation Issues**: Ensure basic functionality remains

### Server-Side Error Handling

#### API Route Error Responses
```typescript
// Error response format
interface ErrorResponse {
  error: string;
  code: 'MISSING_ENV' | 'LLM_ERROR' | 'INVALID_REQUEST';
  message: string;
}
```

#### Environment Variable Validation
```typescript
function validateEnvironment(): void {
  const required = ['LLM_API_KEY', 'LLM_MODEL', 'LLM_BASE_URL'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  }
}
```

## Testing Strategy

### Unit Testing
- **Data Loading Functions**: Test JSON parsing and validation
- **Utility Functions**: Test data formatting and transformation
- **Component Logic**: Test state management and user interactions

### Integration Testing
- **API Routes**: Test chat endpoint with mock LLM responses
- **Page Rendering**: Test SSR with various data configurations
- **Client-Side Navigation**: Test routing between modes

### End-to-End Testing
- **User Flows**: Test complete user journeys through both interfaces
- **Responsive Design**: Test across different screen sizes
- **Accessibility**: Test keyboard navigation and screen reader compatibility

### Performance Testing
- **Load Times**: Ensure pages load within 2-second requirement
- **Bundle Size**: Monitor JavaScript bundle size for chat functionality
- **LLM Response Times**: Test streaming performance under load

## Deployment and Configuration

### Environment Variables
```bash
# Required for chat functionality
LLM_API_KEY=your_api_key_here
LLM_MODEL=gpt-3.5-turbo  # or your preferred model
LLM_BASE_URL=https://api.openai.com/v1  # or your LLM provider URL

# Optional
NEXT_PUBLIC_SITE_URL=https://yoursite.com
```

### Build Configuration
- **Static Export**: Configure for static hosting if needed
- **Image Optimization**: Set up Next.js image optimization
- **Bundle Analysis**: Monitor bundle size and optimize imports

### SEO Configuration
- **Meta Tags**: Dynamic meta tags based on data.json
- **Sitemap**: Auto-generated sitemap including all pages
- **Structured Data**: JSON-LD markup for rich snippets
- **Open Graph**: Social media preview optimization