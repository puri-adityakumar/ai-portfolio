'use client';

import { useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import TypingIndicator from './TypingIndicator';
import SuggestedQuestions from './SuggestedQuestions';
import { useChatState } from '../hooks/useChatState';
import { ConversationManager } from '../utils/conversationManager';
import { PortfolioData } from '@/types/portfolio';

interface ChatInterfaceProps {
  portfolioData: PortfolioData;
}

const SUGGESTED_QUESTIONS = [
  "Tell me about your experience",
  "What projects have you worked on?",
  "What are your technical skills?",
  "What's your educational background?",
  "Tell me about your achievements"
];

export default function ChatInterface({ portfolioData }: ChatInterfaceProps) {
  const {
    messages,
    isLoading,
    isTyping,
    error,
    addMessage,
    setLoading,
    setTyping,
    setError,
    clearChat,
    hasMessages,
    conversationHistory,
  } = useChatState();

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

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Save conversation whenever messages change
  useEffect(() => {
    if (messages.length > 0 && currentConversationId.current) {
      ConversationManager.saveConversation(currentConversationId.current, messages);
    }
  }, [messages]);

  const handleSendMessage = async (message: string) => {
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

      // TODO: This will be implemented in task 5.1 - Create chat API route
      // For now, we'll simulate a response with better state management
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Add AI response
      addMessage({
        message: "Thank you for your message! The AI chat functionality will be implemented in the next phase of development. For now, you can explore my portfolio in the traditional format.",
        isUser: false,
      });

    } catch (error) {
      console.error('Failed to send message:', error);
      
      // Set error state and add error message
      setError('Failed to send message. Please try again.');
      addMessage({
        message: "Sorry, I'm having trouble responding right now. Please try again later.",
        isUser: false,
      });
    } finally {
      setLoading(false);
      setTyping(false);
    }
  };

  const handleQuestionClick = (question: string) => {
    handleSendMessage(question);
  };

  const handleClearChat = () => {
    clearChat();
    // Create a new conversation
    currentConversationId.current = ConversationManager.createNewConversation();
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900">
      {/* Chat Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-white">
                AI Assistant
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Ask me about {portfolioData.profile.name}'s experience
              </p>
            </div>
          </div>
          {hasMessages && (
            <button
              onClick={handleClearChat}
              className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
            >
              Clear Chat
            </button>
          )}
        </div>
      </div>

      {/* Messages Container */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 chat-container chat-scroll"
        style={{ maxHeight: 'calc(100vh - 200px)' }}
      >
        {!hasMessages && (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Welcome to the AI Chat!
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
              Ask me anything about {portfolioData.profile.name}'s professional background, projects, or skills.
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            message={msg.message}
            isUser={msg.isUser}
            timestamp={msg.timestamp}
          />
        ))}

        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Error Display */}
      {error && (
        <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Suggested Questions (only show when no messages) */}
      {!hasMessages && (
        <SuggestedQuestions
          questions={SUGGESTED_QUESTIONS}
          onQuestionClick={handleQuestionClick}
          disabled={isLoading}
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