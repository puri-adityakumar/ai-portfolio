import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { getPortfolioData, formatPortfolioForLLM, createContextualSummary } from '@/lib/data';
import { getLogger, createApiErrorContext, sanitizeErrorData } from '@/lib/error-logger';
import { ChatRequest, ChatResponse, ErrorResponse, ValidationResult } from '@/types/portfolio';

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

  return {
    isValid: errors.length === 0,
    errors
  };
}

function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '')
    .substring(0, 4000);
}

function formatConversationHistory(
  history: ChatRequest['conversationHistory']
): Array<{ role: 'user' | 'model', parts: Array<{ text: string }> }> {
  if (!history || history.length === 0) {
    return [];
  }

  const recentHistory = history.slice(-10);
  
  return recentHistory.map(msg => ({
    role: msg.isUser ? 'user' as const : 'model' as const,
    parts: [{ text: msg.message }]
  }));
}

export async function POST(request: NextRequest) {
  const logger = getLogger();
  const requestContext = createApiErrorContext(request);
  
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

    if (!apiKey) {
      logger.logError(
        new Error('GEMINI_API_KEY not configured'),
        requestContext,
        { component: 'chat-api', step: 'environment-validation' }
      );
      
      const errorResponse: ErrorResponse = {
        error: 'Configuration Error',
        code: 'MISSING_ENV',
        message: 'Chat service is not available. Please check configuration.'
      };
      return NextResponse.json(errorResponse, { status: 503 });
    }

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

    const sanitizedMessage = sanitizeInput(body.message);
    const chatRequest: ChatRequest = {
      message: sanitizedMessage,
      conversationHistory: body.conversationHistory || []
    };

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

    const portfolioContext = formatPortfolioForLLM(portfolioData);
    const contextualInfo = createContextualSummary(portfolioData, chatRequest.message);
    const systemInstruction = `${portfolioContext}\n\n${contextualInfo}\n\nYou are a helpful AI assistant for this portfolio. Answer questions based on the portfolio data provided above. 

IMPORTANT: Keep responses SHORT and TO THE POINT. Be concise, direct, and conversational. Avoid lengthy explanations unless specifically asked for details.`;

    const ai = new GoogleGenAI({ apiKey });
    
    const history = formatConversationHistory(chatRequest.conversationHistory);
    const contents = [
      ...history,
      {
        role: 'user' as const,
        parts: [{ text: sanitizedMessage }]
      }
    ];

    try {
      const response = await ai.models.generateContentStream({
        model,
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
          maxOutputTokens: 500,
        }
      });

      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of response) {
              const text = chunk.text || '';
              if (text) {
                const responseChunk: ChatResponse = {
                  content: text,
                  done: false
                };
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(responseChunk)}\n\n`));
              }
            }

            const finalChunk: ChatResponse = {
              content: '',
              done: true
            };
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(finalChunk)}\n\n`));
            controller.close();
          } catch (error) {
            logger.logError(
              error instanceof Error ? error : new Error('Streaming error'),
              requestContext,
              { component: 'chat-api', step: 'streaming' }
            );
            
            const errorChunk: ChatResponse = {
              content: '',
              done: true,
              error: 'Streaming error occurred'
            };
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorChunk)}\n\n`));
            controller.close();
          }
        }
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        }
      });

    } catch (llmError) {
      logger.logError(
        llmError instanceof Error ? llmError : new Error('LLM request failed'),
        requestContext,
        { 
          component: 'chat-api', 
          step: 'llm-request',
          messageLength: chatRequest.message.length,
          historyLength: chatRequest.conversationHistory.length
        }
      );
      
      const errorResponse: ErrorResponse = {
        error: 'LLM Service Error',
        code: 'LLM_ERROR',
        message: 'Failed to get response from AI service'
      };
      return NextResponse.json(errorResponse, { status: 502 });
    }

  } catch (error) {
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
