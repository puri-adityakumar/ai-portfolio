/**
 * Retry mechanism utilities for handling failed requests
 */

export interface RetryOptions {
  maxAttempts?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  retryCondition?: (error: any) => boolean;
}

export interface RetryState {
  attempt: number;
  isRetrying: boolean;
  lastError?: Error;
}

/**
 * Default retry condition - retries on network errors and 5xx server errors
 */
const defaultRetryCondition = (error: any): boolean => {
  // Network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return true;
  }
  
  // HTTP errors
  if (error.status >= 500 && error.status < 600) {
    return true;
  }
  
  // Timeout errors
  if (error.name === 'AbortError' || error.message.includes('timeout')) {
    return true;
  }
  
  return false;
};

/**
 * Exponential backoff delay calculation
 */
function calculateDelay(attempt: number, baseDelay: number, maxDelay: number, backoffFactor: number): number {
  const delay = baseDelay * Math.pow(backoffFactor, attempt - 1);
  return Math.min(delay, maxDelay);
}

/**
 * Sleep utility for delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2,
    retryCondition = defaultRetryCondition
  } = options;

  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Don't retry if this is the last attempt or if retry condition fails
      if (attempt === maxAttempts || !retryCondition(error)) {
        throw lastError;
      }
      
      // Calculate delay and wait
      const delay = calculateDelay(attempt, baseDelay, maxDelay, backoffFactor);
      console.warn(`Attempt ${attempt} failed, retrying in ${delay}ms:`, lastError.message);
      await sleep(delay);
    }
  }

  throw lastError!;
}

/**
 * React hook for managing retry state
 */
export function useRetry() {
  const [retryState, setRetryState] = React.useState<RetryState>({
    attempt: 0,
    isRetrying: false
  });

  const retry = React.useCallback(async <T>(
    fn: () => Promise<T>,
    options?: RetryOptions
  ): Promise<T> => {
    setRetryState(prev => ({ ...prev, isRetrying: true, attempt: 0 }));
    
    try {
      const result = await retryWithBackoff(fn, {
        ...options,
        // Wrap the function to update attempt count
        maxAttempts: options?.maxAttempts || 3
      });
      
      setRetryState({ attempt: 0, isRetrying: false });
      return result;
    } catch (error) {
      const finalError = error instanceof Error ? error : new Error(String(error));
      setRetryState({
        attempt: options?.maxAttempts || 3,
        isRetrying: false,
        lastError: finalError
      });
      throw finalError;
    }
  }, []);

  const reset = React.useCallback(() => {
    setRetryState({ attempt: 0, isRetrying: false });
  }, []);

  return {
    ...retryState,
    retry,
    reset
  };
}

/**
 * Fetch with retry functionality
 */
export async function fetchWithRetry(
  url: string,
  init?: RequestInit,
  options?: RetryOptions
): Promise<Response> {
  return retryWithBackoff(async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout
    
    try {
      const response = await fetch(url, {
        ...init,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      // Throw error for HTTP error status codes
      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
        (error as any).status = response.status;
        throw error;
      }
      
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }, options);
}

/**
 * Create a retry-enabled version of any async function
 */
export function withRetry<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options?: RetryOptions
): T {
  return ((...args: Parameters<T>) => {
    return retryWithBackoff(() => fn(...args), options);
  }) as T;
}

// Import React for the hook
import React from 'react';