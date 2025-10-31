'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import Link from 'next/link';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import TypingIndicator from './TypingIndicator';
import ChatErrorHandler, { useChatError } from './ChatErrorHandler';
import { useChatState } from '../hooks/useChatState';
import { ConversationManager } from '../utils/conversationManager';
import { PortfolioData } from '@/types/portfolio';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import { usePerformance, useRenderPerformance } from '@/app/hooks/usePerformance';
import { fetchWithRetry } from '@/lib/retry';

interface ChatInterfaceProps {
  portfolioData: PortfolioData;
}

function ChatInterfaceInner({ portfolioData }: ChatInterfaceProps) {
  const {
    messages,
    isLoading,
    isTyping,
    error,
    addMessage,
    updateMessage,
    setLoading,
    setTyping,
    setError,
    clearChat,
    hasMessages,
    conversationHistory,
  } = useChatState();

  const { handleError } = useChatError();

  // Performance monitoring
  const { measureInteraction } = usePerformance();
  useRenderPerformance('ChatInterface');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const currentConversationId = useRef<string | null>(null);
  const currentReaderRef = useRef<ReadableStreamDefaultReader | null>(null);
  const stopRequestedRef = useRef(false);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  // Initialize conversation ID
  useEffect(() => {
    const existingId = ConversationManager.getCurrentConversationId();
    if (existingId) {
      currentConversationId.current = existingId;
    } else {
      currentConversationId.current = ConversationManager.createNewConversation();
    }
  }, []);

  // Auto-scroll to bottom when new messages arrive (optimized with useCallback)
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  // Track scroll position for scroll-to-bottom button
  useEffect(() => {
    const el = chatContainerRef.current;
    if (!el) return;

    const onScroll = () => {
      const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
      setShowScrollToBottom(distanceFromBottom > 160);
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  // Save conversation whenever messages change
  useEffect(() => {
    if (messages.length > 0 && currentConversationId.current) {
      ConversationManager.saveConversation(currentConversationId.current, messages);
    }
  }, [messages]);

  const handleSendMessage = async (message: string) => {
    const startTime = performance.now();
    
    // Clear any previous errors
    setError(null);
    
    // Add user message
    const userMessage = addMessage({
      message,
      isUser: true,
    });

    // Set loading states
    setLoading(true);
    setTyping(true);

    try {
      // Get conversation history for context (excluding the just-added message)
      const historyForLLM = ConversationManager.formatConversationForLLM(
        ConversationManager.truncateConversationHistory(conversationHistory)
      );

      // Create AI message placeholder for streaming
      const aiMessage = addMessage({
        message: '',
        isUser: false,
        isStreaming: true,
      });

      // Make streaming request to chat API with retry logic
      const response = await fetchWithRetry('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          conversationHistory: historyForLLM,
        }),
      }, {
        maxAttempts: 3,
        baseDelay: 1000,
        retryCondition: (error) => {
          // Retry on network errors and 5xx server errors
          return error.status >= 500 || error.name === 'TypeError';
        }
      });

      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body available');
      }

      const decoder = new TextDecoder();
      let accumulatedContent = '';

      // Stop typing indicator once streaming starts
      setTyping(false);

      currentReaderRef.current = reader;

      while (true) {
        if (stopRequestedRef.current) {
          try { await reader.cancel(); } catch {}
          break;
        }
        const { done, value } = await reader.read();
        
        if (done) {
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
              
              if (parsed.error) {
                throw new Error(parsed.error);
              }

              if (parsed.content) {
                accumulatedContent += parsed.content;
                
                // Update the AI message with accumulated content
                updateMessage(aiMessage.id, {
                  message: accumulatedContent,
                  isStreaming: !parsed.done,
                });
              }

              if (parsed.done) {
                // Finalize the message
                updateMessage(aiMessage.id, {
                  message: accumulatedContent,
                  isStreaming: false,
                });
                break;
              }
            } catch (parseError) {
              // Skip invalid JSON chunks
              continue;
            }
          }
        }
      }

    } catch (error) {
      console.error('Failed to send message:', error);
      
      // Use the error handler for better error classification and handling
      handleError(error);
      
      // Clear any loading states
      setError(null);
      
      // Add a fallback message for user feedback
      addMessage({
        message: "I'm having trouble responding right now. Please try again or check your connection.",
        isUser: false,
      });
    } finally {
      setLoading(false);
      setTyping(false);
      stopRequestedRef.current = false;
      currentReaderRef.current = null;
      
      // Measure interaction performance
      measureInteraction('send-message', startTime);
    }
  };

  const handleClearChat = useCallback(() => {
    clearChat();
    // Create a new conversation
    currentConversationId.current = ConversationManager.createNewConversation();
  }, [clearChat]);

  const handleRetryLastMessage = useCallback(() => {
    const lastUserMessage = messages.filter(m => m.isUser).pop();
    if (lastUserMessage) {
      handleSendMessage(lastUserMessage.message);
    }
  }, [messages, handleSendMessage]);

  const handleStop = useCallback(() => {
    stopRequestedRef.current = true;
    if (currentReaderRef.current) {
      try { currentReaderRef.current.cancel(); } catch {}
    }
    setTyping(false);
    setLoading(false);
  }, [setTyping, setLoading]);

  return (
    <div className="flex flex-col h-full">
      {/* Screen reader announcements */}
      <div 
        aria-live="assertive" 
        aria-atomic="true" 
        className="sr-only"
        role="status"
      >
        {error && `Error: ${error}`}
        {isLoading && "AI is responding to your message"}
      </div>
      {/* Chat Header */}
      <header className="sticky top-0 bg-white/[0.08] backdrop-blur-md border-b border-white/15 px-4 sm:px-6 py-4 relative overflow-hidden animate-fade-in z-10" role="banner">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/[0.04] via-blue-500/[0.04] to-indigo-500/[0.04]" />
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 h-9 min-w-[72px] px-3 rounded-md bg-white/10 border border-white/20 text-white hover:bg-white/15 transition-colors focus:outline-none focus:ring-1 focus:ring-white/30 select-none"
              aria-label="Return to homepage"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="text-sm leading-none">Back</span>
            </Link>
            <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-lg flex items-center justify-center border border-white/20" aria-hidden="true">
              <svg className="w-5 h-5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="font-medium text-white text-base tracking-tight">
                AI Assistant
              </h2>
              <p className="text-xs text-white/40 font-light">
                Ask about <span className="text-white/60">{portfolioData.profile.name}</span>'s experience
              </p>
            </div>
            </div>
          </div>
          {hasMessages && (
            <button
              onClick={handleClearChat}
              className="text-xs text-white hover:text-white transition-all focus:outline-none focus:ring-1 focus:ring-white/30 rounded-lg px-3 py-2 bg-white/10 hover:bg-white/15 border border-white/20 font-light"
              aria-label="Clear all chat messages and start a new conversation"
            >
              <span className="hidden sm:inline">Clear Chat</span>
              <svg className="w-4 h-4 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </header>

      {/* Messages Container */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 chat-container chat-scroll relative"
        style={{ maxHeight: 'calc(100vh - 200px)' }}
        role="log"
        aria-live="polite"
        aria-label="Chat conversation"
        tabIndex={0}
      >
        {!hasMessages && (
          <div className="text-center py-12 sm:py-16 animate-fade-in">
            <div className="w-14 h-14 mx-auto mb-6 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
              <svg className="w-7 h-7 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-white mb-3 tracking-tight">
              Start a Conversation
            </h3>
            <p className="text-white/40 mb-6 max-w-md mx-auto text-sm font-light leading-relaxed">
              Ask about <span className="text-white/60">{portfolioData.profile.name}</span>'s professional background, projects, or technical expertise.
            </p>
          </div>
        )}

        {/* Loading state for initial load */}
        {hasMessages && messages.length === 0 && (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="lg" label="Loading conversation..." />
          </div>
        )}

        {messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            message={msg.message}
            isUser={msg.isUser}
            timestamp={msg.timestamp}
            isStreaming={msg.isStreaming}
          />
        ))}

        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />

        {showScrollToBottom && (
          <button
            type="button"
            onClick={scrollToBottom}
            className="absolute bottom-2 right-2 md:bottom-4 md:right-4 px-3 py-2 rounded-lg bg-white/15 border border-white/25 text-white hover:bg-white/20 shadow-md focus:outline-none focus:ring-1 focus:ring-white/30"
            aria-label="Scroll to bottom"
          >
            ↓
          </button>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="px-5 py-3 bg-red-500/5 backdrop-blur-sm border-l-2 border-red-500/30">
          <p className="text-sm text-red-300/90 font-light">{error}</p>
        </div>
      )}

      {/* Chat Input */}
      <ChatInput
        onSendMessage={handleSendMessage}
        disabled={isLoading}
        placeholder={isLoading ? "AI is responding..." : "Type your message..."}
        isLoading={isLoading}
        onStop={handleStop}
        onRetry={hasMessages ? handleRetryLastMessage : undefined}
      />
    </div>
  );
}

// Main component wrapped with error handler
export default function ChatInterface({ portfolioData }: ChatInterfaceProps) {
  return (
    <ChatErrorHandler>
      <ChatInterfaceInner portfolioData={portfolioData} />
    </ChatErrorHandler>
  );
}