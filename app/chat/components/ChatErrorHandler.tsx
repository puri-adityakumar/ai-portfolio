'use client';

import React, { useState, useCallback } from 'react';
import { useRetry } from '@/lib/retry';

interface ChatErrorHandlerProps {
  children: React.ReactNode;
  onRetry?: () => void;
}

interface ChatError {
  type: 'network' | 'api' | 'streaming' | 'validation' | 'unknown';
  message: string;
  retryable: boolean;
  timestamp: Date;
}

/**
 * Chat-specific error handler component
 * Provides contextual error messages and retry functionality for chat interactions
 */
export default function ChatErrorHandler({ children, onRetry }: ChatErrorHandlerProps) {
  const [error, setError] = useState<ChatError | null>(null);
  const { isRetrying, retry, reset } = useRetry();

  const classifyError = useCallback((error: any): ChatError => {
    const timestamp = new Date();
    
    // Network connectivity errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        type: 'network',
        message: 'Unable to connect to the chat service. Please check your internet connection.',
        retryable: true,
        timestamp
      };
    }
    
    // API errors
    if (error.status) {
      if (error.status >= 500) {
        return {
          type: 'api',
          message: 'The chat service is temporarily unavailable. Please try again in a moment.',
          retryable: true,
          timestamp
        };
      }
      
      if (error.status === 429) {
        return {
          type: 'api',
          message: 'Too many requests. Please wait a moment before sending another message.',
          retryable: true,
          timestamp
        };
      }
      
      if (error.status >= 400 && error.status < 500) {
        return {
          type: 'validation',
          message: 'There was an issue with your message. Please try rephrasing it.',
          retryable: false,
          timestamp
        };
      }
    }
    
    // Streaming errors
    if (error.message?.includes('stream') || error.message?.includes('chunk')) {
      return {
        type: 'streaming',
        message: 'Connection interrupted while receiving response. Please try sending your message again.',
        retryable: true,
        timestamp
      };
    }
    
    // Environment/configuration errors
    if (error.message?.includes('environment') || error.message?.includes('configuration')) {
      return {
        type: 'api',
        message: 'Chat service is not properly configured. Please contact support.',
        retryable: false,
        timestamp
      };
    }
    
    // Default unknown error
    return {
      type: 'unknown',
      message: 'An unexpected error occurred. Please try again.',
      retryable: true,
      timestamp
    };
  }, []);

  const handleError = useCallback((error: any) => {
    const chatError = classifyError(error);
    setError(chatError);
    console.error('Chat error:', error);
  }, [classifyError]);

  const handleRetry = useCallback(async () => {
    if (!error?.retryable) return;
    
    try {
      reset();
      setError(null);
      
      if (onRetry) {
        await retry(async () => {
          onRetry();
        });
      }
    } catch (retryError) {
      handleError(retryError);
    }
  }, [error, onRetry, retry, reset, handleError]);

  const handleDismiss = useCallback(() => {
    setError(null);
    reset();
  }, [reset]);

  // Provide error handler to children through context
  const errorContext = React.useMemo(() => ({
    handleError,
    clearError: handleDismiss,
    hasError: !!error,
    isRetrying
  }), [handleError, handleDismiss, error, isRetrying]);

  return (
    <ChatErrorContext.Provider value={errorContext}>
      {children}
      
      {/* Error Display */}
      {error && (
        <div 
          className="mx-4 mb-4 p-4 rounded-lg border-l-4 bg-red-50 dark:bg-red-900/20 border-red-500"
          role="alert"
          aria-live="assertive"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                {error.type === 'network' && (
                  <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2v20M2 12h20" />
                  </svg>
                )}
                {error.type === 'api' && (
                  <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                {(error.type === 'streaming' || error.type === 'unknown') && (
                  <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                )}
                {error.type === 'validation' && (
                  <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-red-800 dark:text-red-200">
                  {error.type === 'network' && 'Connection Error'}
                  {error.type === 'api' && 'Service Error'}
                  {error.type === 'streaming' && 'Streaming Error'}
                  {error.type === 'validation' && 'Message Error'}
                  {error.type === 'unknown' && 'Unexpected Error'}
                </h4>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                  {error.message}
                </p>
                {error.retryable && (
                  <div className="mt-3 flex space-x-2">
                    <button
                      onClick={handleRetry}
                      disabled={isRetrying}
                      className="text-sm bg-red-100 hover:bg-red-200 dark:bg-red-800 dark:hover:bg-red-700 text-red-800 dark:text-red-200 px-3 py-1 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-red-900"
                    >
                      {isRetrying ? 'Retrying...' : 'Try Again'}
                    </button>
                    <button
                      onClick={handleDismiss}
                      className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-red-900 rounded px-2 py-1"
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 text-red-400 hover:text-red-600 dark:hover:text-red-200 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-red-900 rounded"
              aria-label="Dismiss error"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </ChatErrorContext.Provider>
  );
}

// Context for error handling
interface ChatErrorContextType {
  handleError: (error: any) => void;
  clearError: () => void;
  hasError: boolean;
  isRetrying: boolean;
}

const ChatErrorContext = React.createContext<ChatErrorContextType | null>(null);

export function useChatError() {
  const context = React.useContext(ChatErrorContext);
  if (!context) {
    throw new Error('useChatError must be used within a ChatErrorHandler');
  }
  return context;
}