import Link from "next/link";

export default function Chat() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-16">
      <div className="container mx-auto px-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-8">
            Chat Interface
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
            This page will be implemented in a future task.
          </p>
          <Link 
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}