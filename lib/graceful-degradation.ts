/**
 * Graceful degradation utilities for handling missing or invalid data
 */

import { PortfolioData } from '@/types/portfolio';

/**
 * Default fallback values for portfolio data
 */
const DEFAULT_PORTFOLIO_DATA: Partial<PortfolioData> = {
  profile: {
    name: 'Portfolio Owner',
    email: 'contact@example.com',
    phone: 'Not available',
    github: 'github-username',
    githubUrl: '#',
    linkedin: 'linkedin-username',
    linkedinUrl: '#',
    location: 'Location not specified',
    title: 'Professional',
    bio: 'Professional portfolio showcasing experience and projects.'
  },
  skills: {
    languages: ['JavaScript', 'Python'],
    frameworks: ['React', 'Node.js'],
    devops: ['Git', 'Docker'],
    tools: ['VS Code', 'GitHub']
  },
  experiences: [],
  projects: [],
  achievements: [],
  education: []
};

/**
 * Validates and provides fallbacks for portfolio data
 */
export function validatePortfolioData(data: any): PortfolioData {
  if (!data || typeof data !== 'object') {
    console.warn('Invalid portfolio data, using defaults');
    return DEFAULT_PORTFOLIO_DATA as PortfolioData;
  }

  const validated: PortfolioData = {
    profile: {
      name: data.profile?.name || DEFAULT_PORTFOLIO_DATA.profile!.name,
      email: data.profile?.email || DEFAULT_PORTFOLIO_DATA.profile!.email,
      phone: data.profile?.phone || DEFAULT_PORTFOLIO_DATA.profile!.phone,
      github: data.profile?.github || DEFAULT_PORTFOLIO_DATA.profile!.github,
      githubUrl: data.profile?.githubUrl || DEFAULT_PORTFOLIO_DATA.profile!.githubUrl,
      linkedin: data.profile?.linkedin || DEFAULT_PORTFOLIO_DATA.profile!.linkedin,
      linkedinUrl: data.profile?.linkedinUrl || DEFAULT_PORTFOLIO_DATA.profile!.linkedinUrl,
      location: data.profile?.location || DEFAULT_PORTFOLIO_DATA.profile!.location,
      title: data.profile?.title || DEFAULT_PORTFOLIO_DATA.profile!.title,
      bio: data.profile?.bio || DEFAULT_PORTFOLIO_DATA.profile!.bio
    },
    skills: {
      languages: Array.isArray(data.skills?.languages) ? data.skills.languages : DEFAULT_PORTFOLIO_DATA.skills!.languages,
      frameworks: Array.isArray(data.skills?.frameworks) ? data.skills.frameworks : DEFAULT_PORTFOLIO_DATA.skills!.frameworks,
      devops: Array.isArray(data.skills?.devops) ? data.skills.devops : DEFAULT_PORTFOLIO_DATA.skills!.devops,
      tools: Array.isArray(data.skills?.tools) ? data.skills.tools : DEFAULT_PORTFOLIO_DATA.skills!.tools
    },
    experiences: Array.isArray(data.experiences) ? data.experiences.filter(exp => exp && exp.role && exp.company) : [],
    projects: Array.isArray(data.projects) ? data.projects.filter(proj => proj && proj.name && proj.description) : [],
    achievements: Array.isArray(data.achievements) ? data.achievements.filter(ach => ach && ach.title) : [],
    education: Array.isArray(data.education) ? data.education.filter(edu => edu && edu.institution && edu.degree) : []
  };

  return validated;
}

/**
 * Safe data accessor with fallback values
 */
export function safeGet<T>(obj: any, path: string, fallback: T): T {
  try {
    const keys = path.split('.');
    let current = obj;
    
    for (const key of keys) {
      if (current == null || typeof current !== 'object') {
        return fallback;
      }
      current = current[key];
    }
    
    return current !== undefined ? current : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Safe array accessor that ensures we always get an array
 */
export function safeArray<T>(value: any, fallback: T[] = []): T[] {
  return Array.isArray(value) ? value : fallback;
}

/**
 * Safe string accessor with fallback
 */
export function safeString(value: any, fallback: string = ''): string {
  return typeof value === 'string' ? value : fallback;
}

/**
 * Safe number accessor with fallback
 */
export function safeNumber(value: any, fallback: number = 0): number {
  const num = Number(value);
  return isNaN(num) ? fallback : num;
}

/**
 * Check if portfolio data has minimum required content
 */
export function hasMinimumContent(data: PortfolioData): boolean {
  return !!(
    data.profile?.name &&
    data.profile?.title &&
    (data.experiences?.length > 0 || data.projects?.length > 0)
  );
}

/**
 * Generate fallback content when data is missing
 */
export function generateFallbackContent(section: string): string {
  const fallbacks: Record<string, string> = {
    experience: 'Experience information is currently being updated. Please check back soon.',
    projects: 'Project portfolio is currently being updated. Please check back soon.',
    skills: 'Skills information is currently being updated.',
    education: 'Education information is currently being updated.',
    achievements: 'Achievements information is currently being updated.',
    bio: 'Professional bio is currently being updated.'
  };

  return fallbacks[section] || 'Information is currently being updated. Please check back soon.';
}

/**
 * Error recovery for data loading failures
 */
export class DataLoadError extends Error {
  constructor(
    message: string,
    public readonly section?: string,
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = 'DataLoadError';
  }
}

/**
 * Wrapper for safe data loading with error recovery
 */
export async function safeDataLoad<T>(
  loader: () => Promise<T> | T,
  fallback: T,
  errorHandler?: (error: Error) => void
): Promise<T> {
  try {
    const result = await loader();
    return result;
  } catch (error) {
    const dataError = new DataLoadError(
      'Failed to load data',
      undefined,
      error instanceof Error ? error : new Error(String(error))
    );
    
    if (errorHandler) {
      errorHandler(dataError);
    } else {
      console.warn('Data loading failed, using fallback:', dataError.message);
    }
    
    return fallback;
  }
}

/**
 * Create a degraded version of portfolio data for offline/error scenarios
 */
export function createDegradedPortfolio(partialData?: Partial<PortfolioData>): PortfolioData {
  return {
    ...DEFAULT_PORTFOLIO_DATA,
    ...partialData
  } as PortfolioData;
}

/**
 * Check if we're in a degraded state and show appropriate messaging
 */
export function getDegradationMessage(missingData: string[]): string | null {
  if (missingData.length === 0) return null;
  
  if (missingData.length === 1) {
    return `${missingData[0]} information is currently unavailable.`;
  }
  
  if (missingData.length <= 3) {
    return `${missingData.join(', ')} information is currently unavailable.`;
  }
  
  return 'Some portfolio information is currently unavailable. Please try refreshing the page.';
}