'use client';

import { ReactNode } from 'react';
import { useIntersectionObserver } from '@/app/hooks/useIntersectionObserver';

interface LazySectionProps {
  children: ReactNode;
  className?: string;
  fallback?: ReactNode;
}

export default function LazySection({ 
  children, 
  className = '',
  fallback 
}: LazySectionProps) {
  const { elementRef, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '100px',
    triggerOnce: true,
  });

  const defaultFallback = (
    <div className={`animate-pulse ${className}`}>
      <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded mb-6 w-48"></div>
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-slate-100 dark:bg-slate-800 rounded-lg p-6">
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded mb-2 w-3/4"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-2 w-1/2"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div ref={elementRef} className={className}>
      {isIntersecting ? children : (fallback || defaultFallback)}
    </div>
  );
}