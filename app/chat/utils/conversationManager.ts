'use client';

import { ChatMessage } from '@/types/portfolio';
import { StorageUtils } from './storageUtils';

export interface ConversationMetadata {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messageCount: number;
  lastMessage?: string;
}

export interface ConversationSummary {
  conversations: ConversationMetadata[];
  currentConversationId: string | null;
  totalConversations: number;
}

const CONVERSATIONS_STORAGE_KEY = 'ai-portfolio-conversations';
const CURRENT_CONVERSATION_KEY = 'ai-portfolio-current-conversation';
const MAX_CONVERSATIONS = 10; // Limit stored conversations

export class ConversationManager {
  // Generate a conversation title from the first user message
  static generateConversationTitle(messages: ChatMessage[]): string {
    const firstUserMessage = messages.find(msg => msg.isUser);
    if (firstUserMessage) {
      // Truncate long messages for title
      const title = firstUserMessage.message.slice(0, 50);
      return title.length < firstUserMessage.message.length ? `${title}...` : title;
    }
    return 'New Conversation';
  }

  // Generate unique conversation ID
  static generateConversationId(): string {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get all stored conversations metadata
  static getConversationsSummary(): ConversationSummary {
    const stored = StorageUtils.getItem<ConversationMetadata[]>(CONVERSATIONS_STORAGE_KEY, []);
    const currentId = StorageUtils.getItem<string | null>(CURRENT_CONVERSATION_KEY, null);
    
    const conversations = stored.map((conv: any) => ({
      ...conv,
      createdAt: new Date(conv.createdAt),
      updatedAt: new Date(conv.updatedAt),
    }));
    
    return {
      conversations: conversations.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()),
      currentConversationId: currentId,
      totalConversations: conversations.length,
    };
  }

  // Save conversation metadata
  static saveConversationMetadata(
    conversationId: string, 
    messages: ChatMessage[]
  ): void {
    const summary = this.getConversationsSummary();
    const existingIndex = summary.conversations.findIndex(c => c.id === conversationId);
    
    const metadata: ConversationMetadata = {
      id: conversationId,
      title: this.generateConversationTitle(messages),
      createdAt: existingIndex >= 0 ? summary.conversations[existingIndex].createdAt : new Date(),
      updatedAt: new Date(),
      messageCount: messages.length,
      lastMessage: messages.length > 0 ? messages[messages.length - 1].message.slice(0, 100) : undefined,
    };

    let updatedConversations: ConversationMetadata[];
    
    if (existingIndex >= 0) {
      // Update existing conversation
      updatedConversations = [...summary.conversations];
      updatedConversations[existingIndex] = metadata;
    } else {
      // Add new conversation
      updatedConversations = [metadata, ...summary.conversations];
    }

    // Limit the number of stored conversations
    if (updatedConversations.length > MAX_CONVERSATIONS) {
      updatedConversations = updatedConversations.slice(0, MAX_CONVERSATIONS);
    }

    StorageUtils.setItem(CONVERSATIONS_STORAGE_KEY, updatedConversations);
    StorageUtils.setItem(CURRENT_CONVERSATION_KEY, conversationId);
  }

  // Load a specific conversation
  static loadConversation(conversationId: string): ChatMessage[] {
    const messages = StorageUtils.getItem<any[]>(`conversation_${conversationId}`, []);
    return messages.map((msg: any) => ({
      ...msg,
      timestamp: new Date(msg.timestamp),
    }));
  }

  // Save a specific conversation
  static saveConversation(conversationId: string, messages: ChatMessage[]): void {
    const success = StorageUtils.setItem(`conversation_${conversationId}`, messages);
    if (success) {
      this.saveConversationMetadata(conversationId, messages);
    }
  }

  // Delete a conversation
  static deleteConversation(conversationId: string): void {
    StorageUtils.removeItem(`conversation_${conversationId}`);
    
    const summary = this.getConversationsSummary();
    const updatedConversations = summary.conversations.filter(c => c.id !== conversationId);
    StorageUtils.setItem(CONVERSATIONS_STORAGE_KEY, updatedConversations);
    
    // If this was the current conversation, clear the current conversation ID
    if (summary.currentConversationId === conversationId) {
      StorageUtils.removeItem(CURRENT_CONVERSATION_KEY);
    }
  }

  // Clear all conversations
  static clearAllConversations(): void {
    const summary = this.getConversationsSummary();
    
    // Remove all conversation data
    summary.conversations.forEach(conv => {
      StorageUtils.removeItem(`conversation_${conv.id}`);
    });
    
    // Clear metadata
    StorageUtils.removeItem(CONVERSATIONS_STORAGE_KEY);
    StorageUtils.removeItem(CURRENT_CONVERSATION_KEY);
  }

  // Get current conversation ID
  static getCurrentConversationId(): string | null {
    return StorageUtils.getItem<string | null>(CURRENT_CONVERSATION_KEY, null);
  }

  // Set current conversation ID
  static setCurrentConversationId(conversationId: string): void {
    StorageUtils.setItem(CURRENT_CONVERSATION_KEY, conversationId);
  }

  // Create a new conversation
  static createNewConversation(): string {
    const newId = this.generateConversationId();
    this.setCurrentConversationId(newId);
    return newId;
  }

  // Format conversation history for LLM context (excluding system messages)
  static formatConversationForLLM(messages: ChatMessage[]): ChatMessage[] {
    return messages.filter(msg => !msg.message.startsWith('[System]'));
  }

  // Truncate conversation history to fit within token limits
  static truncateConversationHistory(
    messages: ChatMessage[], 
    maxMessages: number = 20
  ): ChatMessage[] {
    if (messages.length <= maxMessages) {
      return messages;
    }
    
    // Keep the most recent messages, but always include the first user message for context
    const firstUserMessage = messages.find(msg => msg.isUser);
    const recentMessages = messages.slice(-maxMessages);
    
    if (firstUserMessage && !recentMessages.includes(firstUserMessage)) {
      return [firstUserMessage, ...recentMessages.slice(1)];
    }
    
    return recentMessages;
  }
}