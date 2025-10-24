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
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[80%] md:max-w-[70%] ${isUser ? 'order-2' : 'order-1'}`}>
        <div
          className={`
            px-4 py-3 rounded-2xl shadow-sm
            ${isUser 
              ? 'bg-blue-500 text-white rounded-br-md' 
              : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-bl-md'
            }
            ${isStreaming ? 'animate-pulse' : ''}
          `}
        >
          <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">
            {message}
            {isStreaming && (
              <span className="inline-block w-2 h-4 ml-1 bg-current animate-pulse">|</span>
            )}
          </p>
        </div>
        <div className={`text-xs text-slate-500 dark:text-slate-400 mt-1 px-1 ${isUser ? 'text-right' : 'text-left'}`}>
          {formatDistanceToNow(timestamp, { addSuffix: true })}
        </div>
      </div>
    </div>
  );
}