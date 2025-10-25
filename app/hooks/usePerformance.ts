'use client';

import { useEffect, useCallback } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  interactionTime: number;
}

export function usePerformance() {
  const measurePerformance = useCallback(() => {
    if (typeof window === 'undefined') return;

    // Measure page load time
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
      const renderTime = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;
      
      // Log performance metrics (in production, send to analytics)
      if (process.env.NODE_ENV === 'development') {
        console.log('Performance Metrics:', {
          loadTime: `${loadTime.toFixed(2)}ms`,
          renderTime: `${renderTime.toFixed(2)}ms`,
          totalTime: `${(navigation.loadEventEnd - navigation.fetchStart).toFixed(2)}ms`,
        });
      }
    }

    // Measure Core Web Vitals
    if ('web-vital' in window) {
      // This would integrate with web-vitals library in production
      // import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';
    }
  }, []);

  const measureInteraction = useCallback((name: string, startTime: number) => {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`Interaction "${name}": ${duration.toFixed(2)}ms`);
    }
    
    // In production, send to analytics
    return duration;
  }, []);

  useEffect(() => {
    // Measure initial load performance
    if (document.readyState === 'complete') {
      measurePerformance();
    } else {
      window.addEventListener('load', measurePerformance);
      return () => window.removeEventListener('load', measurePerformance);
    }
  }, [measurePerformance]);

  return {
    measureInteraction,
  };
}

// Hook for measuring component render performance
export function useRenderPerformance(componentName: string) {
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      if (process.env.NODE_ENV === 'development' && renderTime > 16) {
        console.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
      }
    };
  });
}