'use client';

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
  
  return (
    <div 
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 animate-message-slide-in`}
      role="group"
      aria-labelledby={messageId}
    >
      <div className={`max-w-[85%] sm:max-w-[80%] md:max-w-[70%] ${isUser ? 'order-2' : 'order-1'}`}>
        <div
          className={`
            px-3 sm:px-4 py-2 sm:py-3 rounded-2xl shadow-lg relative overflow-hidden
            ${isUser 
              ? 'glass-strong text-white rounded-br-md border border-blue-500/30' 
              : 'glass text-white rounded-bl-md border border-purple-500/30'
            }
            ${isStreaming ? 'animate-pulse' : ''}
            transition-all duration-200 hover:shadow-xl
          `}
          role={isUser ? "log" : "log"}
          aria-live={isStreaming ? "polite" : "off"}
          aria-label={isUser ? "Your message" : "AI assistant message"}
        >
          <div className={`absolute inset-0 ${isUser ? 'bg-gradient-to-br from-blue-500/10 to-purple-500/10' : 'bg-gradient-to-br from-purple-500/10 to-indigo-500/10'} pointer-events-none`} />
          <p 
            id={messageId}
            className="text-sm md:text-base leading-relaxed whitespace-pre-wrap relative z-10"
          >
            {message}
            {isStreaming && (
              <span 
                className="inline-block w-2 h-4 ml-1 bg-current animate-pulse"
                aria-label="AI is typing"
                role="status"
              >
                |
              </span>
            )}
          </p>
        </div>
        <div 
          className={`text-xs text-white/40 mt-1 px-1 ${isUser ? 'text-right' : 'text-left'}`}
          aria-label={`Message sent ${formatDistanceToNow(timestamp, { addSuffix: true })}`}
        >
          {formatDistanceToNow(timestamp, { addSuffix: true })}
        </div>
      </div>
    </div>
  );
}