// Core data model interfaces for the portfolio application

export interface Profile {
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
}

export interface Skills {
  languages: string[];
  frameworks: string[];
  devops: string[];
  tools: string[];
}

export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  location: string;
  period: string;
  startDate: string;
  endDate: string;
  current: boolean;
  highlights: string[];
  technologies: string[];
}

export interface ProjectItem {
  id: string;
  name: string;
  description: string;
  techStack: string[];
  githubUrl: string;
  liveUrl: string | null;
  highlights: string[];
  featured: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  organization: string;
  date: string;
  description: string;
  link: string;
  category: string;
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  field: string;
  location: string;
  period: string;
  startDate: string;
  endDate: string;
  current: boolean;
}

export interface PortfolioData {
  profile: Profile;
  skills: Skills;
  experiences: ExperienceItem[];
  projects: ProjectItem[];
  achievements: Achievement[];
  education: EducationItem[];
}

// Chat-related interfaces
export interface ChatMessage {
  id: string;
  message: string;
  isUser: boolean;
  timestamp: Date;
  isStreaming?: boolean;
}

export interface ChatRequest {
  message: string;
  conversationHistory: ChatMessage[];
}

export interface ChatResponse {
  content: string;
  done: boolean;
  error?: string;
}

// API error response interface
export interface ErrorResponse {
  error: string;
  code: 'MISSING_ENV' | 'LLM_ERROR' | 'INVALID_REQUEST' | 'DATA_LOAD_ERROR' | 'INTERNAL_ERROR';
  message: string;
}

// Validation result interface
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}