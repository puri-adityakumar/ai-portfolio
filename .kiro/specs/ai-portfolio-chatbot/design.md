# Design Document

## Overview

The AI Portfolio Chatbot is architected as a Next.js 16 application using the App Router pattern, providing a dual-interface experience through three main routes: a landing page for mode selection, an AI-powered chat interface, and a traditional portfolio view. The system leverages server-side rendering for SEO optimization, client-side interactivity for the chat experience, and maintains a single source of truth through a structured JSON data file.

The architecture prioritizes simplicity by avoiding external databases, using localStorage for conversation persistence, and leveraging Vercel's serverless functions for API endpoints. The design ensures scalability through component modularity and maintainability through clear separation of concerns.

## Architecture

### High-Level System Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        A[Landing Page] --> B[Chat Interface]
        A --> C[Portfolio Interface]
        B --> D[Chat Components]
        C --> E[Portfolio Components]
    end
    
    subgraph "API Layer"
        F[/api/chat Route] --> G[OpenRouter API]
        F --> H[CV Data Processing]
    end
    
    subgraph "Data Layer"
        I[cv.json] --> H
        J[localStorage] --> D
    end
    
    subgraph "External Services"
        G --> K[GPT-4/Claude/Llama Models]
    end
    
    D --> F
    H --> D
```

### Application Flow

1. **Landing Page**: Users select between chat or portfolio mode
2. **Chat Mode**: Real-time AI conversations with streaming responses and memory
3. **Portfolio Mode**: Traditional structured presentation of CV data
4. **Data Flow**: Single cv.json file feeds both interfaces with consistent information

### Technology Stack Integration

- **Next.js 16 App Router**: Handles routing, SSR/CSR, and API routes
- **Vercel AI SDK**: Manages chat state, streaming, and localStorage persistence
- **OpenRouter**: Provides unified access to multiple LLM providers
- **Tailwind CSS 4**: Utility-first styling with design system consistency
- **TypeScript**: Type safety across all components and data structures

## Components and Interfaces

### Core Component Hierarchy

```
app/
├── layout.tsx                 # Root layout with metadata and fonts
├── page.tsx                   # Landing page with mode selection
├── chat/
│   └── page.tsx              # Chat interface container
├── portfolio/
│   └── page.tsx              # Portfolio interface container
└── api/
    └── chat/
        └── route.ts          # OpenRouter API integration
```

### Component Architecture

#### 1. Landing Page Components

```typescript
// app/page.tsx
interface ModeSelectionProps {
  onModeSelect: (mode: 'chat' | 'portfolio') => void;
}

