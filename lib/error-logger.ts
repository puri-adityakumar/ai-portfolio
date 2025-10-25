/**
 * Server-side error logging utilities
 */

export interface ErrorLogEntry {
  timestamp: string;
  level: 'error' | 'warn' | 'info';
  message: string;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  context?: {
    userId?: string;
    sessionId?: string;
    userAgent?: string;
    ip?: string;
    url?: string;
    method?: string;
  };
  metadata?: Record<string, any>;
}

/**
 * Enhanced error logger for server-side errors
 */
export class ErrorLogger {
  private static instance: ErrorLogger;
  
  private constructor() {}
  
  static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  /**
   * Log an error with context information
   */
  logError(
    error: Error | string,
    context?: Partial<ErrorLogEntry['context']>,
    metadata?: Record<string, any>
  ): void {
    const entry: ErrorLogEntry = {
      timestamp: new Date().toISOString(),
      level: 'error',
      message: typeof error === 'string' ? error : error.message,
      context,
      metadata
    };

    if (error instanceof Error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack
      };
    }

    this.writeLog(entry);
  }

  /**
   * Log a warning
   */
  logWarning(
    message: string,
    context?: Partial<ErrorLogEntry['context']>,
    metadata?: Record<string, any>
  ): void {
    const entry: ErrorLogEntry = {
      timestamp: new Date().toISOString(),
      level: 'warn',
      message,
      context,
      metadata
    };

    this.writeLog(entry);
  }

  /**
   * Log informational message
   */
  logInfo(
    message: string,
    context?: Partial<ErrorLogEntry['context']>,
    metadata?: Record<string, any>
  ): void {
    const entry: ErrorLogEntry = {
      timestamp: new Date().toISOString(),
      level: 'info',
      message,
      context,
      metadata
    };

    this.writeLog(entry);
  }

  /**
   * Write log entry to appropriate destination
   */
  private writeLog(entry: ErrorLogEntry): void {
    // In development, log to console with formatting
    if (process.env.NODE_ENV === 'development') {
      this.logToConsole(entry);
    } else {
      // In production, log as structured JSON for log aggregation
      this.logAsJson(entry);
    }

    // Additional logging destinations can be added here
    // e.g., external logging services, file system, etc.
  }

  /**
   * Format log entry for console output (development)
   */
  private logToConsole(entry: ErrorLogEntry): void {
    const timestamp = new Date(entry.timestamp).toLocaleTimeString();
    const level = entry.level.toUpperCase().padEnd(5);
    
    let logMessage = `[${timestamp}] ${level} ${entry.message}`;
    
    if (entry.context) {
      logMessage += `\n  Context: ${JSON.stringify(entry.context, null, 2)}`;
    }
    
    if (entry.metadata) {
      logMessage += `\n  Metadata: ${JSON.stringify(entry.metadata, null, 2)}`;
    }
    
    if (entry.error?.stack) {
      logMessage += `\n  Stack: ${entry.error.stack}`;
    }

    switch (entry.level) {
      case 'error':
        console.error(logMessage);
        break;
      case 'warn':
        console.warn(logMessage);
        break;
      case 'info':
        console.info(logMessage);
        break;
    }
  }

  /**
   * Log as structured JSON (production)
   */
  private logAsJson(entry: ErrorLogEntry): void {
    console.log(JSON.stringify(entry));
  }
}

/**
 * Convenience function to get logger instance
 */
export function getLogger(): ErrorLogger {
  return ErrorLogger.getInstance();
}

/**
 * Extract request context from Next.js request
 */
export function extractRequestContext(request: Request): Partial<ErrorLogEntry['context']> {
  const url = new URL(request.url);
  
  return {
    url: url.pathname + url.search,
    method: request.method,
    userAgent: request.headers.get('user-agent') || undefined,
    // Note: IP extraction in Next.js requires additional configuration
    // and may not be available in all deployment environments
  };
}

/**
 * Create error context for API routes
 */
export function createApiErrorContext(
  request: Request,
  additionalContext?: Record<string, any>
): Partial<ErrorLogEntry['context']> {
  return {
    ...extractRequestContext(request),
    ...additionalContext
  };
}

/**
 * Sanitize sensitive data from error logs
 */
export function sanitizeErrorData(data: any): any {
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  const sensitiveKeys = [
    'password', 'token', 'key', 'secret', 'auth', 'authorization',
    'api_key', 'apikey', 'access_token', 'refresh_token'
  ];

  const sanitized = { ...data };

  for (const key in sanitized) {
    if (sensitiveKeys.some(sensitive => 
      key.toLowerCase().includes(sensitive.toLowerCase())
    )) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object') {
      sanitized[key] = sanitizeErrorData(sanitized[key]);
    }
  }

  return sanitized;
}