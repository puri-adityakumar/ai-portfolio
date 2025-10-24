'use client';

interface SuggestedQuestionsProps {
  questions: string[];
  onQuestionClick: (question: string) => void;
  disabled?: boolean;
}

export default function SuggestedQuestions({ 
  questions, 
  onQuestionClick, 
  disabled = false 
}: SuggestedQuestionsProps) {
  if (questions.length === 0) return null;

  return (
    <div className="p-4 border-b border-slate-200 dark:border-slate-700">
      <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
        Suggested questions:
      </h3>
      <div className="flex flex-wrap gap-2">
        {questions.map((question, index) => (
          <button
            key={index}
            onClick={() => onQuestionClick(question)}
            disabled={disabled}
            className="
              px-3 py-2 text-sm bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300
              hover:bg-slate-200 dark:hover:bg-slate-600 rounded-full transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-slate-100 dark:disabled:hover:bg-slate-700
              border border-slate-200 dark:border-slate-600
            "
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  );
}