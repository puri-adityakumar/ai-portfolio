import { NextResponse } from 'next/server';
import { validateEnvironment, getEnvironmentConfig } from '@/lib/env-validation';
import { getPortfolioData } from '@/lib/data';

export async function GET() {
  try {
    const startTime = Date.now();
    
    // Check environment configuration
    const envValidation = validateEnvironment();
    const envConfig = getEnvironmentConfig();
    
    // Check if portfolio data can be loaded
    let portfolioDataStatus = 'ok';
    let portfolioError = null;
    try {
      const portfolioData = getPortfolioData();
      if (!portfolioData.profile?.name) {
        portfolioDataStatus = 'warning';
        portfolioError = 'Portfolio data incomplete';
      }
    } catch (error) {
      portfolioDataStatus = 'error';
      portfolioError = error instanceof Error ? error.message : 'Unknown error';
    }
    
    // Calculate response time
    const responseTime = Date.now() - startTime;
    
    // Determine overall health status
    let status = 'healthy';
    if (!envValidation.isValid || portfolioDataStatus === 'error') {
      status = 'unhealthy';
    } else if (!envValidation.chatEnabled || portfolioDataStatus === 'warning') {
      status = 'degraded';
    }
    
    const healthData = {
      status,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: envConfig.nodeEnv,
      responseTime: `${responseTime}ms`,
      services: {
        portfolio: {
          status: portfolioDataStatus,
          error: portfolioError
        },
        chat: {
          status: envValidation.chatEnabled ? 'enabled' : 'disabled',
          configured: !!envConfig.geminiApiKey,
          model: envConfig.geminiModel,
          provider: 'gemini'
        }
      },
      configuration: {
        siteUrl: envConfig.siteUrl,
        debug: envConfig.debug
      }
    };
    
    // Add warnings if any
    if (envValidation.warnings.length > 0) {
      healthData.warnings = envValidation.warnings;
    }
    
    // Add errors if any
    if (envValidation.errors.length > 0) {
      healthData.errors = envValidation.errors;
    }
    
    // Return appropriate HTTP status code
    const httpStatus = status === 'healthy' ? 200 : 
                      status === 'degraded' ? 200 : 503;
    
    return NextResponse.json(healthData, { 
      status: httpStatus,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-Type': 'application/json'
      }
    });
    
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Health check failed',
      services: {
        portfolio: { status: 'unknown' },
        chat: { status: 'unknown' }
      }
    }, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-Type': 'application/json'
      }
    });
  }
}