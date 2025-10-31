'use client';

export default function TypingIndicator() {
  return (
    <div className="flex justify-start mb-4 animate-message-slide-in">
      <div className="max-w-[85%] sm:max-w-[80%] md:max-w-[70%]">
        <div className="glass px-3 sm:px-4 py-2 sm:py-3 rounded-2xl rounded-bl-md shadow-lg border border-purple-500/30 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 pointer-events-none" />
          <div className="flex items-center space-x-2 relative z-10">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span className="text-xs text-white/50 ml-2">AI is typing...</span>
          </div>
        </div>
      </div>
    </div>
  );
}