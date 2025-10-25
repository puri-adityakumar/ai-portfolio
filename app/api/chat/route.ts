import { NextRequest, NextResponse } from 'next/server';
import { getPortfolioData, formatPortfolioForLLM, createContextualSummary, manageContextLength } from '@/lib/data';
import { validateEnvironment } from '@/lib/env';
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
 * Makes a request to the configured LLM
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

  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`LLM API error (${response.status}): ${errorText}`);
  }

  return response;
}

/**
 * Processes streaming response from LLM
 */
async function processStreamingResponse(response: Response): Promise<ReadableStream> {
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('No response body available');
  }

  return new ReadableStream({
    async start(controller) {
      const decoder = new TextDecoder();
      
      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            // Send final completion message
            const finalChunk: ChatResponse = {
              content: '',
              done: true
            };
            controller.enqueue(`data: ${JSON.stringify(finalChunk)}\n\n`);
            controller.close();
            break;
          }

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              
              if (data === '[DONE]') {
                continue;
              }
              
              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content || '';
                
                if (content) {
                  const responseChunk: ChatResponse = {
                    content,
                    done: false
                  };
                  controller.enqueue(`data: ${JSON.stringify(responseChunk)}\n\n`);
                }
              } catch (parseError) {
                // Skip invalid JSON chunks
                continue;
              }
            }
          }
        }
      } catch (error) {
        const errorChunk: ChatResponse = {
          content: '',
          done: true,
          error: error instanceof Error ? error.message : 'Unknown streaming error'
        };
        controller.enqueue(`data: ${JSON.stringify(errorChunk)}\n\n`);
        controller.close();
      }
    }
  });
}

/**
 * POST /api/chat - Handle chat requests with streaming responses
 */
export async function POST(request: NextRequest) {
  try {
    // Validate environment variables
    let envConfig;
    try {
      envConfig = validateEnvironment();
    } catch (envError) {
      const errorResponse: ErrorResponse = {
        error: 'Configuration Error',
        code: 'MISSING_ENV',
        message: envError instanceof Error ? envError.message : 'Environment configuration is invalid'
      };
      return NextResponse.json(errorResponse, { status: 500 });
    }

    // Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      const errorResponse: ErrorResponse = {
        error: 'Invalid Request',
        code: 'INVALID_REQUEST',
        message: 'Request body must be valid JSON'
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    const validation = validateChatRequest(body);
    if (!validation.isValid) {
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
          apiKey: envConfig.LLM_API_KEY,
          model: envConfig.LLM_MODEL,
          baseUrl: envConfig.LLM_BASE_URL
        }
      );
    } catch (llmError) {
      const errorResponse: ErrorResponse = {
        error: 'LLM Service Error',
        code: 'LLM_ERROR',
        message: llmError instanceof Error ? llmError.message : 'Failed to get response from AI service'
      };
      return NextResponse.json(errorResponse, { status: 502 });
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
      const errorResponse: ErrorResponse = {
        error: 'Streaming Error',
        code: 'LLM_ERROR',
        message: streamError instanceof Error ? streamError.message : 'Failed to process streaming response'
      };
      return NextResponse.json(errorResponse, { status: 500 });
    }

  } catch (error) {
    // Catch-all error handler
    const errorResponse: ErrorResponse = {
      error: 'Internal Server Error',
      code: 'LLM_ERROR',
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