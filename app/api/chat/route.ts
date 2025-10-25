import { NextRequest, NextResponse } from 'next/server';
import { getPortfolioData, formatPortfolioForLLM, createContextualSummary, manageContextLength } from '@/lib/data';
import { validateEnvironment, getEnvironmentConfig } from '@/lib/env-validation';
import { getLogger, createApiErrorContext, sanitizeErrorData } from '@/lib/error-logger';
import { ChatRequest, ChatResponse, ErrorResponse, ValidationResult } from '@/types/portfolio';

/**
 * Validates the incoming chat request
 */
function validateChatRequest(body: any): ValidationResult {
  const errors: string[] = [];

  if (!body) {
    errors.push('Request body is required');
    return { isValid: false, errors };
  }

  if (!body.message || typeof body.message !== 'string') {
    errors.push('Message is required and must be a string');
  }

  if (body.message && body.message.trim().length === 0) {
    errors.push('Message cannot be empty');
  }

  if (body.message && body.message.length > 4000) {
    errors.push('Message is too long (maximum 4000 characters)');
  }

  if (body.conversationHistory && !Array.isArray(body.conversationHistory)) {
    errors.push('Conversation history must be an array');
  }

  if (body.conversationHistory) {
    for (let i = 0; i < body.conversationHistory.length; i++) {
      const msg = body.conversationHistory[i];
      if (!msg.message || typeof msg.message !== 'string') {
        errors.push(`Invalid message at history index ${i}`);
      }
      if (typeof msg.isUser !== 'boolean') {
        errors.push(`Invalid isUser flag at history index ${i}`);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Sanitizes user input to prevent injection attacks
 */
function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 4000); // Limit length
}

/**
 * Formats conversation history for LLM context with improved structure
 */
function formatConversationHistory(history: ChatRequest['conversationHistory']): string {
  if (!history || history.length === 0) {
    return '\n\nThis is the start of a new conversation.';
  }

  // Limit conversation history to last 10 messages to manage context length
  const recentHistory = history.slice(-10);
  
  const formattedHistory = recentHistory.map((msg, index) => {
    const role = msg.isUser ? 'Human' : 'Assistant';
    const timestamp = new Date(msg.timestamp).toLocaleTimeString();
    return `[${timestamp}] ${role}: ${msg.message}`;
  }).join('\n');

  return `\n\nCONVERSATION HISTORY (Last ${recentHistory.length} messages):
${formattedHistory}

Continue this conversation naturally, maintaining context from the above history.`;
}

/**
 * Makes a request to the configured LLM with comprehensive error handling
 */
async function callLLM(
  message: string, 
  fullContext: string,
  config: { apiKey: string; model: string; baseUrl: string }
): Promise<Response> {
  const systemPrompt = fullContext;
  
  const requestBody = {
    model: config.model,
    messages: [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: message
      }
    ],
    stream: true,
    max_tokens: 1000,
    temperature: 0.7
  };

  // Add timeout to prevent hanging requests
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

  try {
    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
        'User-Agent': 'AI-Portfolio-Chatbot/1.0'
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      let errorDetails = '';
      
      try {
        const errorText = await response.text();
        if (errorText) {
          try {
            const errorJson = JSON.parse(errorText);
            errorDetails = errorJson.error?.message || errorJson.message || errorText;
          } catch {
            errorDetails = errorText;
          }
        }
      } catch {
        // Ignore errors when reading response body
      }

      // Classify error types for better handling
      if (response.status === 401) {
        throw new LLMError('Authentication failed. Please check your API key.', 'AUTH_ERROR', response.status);
      } else if (response.status === 403) {
        throw new LLMError('Access forbidden. Please check your API permissions.', 'PERMISSION_ERROR', response.status);
      } else if (response.status === 429) {
        throw new LLMError('Rate limit exceeded. Please try again later.', 'RATE_LIMIT_ERROR', response.status);
      } else if (response.status >= 500) {
        throw new LLMError('LLM service is temporarily unavailable. Please try again later.', 'SERVICE_ERROR', response.status);
      } else {
        throw new LLMError(`${errorMessage}${errorDetails ? `: ${errorDetails}` : ''}`, 'API_ERROR', response.status);
      }
    }

    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new LLMError('Request timeout. The LLM service is taking too long to respond.', 'TIMEOUT_ERROR');
    }
    
    if (error instanceof LLMError) {
      throw error;
    }
    
    // Network or other errors
    throw new LLMError(
      'Failed to connect to LLM service. Please check your internet connection.',
      'NETWORK_ERROR',
      undefined,
      error instanceof Error ? error : new Error(String(error))
    );
  }
}

/**
 * Custom error class for LLM-related errors
 */
class LLMError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status?: number,
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = 'LLMError';
  }
}

/**
 * Processes streaming response from LLM with enhanced error handling
 */
