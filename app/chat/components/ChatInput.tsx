'use client';

import { useState, KeyboardEvent } from 'react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function ChatInput({ 
  onSendMessage, 
  disabled = false, 
  placeholder = "Type your message..." 
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
    <div className="border-t border-white/10 glass p-3 sm:p-4 relative overflow-hidden" role="region" aria-label="Message input">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-indigo-500/5 opacity-50" />
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
                w-full px-3 sm:px-4 py-2 sm:py-3 rounded-2xl border border-white/20 
                glass text-white
                placeholder-white/40
                focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30
                resize-none min-h-[48px] max-h-32
                disabled:opacity-50 disabled:cursor-not-allowed
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
            onClick={handleSend}
            disabled={disabled || !message.trim()}
            className="
              p-3 rounded-full glass-strong text-white hover:bg-white/10
              disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white/5
              transition-all duration-200 flex-shrink-0
              focus:outline-none focus:ring-2 focus:ring-white/20
              hover:scale-110 active:scale-95
              glow-blue hover:glow-purple
            "
            aria-label={disabled ? "Please wait, message is being sent" : "Send message"}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}