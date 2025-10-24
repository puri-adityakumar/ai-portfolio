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
    <div className="p-4 border-b border-slate-200 dark:border-slate-700">
      {showTitle && (
        <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
          Suggested questions:
        </h3>
      )}
      {!showTitle && (
        <h3 className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
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
              px-3 py-2 text-sm bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300
              hover:bg-slate-200 dark:hover:bg-slate-600 rounded-full transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-slate-100 dark:disabled:hover:bg-slate-700
              border border-slate-200 dark:border-slate-600
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800
            "
            title={`Ask: ${question}`}
            aria-label={`Ask question: ${question}`}
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  );
}