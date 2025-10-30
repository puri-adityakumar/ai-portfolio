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

  // Check required environment variables for Gemini chat functionality
  if (!process.env.GEMINI_API_KEY) {
    warnings.push('GEMINI_API_KEY not set - chat functionality will be disabled');
    chatEnabled = false;
  }

  if (!process.env.GEMINI_MODEL) {
    warnings.push('GEMINI_MODEL not set - using default model (gemini-2.5-flash)');
  }

  // Validate site URL format
  if (process.env.NEXT_PUBLIC_SITE_URL && !process.env.NEXT_PUBLIC_SITE_URL.startsWith('http')) {
    errors.push('NEXT_PUBLIC_SITE_URL must start with http:// or https://');
  }

  // Check for API key format (basic validation)
  if (process.env.GEMINI_API_KEY) {
    const apiKey = process.env.GEMINI_API_KEY;
    
    // Check for placeholder values
    if (apiKey.includes('your_') || apiKey.includes('example')) {
      warnings.push('API key appears to be a placeholder value');
      chatEnabled = false;
    }
  }

  // Validate Gemini model names
  if (process.env.GEMINI_MODEL) {
    const model = process.env.GEMINI_MODEL;
    const validGeminiModels = ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-1.5-flash', 'gemini-1.5-pro'];
    if (!validGeminiModels.includes(model)) {
      warnings.push(`Model "${model}" may not be valid. Valid models: ${validGeminiModels.join(', ')}`);
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
    geminiApiKey: process.env.GEMINI_API_KEY || '',
    geminiModel: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
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
  console.log(`   Gemini Model: ${config.geminiModel}`);
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