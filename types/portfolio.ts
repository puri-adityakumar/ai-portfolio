// Core data model interfaces for the portfolio application

export interface PersonalInfo {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  photo: string;
}

export interface ExperienceItem {
  company: string;
  position: string;
  duration: string;
  description: string;
  technologies: string[];
}

export interface ProjectItem {
  name: string;
  description: string;
  technologies: string[];
  link: string;
  github: string;
}

export interface SkillCategory {
  category: string;
  items: string[];
}

export interface EducationItem {
  institution: string;
  degree: string;
  field: string;
  duration: string;
  gpa: string | null;
}

export interface SocialLink {
  platform: string;
  url: string;
}

export interface PortfolioData {
  personal: PersonalInfo;
  experience: ExperienceItem[];
  projects: ProjectItem[];
  skills: SkillCategory[];
  education: EducationItem[];
  achievements: string[];
  social: SocialLink[];
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
  code: 'MISSING_ENV' | 'LLM_ERROR' | 'INVALID_REQUEST' | 'DATA_LOAD_ERROR';
  message: string;
}

// Validation result interface
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}