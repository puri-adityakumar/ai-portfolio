'use client';

import { Suspense, ReactNode } from 'react';
import LoadingSpinner from './LoadingSpinner';

interface LazyWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
  className?: string;
}

export default function LazyWrapper({ 
  children, 
  fallback,
  className = '' 
}: LazyWrapperProps) {
  const defaultFallback = (
    <div className={`flex items-center justify-center min-h-[200px] ${className}`}>
      <LoadingSpinner size="lg" label="Loading content..." />
    </div>
  );

  return (
    <Suspense fallback={fallback || defaultFallback}>
      {children}
    </Suspense>
  );
}