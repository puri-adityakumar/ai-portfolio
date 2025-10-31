'use client';

import { useState, KeyboardEvent } from 'react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  isLoading?: boolean;
  onStop?: () => void;
  onRetry?: () => void;
}

export default function ChatInput({ 
  onSendMessage, 
  disabled = false, 
  placeholder = "Type your message...",
  isLoading = false,
  onStop,
  onRetry,
}: ChatInputProps) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-white/10 bg-white/[0.05] backdrop-blur-md p-4 sm:p-5 md:p-6 relative overflow-hidden" role="region" aria-label="Message input">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/[0.03] via-blue-500/[0.03] to-indigo-500/[0.03]" />
      <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="relative z-10">
        <div className="flex items-end space-x-2 sm:space-x-3">
          <div className="flex-1">
            <label htmlFor="message-input" className="sr-only">
              Type your message to the AI assistant
            </label>
            <textarea
              id="message-input"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              disabled={disabled}
              rows={1}
              aria-describedby="message-help"
              className="
                w-full px-4 sm:px-5 py-3 sm:py-4 rounded-xl border border-white/20 
                bg-white/[0.08] backdrop-blur-md text-white shadow-md
                placeholder-white/50
                focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-white/30
                resize-none min-h-[52px] max-h-32
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-200 font-light
              "
              style={{
                height: 'auto',
                minHeight: '48px',
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = Math.min(target.scrollHeight, 128) + 'px';
              }}
            />
            <div id="message-help" className="sr-only">
              Press Enter to send message, Shift+Enter for new line
            </div>
          </div>
          <button
            type="submit"
            aria-label="Send message"
            onClick={handleSend}
            disabled={disabled || !message.trim()}
            className="
              p-3 sm:p-4 rounded-xl bg-white/10 backdrop-blur-md text-white hover:bg-white/15
              disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white/10
              transition-all duration-200 flex-shrink-0
              focus:outline-none focus:ring-1 focus:ring-white/30
              hover:scale-105 active:scale-95
              shadow-md hover:shadow-lg
              border border-white/20 hover:border-white/30
            "
            aria-label={disabled ? "Please wait, message is being sent" : "Send message"}
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
          {isLoading ? (
            <button
              type="button"
              onClick={onStop}
              className="px-3 py-3 sm:px-4 sm:py-4 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/15 transition-all focus:outline-none focus:ring-1 focus:ring-white/30 shadow-md"
              aria-label="Stop generating"
            >
              Stop
            </button>
          ) : (
            (onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="px-3 py-3 sm:px-4 sm:py-4 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/15 transition-all focus:outline-none focus:ring-1 focus:ring-white/30 shadow-md"
                aria-label="Retry last message"
              >
                Retry
              </button>
            ))
          )}
        </div>
      </form>
    </div>
  );
}