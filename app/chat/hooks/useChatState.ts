'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChatMessage } from '@/types/portfolio';
import { StorageUtils } from '../utils/storageUtils';

interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  isTyping: boolean;
  error: string | null;
}

interface UseChatStateReturn {
  // State
  messages: ChatMessage[];
  isLoading: boolean;
  isTyping: boolean;
  error: string | null;
  
  // Actions
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => ChatMessage;
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void;
  setLoading: (loading: boolean) => void;
  setTyping: (typing: boolean) => void;
  setError: (error: string | null) => void;
  clearChat: () => void;
  loadConversation: () => void;
  saveConversation: () => void;
  
  // Computed values
  conversationHistory: ChatMessage[];
  hasMessages: boolean;
  lastMessage: ChatMessage | null;
}

const STORAGE_KEY = 'ai-portfolio-chat-messages';
const MAX_HISTORY_LENGTH = 50; // Limit conversation history to prevent localStorage overflow

export function useChatState(): UseChatStateReturn {
  const [state, setState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    isTyping: false,
    error: null,
  });

  // Generate unique message ID
  const generateMessageId = useCallback((): string => {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Add a new message to the conversation
  const addMessage = useCallback((messageData: Omit<ChatMessage, 'id' | 'timestamp'>): ChatMessage => {
    const newMessage: ChatMessage = {
      ...messageData,
      id: generateMessageId(),
      timestamp: new Date(),
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage],
      error: null, // Clear any previous errors when adding new messages
    }));

    return newMessage;
  }, [generateMessageId]);

  // Update an existing message (useful for streaming responses)
  const updateMessage = useCallback((id: string, updates: Partial<ChatMessage>) => {
    setState(prev => ({
      ...prev,
      messages: prev.messages.map(msg => 
        msg.id === id ? { ...msg, ...updates } : msg
      ),
    }));
  }, []);

  // Set loading state
  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, isLoading: loading }));
  }, []);

  // Set typing indicator state
  const setTyping = useCallback((typing: boolean) => {
    setState(prev => ({ ...prev, isTyping: typing }));
  }, []);

  // Set error state
  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  // Clear all messages and reset state
  const clearChat = useCallback(() => {
    setState({
      messages: [],
      isLoading: false,
      isTyping: false,
      error: null,
    });
    
    // Clear from localStorage
    StorageUtils.removeItem(STORAGE_KEY);
  }, []);

  // Load conversation from localStorage
  const loadConversation = useCallback(() => {
    const savedData = StorageUtils.getItem<any[]>(STORAGE_KEY, []);
    
    if (savedData.length > 0) {
      // Validate the data structure
      if (Array.isArray(savedData)) {
        const messagesWithDates = savedData.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
        
        // Limit the number of messages to prevent memory issues
        const limitedMessages = messagesWithDates.slice(-MAX_HISTORY_LENGTH);
        
        setState(prev => ({
          ...prev,
          messages: limitedMessages,
        }));
      } else {
        setError('Failed to load previous conversation - invalid data format');
      }
    }
  }, [setError]);

  // Save conversation to localStorage
  const saveConversation = useCallback(() => {
    if (state.messages.length > 0) {
      // Only save the last MAX_HISTORY_LENGTH messages
      const messagesToSave = state.messages.slice(-MAX_HISTORY_LENGTH);
      const success = StorageUtils.setItem(STORAGE_KEY, messagesToSave);
      
      if (!success) {
        console.warn('Failed to save conversation - storage may be full');
        // Don't set error state for save failures as it's not critical for UX
      }
    }
  }, [state.messages]);

  // Auto-save conversation whenever messages change
  useEffect(() => {
    if (state.messages.length > 0) {
      saveConversation();
    }
  }, [state.messages, saveConversation]);

  // Load conversation on mount
  useEffect(() => {
    loadConversation();
  }, [loadConversation]);

  // Computed values
  const conversationHistory = state.messages;
  const hasMessages = state.messages.length > 0;
  const lastMessage = state.messages.length > 0 ? state.messages[state.messages.length - 1] : null;

  return {
    // State
    messages: state.messages,
    isLoading: state.isLoading,
    isTyping: state.isTyping,
    error: state.error,
    
    // Actions
    addMessage,
    updateMessage,
    setLoading,
    setTyping,
    setError,
    clearChat,
    loadConversation,
    saveConversation,
    
    // Computed values
    conversationHistory,
    hasMessages,
    lastMessage,
  };
}