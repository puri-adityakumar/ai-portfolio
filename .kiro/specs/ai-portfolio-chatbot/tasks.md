# Implementation Plan

- [ ] 1. Set up project dependencies and core configuration
  - Install required dependencies: Vercel AI SDK, OpenRouter integration, and additional TypeScript types
  - Configure environment variables for OpenRouter API key
  - Update Next.js configuration for API routes and optimization settings
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 2. Create CV data structure and utilities
  - [ ] 2.1 Create TypeScript interfaces for CV data models
    - Define Profile, Experience, Project, Skills, Achievement, and Education interfaces
    - Create main CVData interface that combines all data types
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  
  - [ ] 2.2 Implement CV data processing utilities
    - Create CVDataProcessor class with methods for LLM formatting and data manipulation
    - Implement date formatting, skills categorization, and featured project filtering
    - Add data validation functions for CV structure
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  
  - [ ] 2.3 Create sample CV data file
    - Create cv.json file with Aditya's complete portfolio information
    - Structure data according to defined TypeScript interfaces
    - Include all sections: profile, skills, experiences, projects, achievements, education
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 3. Implement shared components and layout system
  - [ ] 3.1 Create base layout components
    - Implement Navigation component for mode switching
    - Create Layout wrapper component for consistent styling
    - Add LoadingSpinner and ErrorBoundary components
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 7.1, 7.2, 7.3, 7.4_
  
  - [ ] 3.2 Update root layout with proper metadata and styling
    - Configure metadata for SEO optimization
    - Set up proper font loading and CSS variables
    - Add accessibility attributes to HTML structure
    - _Requirements: 6.1, 6.2, 7.1, 7.2, 7.3, 7.4, 8.1, 8.2, 8.3, 8.4_

- [ ] 4. Build landing page with mode selection
  - [ ] 4.1 Create mode selection interface
    - Implement ModeSelector component with two prominent buttons
    - Add feature descriptions for each mode
    - Style with Tailwind CSS for modern, clean appearance
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  
  - [ ] 4.2 Implement navigation to chat and portfolio modes
    - Set up Next.js routing to /chat and /portfolio pages
    - Add smooth transitions between modes
    - Ensure proper accessibility for navigation elements
    - _Requirements: 1.2, 1.3, 6.5, 7.1, 7.2_

- [ ] 5. Implement OpenRouter API integration
  - [ ] 5.1 Create chat API route with OpenRouter integration
    - Set up /api/chat/route.ts with POST handler
    - Integrate OpenRouter API for multiple LLM provider access
    - Implement streaming response handling with Vercel AI SDK
    - _Requirements: 2.2, 2.3, 5.1, 5.2, 5.3, 5.4_
  
  - [ ] 5.2 Add CV context injection and error handling
    - Format CV data for LLM context in each request
    - Implement comprehensive error handling for API failures
    - Add rate limiting and input validation for security
    - _Requirements: 2.2, 2.4, 4.1, 4.2, 5.3, 5.4_

- [ ] 6. Build chat interface components
  - [ ] 6.1 Create core chat components
    - Implement ChatInterface container with useChat hook from AI SDK
    - Build MessageList component for conversation history display
    - Create MessageBubble component for individual message rendering
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_
  
  - [ ] 6.2 Implement chat input and interaction features
    - Build ChatInput component with send functionality
    - Add SuggestedQuestions component for conversation starters
    - Implement TypingIndicator for real-time response feedback
    - _Requirements: 2.1, 2.2, 2.3, 2.6, 6.3, 7.1, 7.2, 7.4_
  
  - [ ] 6.3 Add conversation persistence and memory
    - Configure automatic localStorage persistence via AI SDK
    - Implement conversation history restoration on page refresh
    - Ensure full conversation context is sent with each LLM request
    - _Requirements: 2.4, 2.5_

- [ ] 7. Build traditional portfolio interface
  - [ ] 7.1 Create portfolio layout and navigation
    - Implement PortfolioLayout component with section navigation
    - Add smooth scrolling between portfolio sections
    - Create responsive design that works across all device sizes
    - _Requirements: 3.1, 3.2, 3.4, 6.1, 6.2, 6.4, 7.1, 7.2, 7.3_
  
  - [ ] 7.2 Implement profile and contact sections
    - Build ProfileHeader component with hero section and contact information
    - Style with professional appearance and clear typography
    - Add social media links and contact details from CV data
    - _Requirements: 3.2, 4.1, 4.2, 8.1, 8.2, 8.4_
  
  - [ ] 7.3 Create experience and projects sections
    - Implement ExperienceSection with timeline layout for work history
    - Build ProjectsSection with project cards, links, and technology stacks
    - Display data from cv.json with proper formatting and styling
    - _Requirements: 3.2, 4.1, 4.2, 6.4, 8.1, 8.2_
  
  - [ ] 7.4 Add skills, achievements, and education sections
    - Create SkillsSection with categorized skills grid layout
    - Implement AchievementsSection for awards and recognitions
    - Build EducationSection with academic background timeline
    - _Requirements: 3.2, 4.1, 4.2_
  
  - [ ] 7.5 Implement CV download functionality
    - Add DownloadButton component for CV file download
    - Ensure proper file handling and user experience
    - _Requirements: 3.5_

- [ ] 8. Add SEO optimization and metadata
  - [ ] 8.1 Configure dynamic metadata for all pages
    - Set up proper title, description, and Open Graph tags
    - Add structured data markup (JSON-LD) for search engines
    - Configure social media preview cards
    - _Requirements: 8.1, 8.2, 8.3, 8.4_
  
  - [ ] 8.2 Implement server-side rendering optimizations
    - Ensure portfolio page uses SSR for optimal SEO
    - Configure proper caching headers for static assets
    - Add sitemap generation for search engine indexing
    - _Requirements: 6.2, 8.1, 8.2, 8.3_

- [ ] 9. Implement performance optimizations
  - [ ] 9.1 Add image optimization and lazy loading
    - Use Next.js Image component for optimized image loading
    - Implement lazy loading for portfolio sections
    - Optimize bundle size with proper code splitting
    - _Requirements: 6.1, 6.4_
  
  - [ ] 9.2 Add loading states and error handling
    - Implement loading spinners for chat responses and page transitions
    - Add comprehensive error boundaries for graceful failure handling
    - Create user-friendly error messages for API failures
    - _Requirements: 6.3, 5.3, 5.4_

- [ ] 10. Enhance accessibility and final polish
  - [ ] 10.1 Implement comprehensive accessibility features
    - Add proper ARIA labels and semantic HTML throughout
    - Ensure keyboard navigation works for all interactive elements
    - Test and fix color contrast ratios for WCAG compliance
    - _Requirements: 7.1, 7.2, 7.3, 7.4_
  
  - [ ] 10.2 Add final styling and responsive design
    - Polish all components with consistent Tailwind CSS styling
    - Ensure responsive design works perfectly on mobile, tablet, and desktop
    - Add smooth animations and transitions for better user experience
    - _Requirements: 3.4, 6.1, 6.5_
  
  - [ ]* 10.3 Write comprehensive unit tests
    - Create unit tests for CV data processing utilities
    - Test chat component logic and state management
    - Write tests for portfolio component rendering and data display
    - _Requirements: 4.1, 4.2, 2.1, 2.2, 3.1, 3.2_