async function processStreamingResponse(response: Response): Promise<ReadableStream> {
  const reader = response.body?.getReader();
  if (!reader) {
    throw new LLMError('No response body available from LLM service', 'STREAM_ERROR');
  }

  return new ReadableStream({
    async start(controller) {
      const decoder = new TextDecoder();
      let hasReceivedData = false;
      let streamTimeout: NodeJS.Timeout | null = null;
      
      // Set up stream timeout
      const resetTimeout = () => {
        if (streamTimeout) clearTimeout(streamTimeout);
        streamTimeout = setTimeout(() => {
          const timeoutError: ChatResponse = {
            content: '',
            done: true,
            error: 'Stream timeout - no data received for 30 seconds'
          };
          controller.enqueue(`data: ${JSON.stringify(timeoutError)}\n\n`);
          controller.close();
        }, 30000);
      };
      
      resetTimeout();
      
      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            if (streamTimeout) clearTimeout(streamTimeout);
            
            // Send final completion message
            const finalChunk: ChatResponse = {
              content: '',
              done: true
            };
            controller.enqueue(`data: ${JSON.stringify(finalChunk)}\n\n`);
            controller.close();
            break;
          }

          hasReceivedData = true;
          resetTimeout();

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim();
              
              if (data === '[DONE]') {
                continue;
              }
              
              if (!data) {
                continue;
              }
              
              try {
                const parsed = JSON.parse(data);
                
                // Handle error responses from LLM
                if (parsed.error) {
                  const errorChunk: ChatResponse = {
                    content: '',
                    done: true,
                    error: parsed.error.message || 'LLM service error'
                  };
                  controller.enqueue(`data: ${JSON.stringify(errorChunk)}\n\n`);
                  controller.close();
                  return;
                }
                
                const content = parsed.choices?.[0]?.delta?.content || '';
                const finishReason = parsed.choices?.[0]?.finish_reason;
                
                if (content) {
                  const responseChunk: ChatResponse = {
                    content,
                    done: false
                  };
                  controller.enqueue(`data: ${JSON.stringify(responseChunk)}\n\n`);
                }
                
                // Handle completion
                if (finishReason) {
                  const finalChunk: ChatResponse = {
                    content: '',
                    done: true
                  };
                  controller.enqueue(`data: ${JSON.stringify(finalChunk)}\n\n`);
                  controller.close();
                  return;
                }
              } catch (parseError) {
                console.warn('Failed to parse streaming chunk:', data, parseError);
                // Continue processing other chunks
                continue;
              }
            }
          }
        }
      } catch (error) {
        if (streamTimeout) clearTimeout(streamTimeout);
        
        console.error('Streaming error:', error);
        
        let errorMessage = 'Streaming error occurred';
        if (error instanceof Error) {
          errorMessage = error.message;
        }
        
        // If we haven't received any data, it's likely a connection issue
        if (!hasReceivedData) {
          errorMessage = 'Failed to establish streaming connection with LLM service';
        }
        
        const errorChunk: ChatResponse = {
          content: '',
          done: true,
          error: errorMessage
        };
        controller.enqueue(`data: ${JSON.stringify(errorChunk)}\n\n`);
        controller.close();
      } finally {
        if (streamTimeout) clearTimeout(streamTimeout);
        try {
          reader.releaseLock();
        } catch {
          // Ignore lock release errors
        }
      }
    },
    
    cancel() {
      if (streamTimeout) clearTimeout(streamTimeout);
      try {
        reader.cancel();
      } catch {
        // Ignore cancellation errors
      }
    }
  });
}

/**
 * POST /api/chat - Handle chat requests with streaming responses
 */
