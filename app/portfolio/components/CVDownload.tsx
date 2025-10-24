'use client';

import { useState, useEffect, useRef } from 'react';
import { PortfolioData } from '@/types/portfolio';
import { downloadCV, downloadCVAsText } from '@/lib/cv-generator';

interface CVDownloadProps {
  portfolioData: PortfolioData;
}

export default function CVDownload({ portfolioData }: CVDownloadProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle keyboard navigation and close dropdown on outside click
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isDropdownOpen) {
        if (event.key === 'Escape') {
          setIsDropdownOpen(false);
        }
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      downloadCV(portfolioData);
    } catch (error) {
      console.error('Error downloading CV as PDF:', error);
      alert('Error downloading CV. Please try the text format instead.');
    } finally {
      setIsDownloading(false);
      setIsDropdownOpen(false);
    }
  };

  const handleDownloadText = async () => {
    setIsDownloading(true);
    try {
      downloadCVAsText(portfolioData);
    } catch (error) {
      console.error('Error downloading CV as text:', error);
      alert('Error downloading CV. Please try again.');
    } finally {
      setIsDownloading(false);
      setIsDropdownOpen(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Main Download Button */}
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        disabled={isDownloading}
        className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
        aria-expanded={isDropdownOpen}
        aria-haspopup="true"
        aria-label="Download CV options"
      >
        {isDownloading ? (
          <>
            <svg className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="hidden sm:inline">Downloading...</span>
            <span className="sm:hidden">...</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="hidden sm:inline">Download CV</span>
            <span className="sm:hidden">CV</span>
            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </>
        )}
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsDropdownOpen(false)}
            aria-hidden="true"
          />
          
          {/* Dropdown Content */}
          <div 
            className="absolute right-0 top-full mt-2 w-56 sm:w-64 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 z-20"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="download-menu"
          >
            <div className="p-2">
              <button
                onClick={handleDownloadPDF}
                disabled={isDownloading}
                className="w-full flex items-center gap-3 px-3 py-2 text-left text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none focus:bg-slate-100 dark:focus:bg-slate-700 rounded-md transition-colors disabled:opacity-50"
                role="menuitem"
                aria-label="Download CV as PDF"
              >
                <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <div className="min-w-0">
                  <div className="font-medium">Download as PDF</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">Print-friendly format</div>
                </div>
              </button>
              
              <button
                onClick={handleDownloadText}
                disabled={isDownloading}
                className="w-full flex items-center gap-3 px-3 py-2 text-left text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none focus:bg-slate-100 dark:focus:bg-slate-700 rounded-md transition-colors disabled:opacity-50"
                role="menuitem"
                aria-label="Download CV as text file"
              >
                <svg className="w-5 h-5 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div className="min-w-0">
                  <div className="font-medium">Download as Text</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">Plain text format</div>
                </div>
              </button>
            </div>
            
            <div className="border-t border-slate-200 dark:border-slate-700 p-2">
              <div className="px-3 py-2 text-xs text-slate-500 dark:text-slate-400">
                💡 PDF format opens print dialog for saving
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}