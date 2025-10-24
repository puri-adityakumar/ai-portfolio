'use client';

import { useState } from 'react';
import { PortfolioData } from '@/types/portfolio';
import { downloadCV, downloadCVAsText } from '@/lib/cv-generator';

interface CVDownloadProps {
  portfolioData: PortfolioData;
}

export default function CVDownload({ portfolioData }: CVDownloadProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

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
    <div className="relative">
      {/* Main Download Button */}
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        disabled={isDownloading}
        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isDownloading ? (
          <>
            <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Downloading...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download CV
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          />
          
          {/* Dropdown Content */}
          <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 z-20">
            <div className="p-2">
              <button
                onClick={handleDownloadPDF}
                disabled={isDownloading}
                className="w-full flex items-center gap-3 px-3 py-2 text-left text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors disabled:opacity-50"
              >
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <div>
                  <div className="font-medium">Download as PDF</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">Print-friendly format</div>
                </div>
              </button>
              
              <button
                onClick={handleDownloadText}
                disabled={isDownloading}
                className="w-full flex items-center gap-3 px-3 py-2 text-left text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors disabled:opacity-50"
              >
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div>
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