// Components:
- ModeSelector: Main selection interface
- FeaturePreview: Brief descriptions of each mode
- Navigation: Header with branding
```

#### 2. Chat Interface Components

```typescript
// components/chat/
interface ChatInterfaceProps {
  cvData: CVData;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Components:
- ChatInterface: Main container with useChat hook
- MessageList: Scrollable message history
- MessageBubble: Individual message rendering
- ChatInput: Input field with send functionality
- SuggestedQuestions: Initial conversation starters
- TypingIndicator: Shows when AI is responding
```

#### 3. Portfolio Interface Components

```typescript
// components/portfolio/
interface PortfolioProps {
  cvData: CVData;
}

// Components:
- PortfolioLayout: Main container with navigation
- ProfileHeader: Hero section with contact info
- ExperienceSection: Work history with timeline
- ProjectsSection: Project cards with links
- SkillsSection: Categorized skills grid
- AchievementsSection: Awards and recognitions
- EducationSection: Academic background
- DownloadButton: CV download functionality
```

#### 4. Shared Components

```typescript
// components/shared/
- Navigation: Mode switching and branding
- Layout: Common wrapper for consistent styling
- LoadingSpinner: Reusable loading states
- ErrorBoundary: Error handling wrapper
```

### API Interface Design

#### Chat API Endpoint

```typescript
// app/api/chat/route.ts
interface ChatRequest {
  messages: Message[];
  model?: string;
}

interface ChatResponse {
  // Streaming response via AI SDK
  stream: ReadableStream;
}

// OpenRouter Integration:
- Model selection (GPT-4, Claude, Llama)
- Context injection with CV data
- Error handling and fallbacks
- Rate limiting protection
```

## Data Models

### Core Data Structures

```typescript
interface CVData {
  profile: Profile;
  skills: Skills;
  experiences: Experience[];
  projects: Project[];
  achievements: Achievement[];
  education: Education[];
}

interface Profile {
  name: string;
  email: string;
  phone: string;
  github: string;
  linkedin: string;
  portfolio: string;
  location: string;
  summary?: string;
}

interface Experience {
  id: string;
  role: string;
  company: string;
  location: string;
  period: string;
  startDate: string;
  endDate: string;
  highlights: string[];
  technologies?: string[];
}

interface Project {
  id: string;
  name: string;
  description: string;
  techStack: string[];
  githubUrl?: string;
  liveUrl?: string;
  highlights: string[];
  featured?: boolean;
}

interface Skills {
  languages: string[];
  frameworks: string[];
  devops: string[];
  tools: string[];
}

interface Achievement {
  id: string;
  title: string;
  organization: string;
  description: string;
  date?: string;
  link?: string;
}

interface Education {
  id: string;
  institution: string;
  degree: string;
  location: string;
  period: string;
  gpa?: string;
  coursework?: string[];
}
```

### Data Processing Utilities

```typescript
// lib/cv-utils.ts
export class CVDataProcessor {
  static formatForLLM(cvData: CVData): string;
  static formatDateRange(start: string, end: string): string;
  static getCategorySkills(skills: Skills, category: string): string[];
  static getFeaturedProjects(projects: Project[]): Project[];
  static validateCVData(data: unknown): CVData;
}
```

### Chat State Management

```typescript
// Using Vercel AI SDK
interface ChatState {
  messages: Message[];
  input: string;
  isLoading: boolean;
  error?: Error;
}

// Automatic localStorage persistence
// Conversation history maintained across sessions
// Context injection for each request
```

## Error Handling

### Error Categories and Responses

#### 1. API Errors

```typescript
interface APIError {
  code: 'RATE_LIMIT' | 'INVALID_KEY' | 'MODEL_UNAVAILABLE' | 'NETWORK_ERROR';
  message: string;
  retryable: boolean;
}

// Error Handling Strategy:
- Graceful degradation for LLM failures
- User-friendly error messages
- Automatic retry for transient errors
- Fallback to different models when available
```

#### 2. Data Validation Errors

```typescript
// CV Data Validation:
- Schema validation on application startup
- Graceful handling of missing optional fields
- Default values for required fields
- Error logging for debugging

// User Input Validation:
- Message length limits
- Content filtering for inappropriate input
- XSS prevention through sanitization
```

#### 3. Client-Side Error Handling

```typescript
// React Error Boundaries:
- Component-level error isolation
- Fallback UI for broken components
- Error reporting for debugging
- Graceful recovery mechanisms

// Network Error Handling:
- Connection timeout handling
- Offline state detection
- Retry mechanisms with exponential backoff
- User feedback for network issues
```

### Error Recovery Strategies

1. **LLM Failures**: Fallback to different models, cached responses, or error messages
2. **Data Loading**: Default to empty states with loading indicators
3. **Network Issues**: Offline indicators with retry options
4. **Component Crashes**: Error boundaries with reload options

## Testing Strategy

### Testing Pyramid Approach

#### 1. Unit Tests (Foundation)

```typescript
// Core Utilities Testing:
- CV data processing functions
- Date formatting utilities
- Data validation logic
- Error handling functions

// Component Logic Testing:
- Message formatting
- State management
- Event handlers
- Conditional rendering
```

#### 2. Integration Tests (Middle Layer)

```typescript
// API Integration:
- OpenRouter API communication
- Chat endpoint functionality
- Error response handling
- Model switching behavior

// Component Integration:
- Chat interface with API
- Portfolio data rendering
- Navigation between modes
- localStorage persistence
```

#### 3. End-to-End Tests (Top Layer)

```typescript
// User Journey Testing:
- Complete chat conversations
- Mode switching workflows
- Portfolio browsing experience
- Mobile responsiveness
- Accessibility compliance
```

### Testing Tools and Configuration

```typescript
// Testing Stack:
- Jest: Unit and integration testing
- React Testing Library: Component testing
- Playwright: E2E testing
- MSW: API mocking for tests

// Test Coverage Goals:
- 80%+ coverage for utility functions
- 70%+ coverage for components
- 100% coverage for critical paths (chat, API)
```

### Performance Testing

```typescript
// Metrics to Monitor:
- Time to First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- First Input Delay (FID)
- Cumulative Layout Shift (CLS)
- API response times
- Chat streaming latency

// Performance Budgets:
- Bundle size < 500KB
- Initial page load < 2s
- Chat response start < 1s
- Portfolio navigation < 500ms
```

### Accessibility Testing

```typescript
// Automated Testing:
- axe-core integration
- Lighthouse accessibility audits
- Color contrast validation
- Keyboard navigation testing

// Manual Testing:
- Screen reader compatibility
- Voice control testing
- High contrast mode
- Zoom functionality (up to 200%)
```

## Security Considerations

### API Security

```typescript
// Environment Variables:
- OPENROUTER_API_KEY: Server-side only
- Rate limiting per IP address
- Input sanitization for chat messages
- CORS configuration for API routes

// Request Validation:
- Message length limits (max 1000 chars)
- Content filtering for inappropriate input
- Request frequency limiting
- Authentication for sensitive operations
```

### Data Privacy

```typescript
// Data Handling:
- No persistent storage of user conversations on server
- localStorage data stays client-side
- No personal data collection beyond CV content
- GDPR compliance for EU visitors

// Content Security:
- CSP headers for XSS prevention
- Sanitized HTML rendering
- Safe external link handling
- Image optimization and validation
```

## Deployment Architecture

### Vercel Deployment Strategy

```typescript
// Build Configuration:
- Static generation for portfolio pages
- Server-side rendering for SEO
- Edge functions for API routes
- Automatic HTTPS and CDN

// Environment Setup:
- Production: vercel.com domain
- Preview: Branch-based deployments
- Development: Local with hot reload
- Environment variable management
```

### Performance Optimizations

```typescript
// Next.js Optimizations:
- Image optimization with next/image
- Font optimization with next/font
- Bundle splitting and code splitting
- Static asset caching
- Gzip compression

// Runtime Optimizations:
- React 19 concurrent features
- Streaming for chat responses
- Lazy loading for portfolio sections
- Service worker for offline support
```

This design provides a comprehensive blueprint for implementing the AI Portfolio Chatbot with clear architectural decisions, detailed component specifications, robust error handling, and thorough testing strategies. The modular design ensures maintainability while the performance considerations guarantee a smooth user experience.