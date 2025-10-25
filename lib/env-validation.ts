export interface EnvironmentValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  chatEnabled: boolean;
}

export function validateEnvironment(): EnvironmentValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  let chatEnabled = true;

  // Check required environment variables for chat functionality
  if (!process.env.LLM_API_KEY) {
    warnings.push('LLM_API_KEY not set - chat functionality will be disabled');
    chatEnabled = false;
  }

  if (!process.env.LLM_MODEL) {
    warnings.push('LLM_MODEL not set - using default model (gpt-3.5-turbo)');
  }

  if (!process.env.LLM_BASE_URL) {
    warnings.push('LLM_BASE_URL not set - using default OpenAI URL');
  }

  // Check for common configuration issues
  if (process.env.LLM_BASE_URL && !process.env.LLM_BASE_URL.startsWith('http')) {
    errors.push('LLM_BASE_URL must start with http:// or https://');
    chatEnabled = false;
  }

  // Validate site URL format
  if (process.env.NEXT_PUBLIC_SITE_URL && !process.env.NEXT_PUBLIC_SITE_URL.startsWith('http')) {
    errors.push('NEXT_PUBLIC_SITE_URL must start with http:// or https://');
  }

  // Check for API key format (basic validation)
  if (process.env.LLM_API_KEY) {
    const apiKey = process.env.LLM_API_KEY;
    
    // OpenAI key validation
    if (process.env.LLM_BASE_URL?.includes('openai.com') && !apiKey.startsWith('sk-')) {
      warnings.push('OpenAI API key should start with "sk-"');
    }
    
    // Anthropic key validation
    if (process.env.LLM_BASE_URL?.includes('anthropic.com') && !apiKey.startsWith('sk-ant-')) {
      warnings.push('Anthropic API key should start with "sk-ant-"');
    }
    
    // Check for placeholder values
    if (apiKey.includes('your_') || apiKey.includes('example') || apiKey === 'not-required') {
      if (!process.env.LLM_BASE_URL?.includes('localhost')) {
        warnings.push('API key appears to be a placeholder value');
        chatEnabled = false;
      }
    }
  }

  // Validate model names
  if (process.env.LLM_MODEL) {
    const model = process.env.LLM_MODEL;
    const baseUrl = process.env.LLM_BASE_URL || '';
    
    // OpenAI model validation
    if (baseUrl.includes('openai.com')) {
      const validOpenAIModels = ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo', 'gpt-4o'];
      if (!validOpenAIModels.some(validModel => model.includes(validModel.split('-')[0]))) {
        warnings.push(`Model "${model}" may not be valid for OpenAI`);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    chatEnabled
  };
}

export function getEnvironmentConfig() {
  return {
    llmApiKey: process.env.LLM_API_KEY || '',
    llmModel: process.env.LLM_MODEL || 'gpt-3.5-turbo',
    llmBaseUrl: process.env.LLM_BASE_URL || 'https://api.openai.com/v1',
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    nodeEnv: process.env.NODE_ENV || 'development',
    debug: process.env.DEBUG === 'true',
  };
}

export function logEnvironmentStatus() {
  const validation = validateEnvironment();
  const config = getEnvironmentConfig();
  
  console.log('🔧 Environment Configuration:');
  console.log(`   Node Environment: ${config.nodeEnv}`);
  console.log(`   Site URL: ${config.siteUrl}`);
  console.log(`   LLM Model: ${config.llmModel}`);
  console.log(`   LLM Base URL: ${config.llmBaseUrl}`);
  console.log(`   Chat Enabled: ${validation.chatEnabled ? '✅' : '❌'}`);
  
  if (validation.warnings.length > 0) {
    console.log('⚠️  Warnings:');
    validation.warnings.forEach(warning => console.log(`   - ${warning}`));
  }
  
  if (validation.errors.length > 0) {
    console.log('❌ Errors:');
    validation.errors.forEach(error => console.log(`   - ${error}`));
  }
  
  if (validation.isValid && validation.chatEnabled) {
    console.log('✅ Environment configuration is valid and chat is enabled');
  } else if (validation.isValid && !validation.chatEnabled) {
    console.log('⚠️  Environment is valid but chat functionality is disabled');
  } else {
    console.log('❌ Environment configuration has errors');
  }
}

// Run validation if this file is executed directly
if (require.main === module) {
  logEnvironmentStatus();
}