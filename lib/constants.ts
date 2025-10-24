/**
 * Application constants and configuration
 */

export const APP_CONFIG = {
  // Site metadata
  SITE_NAME: 'AI Portfolio Chatbot',
  SITE_DESCRIPTION: 'Interactive portfolio with AI-powered chat interface',
  
  // Chat configuration
  MAX_CONVERSATION_HISTORY: 50,
  CHAT_STORAGE_KEY: 'portfolio-chat-history',
  TYPING_DELAY: 50, // milliseconds between characters when streaming
  
  // Performance targets
  MAX_LOAD_TIME: 2000, // 2 seconds
  
  // Suggested starter questions
  STARTER_QUESTIONS: [
    "Tell me about your experience with React and Node.js",
    "What's your most challenging project you've worked on?",
    "What technologies do you specialize in?",
    "Can you describe your background and career journey?",
    "What kind of projects are you most passionate about?",
    "Tell me about your education and certifications"
  ],
  
  // Error messages
  ERROR_MESSAGES: {
    DATA_LOAD_FAILED: 'Failed to load portfolio data. Please try refreshing the page.',
    CHAT_API_ERROR: 'Sorry, I encountered an error. Please try again.',
    NETWORK_ERROR: 'Network error. Please check your connection and try again.',
    VALIDATION_ERROR: 'Invalid data format detected.',
    ENV_CONFIG_ERROR: 'Application configuration error. Please contact the administrator.'
  }
} as const;

export const ROUTES = {
  HOME: '/',
  PORTFOLIO: '/portfolio',
  CHAT: '/chat',
  API_CHAT: '/api/chat'
} as const;

export const BREAKPOINTS = {
  SM: '640px',
  MD: '768px',
  LG: '1024px',
  XL: '1280px',
  '2XL': '1536px'
} as const;