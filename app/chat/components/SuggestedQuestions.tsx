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
    <div className="p-5 sm:p-6 border-b border-white/10 relative overflow-hidden animate-fade-in">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/[0.03] via-blue-500/[0.03] to-indigo-500/[0.03]" />
      <div className="relative z-10">
        {showTitle && (
          <h3 className="text-xs font-medium text-white/40 mb-4 uppercase tracking-wider">
            Suggested Questions
          </h3>
        )}
        {!showTitle && (
          <h3 className="text-xs font-medium text-white/30 mb-3 uppercase tracking-wider">
            You Might Also Ask
          </h3>
        )}
        <div className="flex flex-wrap gap-2.5" role="group" aria-label="Suggested questions">
          {questions.map((question, index) => (
            <button
              key={`${question}-${index}`}
              onClick={() => onQuestionClick(question)}
              disabled={disabled}
              className="
                px-4 py-2.5 text-sm bg-white/[0.08] backdrop-blur-md text-white/80 relative overflow-hidden
                hover:bg-white/[0.12] hover:text-white rounded-lg transition-all duration-200
                disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white/[0.08]
                focus:outline-none focus:ring-1 focus:ring-white/30
                border border-white/20 hover:border-white/25
                font-light shadow-sm
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