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
 * @throws Error if required environment variables are missing or invalid
 */
export function validateEnvironment(): EnvConfig {
  const errors: string[] = [];
  
  // Check for required variables
  const required = ['LLM_API_KEY', 'LLM_MODEL', 'LLM_BASE_URL'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    errors.push(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  // Validate API key format (basic validation)
  if (process.env.LLM_API_KEY) {
    const apiKey = process.env.LLM_API_KEY;
    if (apiKey.length < 10) {
      errors.push('LLM_API_KEY appears to be too short');
    }
    if (apiKey.includes(' ')) {
      errors.push('LLM_API_KEY should not contain spaces');
    }
  }
  
  // Validate model name
  if (process.env.LLM_MODEL) {
    const model = process.env.LLM_MODEL;
    if (model.length === 0) {
      errors.push('LLM_MODEL cannot be empty');
    }
  }
  
  // Validate base URL format
  if (process.env.LLM_BASE_URL) {
    const baseUrl = process.env.LLM_BASE_URL;
    try {
      new URL(baseUrl);
    } catch {
      errors.push('LLM_BASE_URL must be a valid URL');
    }
    
    if (!baseUrl.startsWith('https://') && !baseUrl.startsWith('http://')) {
      errors.push('LLM_BASE_URL must start with http:// or https://');
    }
  }
  
  // Validate site URL if provided
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    try {
      new URL(process.env.NEXT_PUBLIC_SITE_URL);
    } catch {
      errors.push('NEXT_PUBLIC_SITE_URL must be a valid URL');
    }
  }
  
  if (errors.length > 0) {
    throw new Error(`Environment validation failed:\n${errors.map(e => `- ${e}`).join('\n')}`);
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