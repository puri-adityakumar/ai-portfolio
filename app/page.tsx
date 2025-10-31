import Link from "next/link";
import { getPortfolioData } from "@/lib/data";
import { HiChatBubbleLeftRight } from "react-icons/hi2";
import { FaFileAlt } from "react-icons/fa";

export default function Home() {
  const portfolioData = getPortfolioData();

  return (
    <div className="min-h-screen relative overflow-hidden w-full max-w-full">
      {/* Background gradient overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-black via-black to-black/95 pointer-events-none" />

      {/* Animated gradient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" style={{ animation: 'pulse 8s infinite, orb-float 20s infinite' }} />
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" style={{ animation: 'pulse 10s infinite 2s, orb-float 25s infinite 5s' }} />
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" style={{ animation: 'pulse 12s infinite 4s, orb-float 30s infinite 10s' }} />
      </div>

      <main id="main-content" className="relative z-10 container mx-auto px-4 sm:px-6 py-12 sm:py-20 min-h-screen flex flex-col justify-center overflow-x-hidden" role="main">
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-16 w-full">
          <div className="mb-16 animate-fade-in">
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-8 tracking-tight text-white break-words">
              Aditya Kumar Puri
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-white/70 max-w-3xl mx-auto leading-relaxed px-4 font-light">
              Experienced full-stack developer specializing in building scalable AI/ML systems, implementing advanced RAG architectures, orchestrating complex multi-agent workflows, and designing robust cloud infrastructure across AWS and Azure with expertise in microservices, containerization, and CI/CD pipelines
            </p>
          </div>

          {/* Mode Selection */}
          <div className="mb-14 animate-slide-up">
            <div className="flex flex-col sm:flex-row gap-6 max-w-2xl mx-auto justify-center items-center px-4">
              {/* Chat Mode */}
              <Link
                href="/chat"
                className="group glass-card-blue rounded-3xl py-8 px-12 focus:outline-none focus:ring-2 focus:ring-blue-500/50 relative overflow-hidden transition-all duration-300 w-full sm:w-auto min-w-[280px]"
                aria-label="Chat with AI about my background"
                prefetch={true}
              >
                {/* Red gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 via-red-600/15 to-red-700/10 rounded-3xl transition-opacity duration-300 opacity-0 group-hover:opacity-100 pointer-events-none"></div>
                <div className="flex flex-col items-center gap-3 relative z-10">
                  <div className="w-12 h-12 glass-strong rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <HiChatBubbleLeftRight className="w-6 h-6 text-white/90" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-normal text-white mb-1">
                      Chat with AI
                    </h3>
                    <p className="text-xs text-white/60">
                      Interactive conversation about my work
                    </p>
                  </div>
                </div>
              </Link>

              {/* Portfolio Mode */}
              <Link
                href="/portfolio"
                className="group glass-card-red rounded-3xl py-8 px-12 focus:outline-none focus:ring-2 focus:ring-blue-500/50 relative overflow-hidden transition-all duration-300 w-full sm:w-auto min-w-[280px]"
                aria-label="View my portfolio"
                prefetch={true}
              >
                {/* Blue gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-blue-600/15 to-blue-700/10 rounded-3xl transition-opacity duration-300 opacity-0 group-hover:opacity-100 pointer-events-none"></div>
                <div className="flex flex-col items-center gap-3 relative z-10">
                  <div className="w-12 h-12 glass-strong rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <FaFileAlt className="w-6 h-6 text-white/90" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-normal text-white mb-1">
                      View Portfolio
                    </h3>
                    <p className="text-xs text-white/60">
                      Browse experience, projects & achievements
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div className="animate-fade-in-delayed">
            <div className="flex flex-wrap justify-center gap-6 text-white/60">
              <a
                href={`mailto:${portfolioData.profile.email}`}
                className="flex items-center gap-2 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/20 rounded-md px-3 py-2 link-underline group"
                aria-label={`Email ${portfolioData.profile.email}`}
              >
                <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-sm">{portfolioData.profile.email}</span>
              </a>
              <a
                href={portfolioData.profile.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/20 rounded-md px-3 py-2 link-underline group"
                aria-label="GitHub profile"
              >
                <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                <span className="text-sm">GitHub</span>
              </a>
              <a
                href={portfolioData.profile.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/20 rounded-md px-3 py-2 link-underline group"
                aria-label="LinkedIn profile"
              >
                <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                <span className="text-sm">LinkedIn</span>
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
