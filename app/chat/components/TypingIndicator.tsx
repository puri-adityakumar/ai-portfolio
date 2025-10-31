'use client';

export default function TypingIndicator() {
  return (
    <div className="flex justify-start mb-6 animate-message-slide-in">
      <div className="max-w-[85%] sm:max-w-[75%] md:max-w-[65%]">
        <div className="bg-white/[0.08] backdrop-blur-md px-4 sm:px-5 py-3 sm:py-4 rounded-xl shadow-md border border-white/15 relative overflow-hidden">
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1.5">
              <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span className="text-xs text-white/50 ml-2 font-light">AI is typing...</span>
          </div>
        </div>
      </div>
    </div>
  );
}