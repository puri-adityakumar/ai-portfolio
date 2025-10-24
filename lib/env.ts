/**
 * Environment variable validation utilities
 */

export interface EnvConfig {
  LLM_API_KEY: string;
  LLM_MODEL: string;
  LLM_BASE_URL: string;
  NEXT_PUBLIC_SITE_URL?: string;
}

/**
 * Validates required environment variables for LLM functionality
 * @throws Error if required environment variables are missing
 */
export function validateEnvironment(): EnvConfig {
  const required = ['LLM_API_KEY', 'LLM_MODEL', 'LLM_BASE_URL'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  return {
    LLM_API_KEY: process.env.LLM_API_KEY!,
    LLM_MODEL: process.env.LLM_MODEL!,
    LLM_BASE_URL: process.env.LLM_BASE_URL!,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  };
}

/**
 * Gets environment configuration with defaults
 * @returns Partial<EnvConfig> - Environment configuration object
 */
export function getEnvConfig(): Partial<EnvConfig> {
  return {
    LLM_API_KEY: process.env.LLM_API_KEY,
    LLM_MODEL: process.env.LLM_MODEL || 'gpt-3.5-turbo',
    LLM_BASE_URL: process.env.LLM_BASE_URL || 'https://api.openai.com/v1',
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  };
}