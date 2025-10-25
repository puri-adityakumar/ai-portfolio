'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface UserFlowTestProps {
  onFlowComplete?: (results: FlowTestResult[]) => void;
}

interface FlowTestResult {
  test: string;
  passed: boolean;
  message: string;
}

export default function UserFlowTest({ onFlowComplete }: UserFlowTestProps) {
  const pathname = usePathname();
  const [testResults, setTestResults] = useState<FlowTestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runNavigationTests = async () => {
    setIsRunning(true);
    const results: FlowTestResult[] = [];

    // Test 1: Check if navigation components are present
    const homeNavigation = document.querySelector('[aria-label*="Main navigation"]');
    results.push({
      test: 'Navigation Component Present',
      passed: !!homeNavigation || pathname === '/',
      message: homeNavigation ? 'Navigation component found' : 'Navigation component missing'
    });

    // Test 2: Check if mode selection links work (homepage)
    if (pathname === '/') {
      const chatLink = document.querySelector('[href="/chat"]');
      const portfolioLink = document.querySelector('[href="/portfolio"]');
      
      results.push({
        test: 'Homepage Mode Selection Links',
        passed: !!(chatLink && portfolioLink),
        message: chatLink && portfolioLink ? 'Both mode selection links present' : 'Mode selection links missing'
      });
    }

    // Test 3: Check if floating navigation appears on scroll (non-homepage)
    if (pathname !== '/') {
      const floatingNav = document.querySelector('[aria-label="Main navigation"]');
      results.push({
        test: 'Floating Navigation Available',
        passed: !!floatingNav,
        message: floatingNav ? 'Floating navigation found' : 'Floating navigation missing'
      });
    }

    // Test 4: Check if back to home links work
    const homeLinks = document.querySelectorAll('[href="/"]');
    results.push({
      test: 'Back to Home Links',
      passed: homeLinks.length > 0,
      message: `Found ${homeLinks.length} home navigation links`
    });

    // Test 5: Check accessibility features
    const skipLink = document.querySelector('[href="#main-content"]');
    const mainContent = document.querySelector('#main-content');
    results.push({
      test: 'Accessibility Features',
      passed: !!(skipLink && mainContent),
      message: skipLink && mainContent ? 'Skip link and main content present' : 'Accessibility features missing'
    });

    // Test 6: Check responsive navigation
    const mobileNavElements = document.querySelectorAll('.sm\\:hidden, .lg\\:hidden');
    results.push({
      test: 'Responsive Navigation Elements',
      passed: mobileNavElements.length > 0,
      message: `Found ${mobileNavElements.length} responsive navigation elements`
    });

    setTestResults(results);
    setIsRunning(false);
    
    if (onFlowComplete) {
      onFlowComplete(results);
    }
  };

  useEffect(() => {
    // Run tests after component mounts and DOM is ready
    const timer = setTimeout(runNavigationTests, 1000);
    return () => clearTimeout(timer);
  }, [pathname]);

  const passedTests = testResults.filter(r => r.passed).length;
  const totalTests = testResults.length;
  const allPassed = passedTests === totalTests && totalTests > 0;

  if (process.env.NODE_ENV === 'production') {
    return null; // Don't show in production
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-4 max-w-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
          Navigation Flow Test
        </h3>
        <div className={`w-3 h-3 rounded-full ${allPassed ? 'bg-green-500' : 'bg-yellow-500'}`} />
      </div>
      
      {isRunning ? (
        <div className="text-sm text-slate-600 dark:text-slate-400">
          Running tests...
        </div>
      ) : (
        <>
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">
            {passedTests}/{totalTests} tests passed
          </div>
          
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {testResults.map((result, index) => (
              <div key={index} className="flex items-start gap-2 text-xs">
                <div className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${
                  result.passed ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <div>
                  <div className={`font-medium ${
                    result.passed ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
                  }`}>
                    {result.test}
                  </div>
                  <div className="text-slate-500 dark:text-slate-400">
                    {result.message}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <button
            onClick={runNavigationTests}
            className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
          >
            Re-run Tests
          </button>
        </>
      )}
    </div>
  );
}