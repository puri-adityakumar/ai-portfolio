'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ChatMessage as ChatMessageType } from '@/types/portfolio';

export interface ChatMessageProps {
  message: string;
  isUser: boolean;
  timestamp: Date;
  isStreaming?: boolean;
}

export default function ChatMessage({ message, isUser, timestamp, isStreaming = false }: ChatMessageProps) {
  const messageId = `message-${timestamp.getTime()}`;
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Ignore copy failure silently
    }
  };

  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6 animate-message-slide-in group`}
      role="group"
      aria-labelledby={messageId}
    >
      {!isUser && (
        <div className="order-0 mr-2 mt-1 hidden sm:block" aria-hidden="true">
          <div className="w-7 h-7 rounded-md bg-white/10 border border-white/20 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
      )}
      <div className={`max-w-[85%] sm:max-w-[75%] md:max-w-[65%] ${isUser ? 'order-2' : 'order-1'}`}>
        <div
          className={`
            px-4 sm:px-5 py-3 sm:py-4 rounded-xl relative overflow-hidden
            ${isUser
              ? 'bg-white/10 backdrop-blur-md text-white border border-white/20'
              : 'bg-white/[0.08] backdrop-blur-md text-white border border-white/15'
            }
            ${isStreaming ? 'animate-pulse' : ''}
            transition-all duration-200 shadow-md hover:shadow-lg
          `}
          role={isUser ? "log" : "log"}
          aria-live={isStreaming ? "polite" : "off"}
          aria-label={isUser ? "Your message" : "AI assistant message"}
        >
          <p
            id={messageId}
            className="text-sm md:text-base leading-relaxed whitespace-pre-wrap font-light"
          >
            {message}
            {isStreaming && (
              <span
                className="inline-block w-1.5 h-4 ml-1 bg-white/50 animate-pulse"
                aria-label="AI is typing"
                role="status"
              >
                |
              </span>
            )}
          </p>
          {!isUser && (
            <div className="absolute -top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={handleCopy}
                className="px-2 py-1 text-[10px] rounded bg-white/15 border border-white/20 text-white/80 hover:text-white hover:bg-white/20 focus:outline-none focus:ring-1 focus:ring-white/30"
                aria-label={copied ? 'Copied' : 'Copy message'}
              >
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          )}
        </div>
        <div
          className={`text-xs text-white/50 mt-2 px-1 font-light ${isUser ? 'text-right' : 'text-left'}`}
          aria-label={`Message sent ${formatDistanceToNow(timestamp, { addSuffix: true })}`}
        >
          {formatDistanceToNow(timestamp, { addSuffix: true })}
        </div>
      </div>
      {isUser && (
        <div className="order-3 ml-2 mt-1 hidden sm:block" aria-hidden="true">
          <div className="w-7 h-7 rounded-md bg-white/10 border border-white/20 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}