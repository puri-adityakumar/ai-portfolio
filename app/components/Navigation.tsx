'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { PortfolioData } from "@/types/portfolio";

interface NavigationProps {
  portfolioData: PortfolioData;
  variant?: 'header' | 'floating' | 'minimal';
  showModeToggle?: boolean;
}

export default function Navigation({ 
  portfolioData, 
  variant = 'header',
  showModeToggle = true 
}: NavigationProps) {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isHomePage = pathname === '/';
  const isPortfolioPage = pathname === '/portfolio';
  const isChatPage = pathname === '/chat';

  // Floating navigation for non-home pages
  if (variant === 'floating' && !isHomePage) {
    return (
      <nav 
        className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${
          isScrolled ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
        }`}
        aria-label="Main navigation"
      >
        <div className="glass rounded-full shadow-lg px-6 py-3 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />
          <div className="flex items-center gap-4 relative z-10">
            <Link 
              href="/"
              className="flex items-center gap-2 text-white/60 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/20 rounded-md px-2 py-1"
              aria-label="Return to homepage"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-sm font-medium">Home</span>
            </Link>
            
            <div className="w-px h-6 bg-white/20" />
            
            {!isPortfolioPage && (
              <Link 
                href="/portfolio"
                className="flex items-center gap-2 text-white/60 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/20 rounded-md px-2 py-1"
                aria-label="Navigate to portfolio page"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-sm font-medium">Portfolio</span>
              </Link>
            )}
            
            {!isChatPage && (
              <Link 
                href="/chat"
                className="flex items-center gap-2 text-white/60 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/20 rounded-md px-2 py-1"
                aria-label="Navigate to AI chat interface"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span className="text-sm font-medium">Chat</span>
              </Link>
            )}
          </div>
        </div>
      </nav>
    );
  }

  // Minimal navigation for headers
  if (variant === 'minimal') {
    return (
      <div className="flex items-center gap-3">
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/20 rounded-md px-2 py-1"
          aria-label="Return to homepage"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="hidden sm:inline text-sm">Back to Home</span>
          <span className="sm:hidden text-sm">Home</span>
        </Link>
        
        {showModeToggle && (
          <>
            {!isPortfolioPage && (
              <Link 
                href="/portfolio"
                className="text-sm text-white/60 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/20 rounded-md px-2 py-1"
                aria-label="Navigate to portfolio page"
              >
                View Portfolio
              </Link>
            )}
            
            {!isChatPage && (
              <Link 
                href="/chat"
                className="text-sm text-white/60 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/20 rounded-md px-2 py-1"
                aria-label="Navigate to AI chat interface"
              >
                Chat
              </Link>
            )}
          </>
        )}
      </div>
    );
  }

  // Default header navigation
  return (
    <nav className="glass border-b border-white/10 relative overflow-hidden" role="navigation" aria-label="Main navigation">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-indigo-500/5 opacity-50" />
      <div className="container mx-auto px-4 sm:px-6 py-4 relative z-10">
        <div className="flex items-center justify-between">
          {/* Logo/Brand */}
          <Link 
            href="/"
            className="flex items-center gap-3 text-white hover:text-white/80 transition-colors focus:outline-none focus:ring-2 focus:ring-white/20 rounded-md px-2 py-1 group"
            aria-label={`${portfolioData.profile.name} - Return to homepage`}
          >
            <div className="w-8 h-8 glass-strong rounded-lg flex items-center justify-center glow-blue group-hover:glow-purple transition-all">
              <span className="text-white font-bold text-sm">
                {portfolioData.profile.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </span>
            </div>
            <div className="hidden sm:block">
              <div className="font-semibold text-white">{portfolioData.profile.name}</div>
              <div className="text-xs text-gradient-accent">{portfolioData.profile.title}</div>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-6">
            <Link 
              href="/portfolio"
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-white/20 ${
                isPortfolioPage
                  ? 'text-white bg-white/10'
                  : 'text-white/60 hover:text-white'
              }`}
              aria-label="Navigate to portfolio page"
              aria-current={isPortfolioPage ? 'page' : undefined}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="hidden sm:inline">Portfolio</span>
            </Link>
            
            <Link 
              href="/chat"
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-white/20 ${
                isChatPage
                  ? 'text-white bg-white/10'
                  : 'text-white/60 hover:text-white'
              }`}
              aria-label="Navigate to AI chat interface"
              aria-current={isChatPage ? 'page' : undefined}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="hidden sm:inline">Chat</span>
            </Link>

            {/* Contact */}
            <a 
              href={`mailto:${portfolioData.profile.email}`}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white/60 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/20 rounded-md"
              aria-label={`Send email to ${portfolioData.profile.email}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="hidden md:inline">Contact</span>
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