export async function POST(request: NextRequest) {
  const logger = getLogger();
  const requestContext = createApiErrorContext(request);
  
  try {
    // Validate environment variables
    const envValidation = validateEnvironment();
    if (!envValidation.isValid || !envValidation.chatEnabled) {
      const errorMessage = envValidation.errors.length > 0 
        ? envValidation.errors.join(', ')
        : 'Chat functionality is not properly configured';
        
      logger.logError(
        new Error('Environment validation failed'),
        requestContext,
        { 
          component: 'chat-api', 
          step: 'environment-validation',
          errors: envValidation.errors,
          warnings: envValidation.warnings,
          chatEnabled: envValidation.chatEnabled
        }
      );
      
      const errorResponse: ErrorResponse = {
        error: 'Configuration Error',
        code: 'MISSING_ENV',
        message: 'Chat service is not available. Please check configuration.'
      };
      return NextResponse.json(errorResponse, { status: 503 });
    }

    let envConfig;
    try {
      envConfig = getEnvironmentConfig();
    } catch (envError) {
      logger.logError(
        envError instanceof Error ? envError : new Error('Environment validation failed'),
        requestContext,
        { component: 'chat-api', step: 'environment-validation' }
      );
      
      const errorResponse: ErrorResponse = {
        error: 'Configuration Error',
        code: 'MISSING_ENV',
        message: 'Service configuration is invalid. Please contact support.'
      };
      return NextResponse.json(errorResponse, { status: 500 });
    }

    // Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      logger.logWarning(
        'Invalid JSON in request body',
        requestContext,
        { component: 'chat-api', step: 'request-parsing', error: parseError }
      );
      
      const errorResponse: ErrorResponse = {
        error: 'Invalid Request',
        code: 'INVALID_REQUEST',
        message: 'Request body must be valid JSON'
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    const validation = validateChatRequest(body);
    if (!validation.isValid) {
      logger.logWarning(
        'Request validation failed',
        requestContext,
        { 
          component: 'chat-api', 
          step: 'request-validation', 
          validationErrors: validation.errors,
          sanitizedBody: sanitizeErrorData(body)
        }
      );
      
      const errorResponse: ErrorResponse = {
        error: 'Validation Error',
        code: 'INVALID_REQUEST',
        message: validation.errors.join(', ')
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Sanitize input
    const sanitizedMessage = sanitizeInput(body.message);
    const chatRequest: ChatRequest = {
      message: sanitizedMessage,
      conversationHistory: body.conversationHistory || []
    };

    // Load portfolio data and format for LLM
    let portfolioData;
    try {
      portfolioData = getPortfolioData();
    } catch (dataError) {
      logger.logError(
        dataError instanceof Error ? dataError : new Error('Data loading failed'),
        requestContext,
        { component: 'chat-api', step: 'data-loading' }
      );
      
      const errorResponse: ErrorResponse = {
        error: 'Data Loading Error',
        code: 'DATA_LOAD_ERROR',
        message: 'Failed to load portfolio data'
      };
      return NextResponse.json(errorResponse, { status: 500 });
    }

    // Create comprehensive context with portfolio data and contextual information
    const portfolioContext = formatPortfolioForLLM(portfolioData);
    const contextualInfo = createContextualSummary(portfolioData, chatRequest.message);
    const conversationHistory = formatConversationHistory(chatRequest.conversationHistory);
    
    // Manage context length to prevent token limit issues
    const fullContext = manageContextLength(portfolioContext, contextualInfo, conversationHistory);

    // Make LLM request
    let llmResponse;
    try {
      llmResponse = await callLLM(
        chatRequest.message,
        fullContext,
        {
          apiKey: envConfig.llmApiKey,
          model: envConfig.llmModel,
          baseUrl: envConfig.llmBaseUrl
        }
      );
    } catch (llmError) {
      let statusCode = 502;
      let errorCode = 'LLM_ERROR';
      let errorMessage = 'Failed to get response from AI service';
      
      if (llmError instanceof LLMError) {
        errorCode = llmError.code;
        errorMessage = llmError.message;
        
        // Map LLM error codes to appropriate HTTP status codes
        switch (llmError.code) {
          case 'AUTH_ERROR':
          case 'PERMISSION_ERROR':
            statusCode = 503; // Service Unavailable (configuration issue)
            break;
          case 'RATE_LIMIT_ERROR':
            statusCode = 429; // Too Many Requests
            break;
          case 'TIMEOUT_ERROR':
            statusCode = 504; // Gateway Timeout
            break;
          case 'NETWORK_ERROR':
            statusCode = 503; // Service Unavailable
            break;
          case 'SERVICE_ERROR':
            statusCode = 502; // Bad Gateway
            break;
          default:
            statusCode = 502;
        }
      }
      
      logger.logError(
        llmError instanceof Error ? llmError : new Error('LLM request failed'),
        requestContext,
        { 
          component: 'chat-api', 
          step: 'llm-request',
          errorCode,
          statusCode,
          messageLength: chatRequest.message.length,
          historyLength: chatRequest.conversationHistory.length
        }
      );
      
      const errorResponse: ErrorResponse = {
        error: 'LLM Service Error',
        code: errorCode,
        message: errorMessage
      };
      return NextResponse.json(errorResponse, { status: statusCode });
    }

    // Process streaming response
    try {
      const stream = await processStreamingResponse(llmResponse);
      
      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    } catch (streamError) {
      let errorCode = 'STREAM_ERROR';
      let errorMessage = 'Failed to process streaming response';
      
      if (streamError instanceof LLMError) {
        errorCode = streamError.code;
        errorMessage = streamError.message;
      }
      
      logger.logError(
        streamError instanceof Error ? streamError : new Error('Streaming processing failed'),
        requestContext,
        { 
          component: 'chat-api', 
          step: 'stream-processing',
          errorCode
        }
      );
      
      const errorResponse: ErrorResponse = {
        error: 'Streaming Error',
        code: errorCode,
        message: errorMessage
      };
      return NextResponse.json(errorResponse, { status: 500 });
    }

  } catch (error) {
    // Catch-all error handler
    logger.logError(
      error instanceof Error ? error : new Error('Unexpected error in chat API'),
      requestContext,
      { 
        component: 'chat-api', 
        step: 'catch-all',
        errorType: typeof error,
        errorConstructor: error?.constructor?.name
      }
    );
    
    const errorResponse: ErrorResponse = {
      error: 'Internal Server Error',
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred'
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

/**
 * OPTIONS /api/chat - Handle CORS preflight requests
 */
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}