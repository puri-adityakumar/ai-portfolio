'use client';

import { useRef, useEffect, useCallback, useMemo } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import TypingIndicator from './TypingIndicator';
import SuggestedQuestions from './SuggestedQuestions';
import ChatErrorHandler, { useChatError } from './ChatErrorHandler';
import { useChatState } from '../hooks/useChatState';
import { ConversationManager } from '../utils/conversationManager';
import { generateSuggestedQuestions, getContextualQuestions } from '../utils/suggestedQuestions';
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

  const { handleError, clearError } = useChatError();

  // Performance monitoring
  const { measureInteraction } = usePerformance();
  useRenderPerformance('ChatInterface');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const currentConversationId = useRef<string | null>(null);

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

      while (true) {
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
      
      // Measure interaction performance
      measureInteraction('send-message', startTime);
    }
  };

  const handleQuestionClick = useCallback((question: string) => {
    handleSendMessage(question);
  }, [handleSendMessage]);

  const handleClearChat = useCallback(() => {
    clearChat();
    // Create a new conversation
    currentConversationId.current = ConversationManager.createNewConversation();
  }, [clearChat]);

  // Generate dynamic suggested questions (memoized for performance)
  const suggestedQuestions = useMemo(() => {
    return !hasMessages 
      ? generateSuggestedQuestions(portfolioData)
      : getContextualQuestions(portfolioData, conversationHistory);
  }, [hasMessages, portfolioData, conversationHistory]);

  const handleRetryLastMessage = useCallback(() => {
    const lastUserMessage = messages.filter(m => m.isUser).pop();
    if (lastUserMessage) {
      handleSendMessage(lastUserMessage.message);
    }
  }, [messages, handleSendMessage]);

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
      <header className="glass border-b border-white/10 p-4 sm:p-6 relative overflow-hidden animate-fade-in" role="banner">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-indigo-500/5 opacity-50" />
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 glass-strong rounded-2xl flex items-center justify-center glow-blue" aria-hidden="true">
              <svg className="w-6 h-6 text-gradient-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="font-semibold text-white text-lg">
                AI Assistant
              </h2>
              <p className="text-sm text-white/50">
                Ask me about <span className="text-gradient-accent font-medium">{portfolioData.profile.name}</span>'s experience
              </p>
            </div>
          </div>
          {hasMessages && (
            <button
              onClick={handleClearChat}
              className="text-sm text-white/50 hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-white/20 rounded-lg px-3 py-2 glass-strong hover:glass-hover hover:scale-105"
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
        className="flex-1 overflow-y-auto p-4 space-y-4 chat-container chat-scroll"
        style={{ maxHeight: 'calc(100vh - 200px)' }}
        role="log"
        aria-live="polite"
        aria-label="Chat conversation"
        tabIndex={0}
      >
        {!hasMessages && (
          <div className="text-center py-8 animate-fade-in">
            <div className="w-16 h-16 mx-auto mb-4 glass-strong rounded-full flex items-center justify-center glow-purple">
              <svg className="w-8 h-8 text-gradient-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Welcome to the AI Chat!
            </h3>
            <p className="text-white/50 mb-6 max-w-md mx-auto">
              Ask me anything about <span className="text-gradient-accent">{portfolioData.profile.name}</span>'s professional background, projects, or skills.
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
      </div>

      {/* Error Display */}
      {error && (
        <div className="px-4 py-2 glass-strong border-l-4 border-red-500/50">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Suggested Questions */}
      {suggestedQuestions.length > 0 && (
        <SuggestedQuestions
          questions={suggestedQuestions}
          onQuestionClick={handleQuestionClick}
          disabled={isLoading}
          showTitle={!hasMessages}
        />
      )}

      {/* Chat Input */}
      <ChatInput
        onSendMessage={handleSendMessage}
        disabled={isLoading}
        placeholder={isLoading ? "AI is responding..." : "Type your message..."}
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