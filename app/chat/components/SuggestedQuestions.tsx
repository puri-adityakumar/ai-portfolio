'use client';

interface SuggestedQuestionsProps {
  questions: string[];
  onQuestionClick: (question: string) => void;
  disabled?: boolean;
  showTitle?: boolean;
}

export default function SuggestedQuestions({ 
  questions, 
  onQuestionClick, 
  disabled = false,
  showTitle = true
}: SuggestedQuestionsProps) {
  if (questions.length === 0) return null;

  return (
    <div className="p-4 sm:p-6 border-b border-white/10 relative overflow-hidden animate-fade-in">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-indigo-500/5 opacity-50" />
      <div className="relative z-10">
        {showTitle && (
          <h3 className="text-sm font-semibold text-gradient-accent mb-3">
            Suggested questions:
          </h3>
        )}
        {!showTitle && (
          <h3 className="text-xs font-medium text-white/50 mb-2">
            You might also ask:
          </h3>
        )}
        <div className="flex flex-wrap gap-2" role="group" aria-label="Suggested questions">
          {questions.map((question, index) => (
            <button
              key={`${question}-${index}`}
              onClick={() => onQuestionClick(question)}
              disabled={disabled}
              className="
                px-3 py-2 text-sm glass-strong text-white/80 relative overflow-hidden
                hover:bg-white/10 hover:text-white rounded-full transition-all duration-300
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white/5
                focus:outline-none focus:ring-2 focus:ring-white/20
                hover:scale-105 active:scale-95 hover:shadow-lg
                border border-white/10 hover:border-white/20
              "
              title={`Ask: ${question}`}
              aria-label={`Ask question: ${question}`}
            >
              <span className="relative z-10">{question}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}