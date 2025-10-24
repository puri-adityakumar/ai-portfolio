'use client';

import { useEffect, useCallback } from 'react';
import { ChatMessage } from '@/types/portfolio';
import { ConversationManager } from '../utils/conversationManager';

interface UseConversationPersistenceOptions {
  conversationId: string | null;
  messages: ChatMessage[];
  autoSave?: boolean;
  saveDelay?: number;
}

interface UseConversationPersistenceReturn {
  saveConversation: () => void;
  loadConversation: (id: string) => ChatMessage[];
  deleteConversation: (id: string) => void;
  createNewConversation: () => string;
  getConversationsSummary: () => ReturnType<typeof ConversationManager.getConversationsSummary>;
}

export function useConversationPersistence({
  conversationId,
  messages,
  autoSave = true,
  saveDelay = 1000,
}: UseConversationPersistenceOptions): UseConversationPersistenceReturn {
  
  // Save current conversation
  const saveConversation = useCallback(() => {
    if (conversationId && messages.length > 0) {
      ConversationManager.saveConversation(conversationId, messages);
    }
  }, [conversationId, messages]);

  // Load a specific conversation
  const loadConversation = useCallback((id: string): ChatMessage[] => {
    return ConversationManager.loadConversation(id);
  }, []);

  // Delete a conversation
  const deleteConversation = useCallback((id: string) => {
    ConversationManager.deleteConversation(id);
  }, []);

  // Create a new conversation
  const createNewConversation = useCallback((): string => {
    return ConversationManager.createNewConversation();
  }, []);

  // Get conversations summary
  const getConversationsSummary = useCallback(() => {
    return ConversationManager.getConversationsSummary();
  }, []);

  // Auto-save with debouncing
  useEffect(() => {
    if (!autoSave || !conversationId || messages.length === 0) {
      return;
    }

    const timeoutId = setTimeout(() => {
      saveConversation();
    }, saveDelay);

    return () => clearTimeout(timeoutId);
  }, [messages, conversationId, autoSave, saveDelay, saveConversation]);

  return {
    saveConversation,
    loadConversation,
    deleteConversation,
    createNewConversation,
    getConversationsSummary,
  };
}