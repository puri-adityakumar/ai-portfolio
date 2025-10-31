import Link from "next/link";
import { Metadata } from "next";
import dynamic from "next/dynamic";
import { getPortfolioData } from "@/lib/data";
import { ExperienceItem, ProjectItem, Achievement, EducationItem } from "@/types/portfolio";
import LazyWrapper from "@/app/components/LazyWrapper";
import Navigation from "@/app/components/Navigation";

// Lazy load components for better performance
const PortfolioNavigation = dynamic(() => import("./components/PortfolioNavigation"), {
  loading: () => null,
});

const CVDownload = dynamic(() => import("./components/CVDownload"), {
  ssr: true,
});

const portfolioData = getPortfolioData();
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://localhost:3000';

export const metadata: Metadata = {
  title: `Portfolio - ${portfolioData.profile.name}`,
  description: `Explore ${portfolioData.profile.name}'s professional portfolio featuring ${portfolioData.experiences.length} work experiences, ${portfolioData.projects.length} projects, and expertise in ${portfolioData.skills.languages.join(', ')}.`,
  keywords: [
    'portfolio',
    'professional experience',
    'projects',
    'skills',
    portfolioData.profile.name,
    portfolioData.profile.title,
    ...portfolioData.skills.languages,
    ...portfolioData.skills.frameworks,
  ].join(", "),
  openGraph: {
    title: `Portfolio - ${portfolioData.profile.name}`,
    description: `Explore ${portfolioData.profile.name}'s professional portfolio featuring work experience, projects, and technical expertise.`,
    url: `${siteUrl}/portfolio`,
    type: 'profile',
    images: [
      {
        url: '/og-portfolio.jpg',
        width: 1200,
        height: 630,
        alt: `${portfolioData.profile.name}'s Professional Portfolio`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Portfolio - ${portfolioData.profile.name}`,
    description: `Explore ${portfolioData.profile.name}'s professional portfolio featuring work experience, projects, and technical expertise.`,
    images: ['/og-portfolio.jpg'],
  },
  alternates: {
    canonical: `${siteUrl}/portfolio`,
  },
};

export default function Portfolio() {
  const portfolioData = getPortfolioData();

  // Structured data for portfolio page
  const portfolioStructuredData = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "mainEntity": {
      "@type": "Person",
      "name": portfolioData.profile.name,
      "jobTitle": portfolioData.profile.title,
      "description": portfolioData.profile.bio,
      "url": `${siteUrl}/portfolio`,
      "email": portfolioData.profile.email,
      "telephone": portfolioData.profile.phone,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": portfolioData.profile.location.split(',')[0],
        "addressRegion": portfolioData.profile.location.split(',')[1]?.trim(),
        "addressCountry": portfolioData.profile.location.split(',')[2]?.trim() || "India"
      },
      "sameAs": [
        portfolioData.profile.githubUrl,
        portfolioData.profile.linkedinUrl,
      ].filter(Boolean),
      "hasOccupation": portfolioData.experiences.map(exp => ({
        "@type": "Occupation",
        "name": exp.role,
        "occupationLocation": {
          "@type": "Place",
          "name": exp.location
        },
        "estimatedSalary": {
          "@type": "MonetaryAmountDistribution",
          "name": "Competitive"
        }
      })),
      "knowsAbout": [
        ...portfolioData.skills.languages,
        ...portfolioData.skills.frameworks,
        ...portfolioData.skills.devops,
        ...portfolioData.skills.tools,
      ],
      "award": portfolioData.achievements.map(achievement => achievement.title),
      "alumniOf": portfolioData.education.map(edu => ({
        "@type": "EducationalOrganization",
        "name": edu.institution,
        "address": {
          "@type": "PostalAddress",
          "addressLocality": edu.location
        }
      }))
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(portfolioStructuredData),
        }}
      />
      <div className="min-h-screen relative">
        {/* Background gradient overlay */}
        <div className="fixed inset-0 bg-gradient-to-br from-black via-black to-black/95 pointer-events-none" />
        
        {/* Professional Header */}
        <header className="relative z-10 glass border-b border-white/10">
          <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6">
              {/* Profile Info */}
              <div className="flex-1 text-center lg:text-left">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gradient mb-2">
                  {portfolioData.profile.name}
                </h1>
                <p className="text-lg sm:text-xl lg:text-2xl text-gradient-accent mb-4 font-light">
                  {portfolioData.profile.title}
                </p>
                <p className="text-base sm:text-lg text-white/50 mb-6 max-w-2xl mx-auto lg:mx-0 font-light">
                  {portfolioData.profile.bio}
                </p>
                
                {/* Contact Information */}
                <div className="flex flex-wrap justify-center lg:justify-start gap-3 sm:gap-4 text-sm sm:text-base text-white/50">
                <div className="flex items-center gap-2 min-w-0">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="truncate">{portfolioData.profile.location}</span>
                </div>
                <a 
                  href={`mailto:${portfolioData.profile.email}`}
                  className="flex items-center gap-2 hover:text-white transition-colors min-w-0"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="truncate">{portfolioData.profile.email}</span>
                </a>
                <span className="flex items-center gap-2 min-w-0">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="truncate">{portfolioData.profile.phone}</span>
                </span>
                <a 
                  href={portfolioData.profile.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-white transition-colors"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  <span className="hidden sm:inline">GitHub</span>
                </a>
                <a 
                  href={portfolioData.profile.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-white transition-colors"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  <span className="hidden sm:inline">LinkedIn</span>
                </a>
              </div>
            </div>

            {/* Navigation and Actions */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 sm:gap-4 lg:gap-3 w-full sm:w-auto lg:w-auto">
              <Navigation 
                portfolioData={portfolioData} 
                variant="minimal" 
                showModeToggle={true}
              />
              <CVDownload portfolioData={portfolioData} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" className="relative z-10 container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-7xl" role="main">
        {/* Experience Section */}
        <section id="experience" className="mb-16" aria-labelledby="experience-heading">
          <h2 id="experience-heading" className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
            <span className="text-gradient-accent">Experience</span>
          </h2>
          <div className="space-y-6 sm:space-y-8 stagger-animation">
            {portfolioData.experiences.map((experience: ExperienceItem) => (
              <div key={experience.id} className="glass rounded-2xl p-6 card-hover-effect relative overflow-hidden group">
                {/* Gradient accent on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-1">
                      {experience.role}
                    </h3>
                    <p className="text-lg text-gradient-accent mb-2 font-medium">
                      {experience.company}
                    </p>
                    <p className="text-white/50">
                      {experience.location}
                    </p>
                  </div>
                  <div className="text-white/40 mt-2 md:mt-0">
                    <span className="inline-flex items-center gap-1 glass-strong px-3 py-1 rounded-full text-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V6a2 2 0 012-2h4a2 2 0 012 2v1m-6 0h6m-6 0l.01.01M18 7l.01.01M8 7l.01.01m-.01.01h.01m-.01 0h.01m6 0h.01M8 17v4a2 2 0 002 2h4a2 2 0 002-2v-4m-6 0V16a2 2 0 012-2h4a2 2 0 012 2v1m-6 0h6" />
                      </svg>
                      {experience.period}
                    </span>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-white/60 mb-2">Key Highlights:</h4>
                  <ul className="space-y-2">
                    {experience.highlights.map((highlight, index) => (
                      <li key={index} className="flex items-start gap-2 text-white/70">
                        <svg className="w-4 h-4 mt-0.5 text-white/50 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-white/60 mb-2">Technologies:</h4>
                  <div className="flex flex-wrap gap-2">
                    {experience.technologies.map((tech, index) => (
                      <span key={index} className="px-3 py-1 glass-strong text-white/80 rounded-full text-sm">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
   
     {/* Projects Section */}
        <section id="projects" className="mb-16" aria-labelledby="projects-heading">
          <h2 id="projects-heading" className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
            <span className="text-gradient-accent">Projects</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 stagger-animation">
            {portfolioData.projects.map((project: ProjectItem) => (
              <div key={project.id} className="glass rounded-2xl p-6 card-hover-effect relative overflow-hidden group">
                {/* Gradient accent on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                
                <div className="relative z-10 flex items-start justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white">
                    {project.name}
                  </h3>
                  {project.featured && (
                    <span className="px-2 py-1 glass-strong text-gradient-accent rounded text-xs font-medium badge">
                      Featured
                    </span>
                  )}
                </div>
                
                <p className="text-white/60 mb-4">
                  {project.description}
                </p>
                
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-white/60 mb-2">Key Highlights:</h4>
                  <ul className="space-y-1">
                    {project.highlights.map((highlight, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-white/70">
                        <svg className="w-3 h-3 mt-1 text-white/50 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-white/60 mb-2">Tech Stack:</h4>
                  <div className="flex flex-wrap gap-1">
                    {project.techStack.map((tech, index) => (
                      <span key={index} className="px-2 py-1 glass-strong text-white/80 rounded text-xs">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {project.githubUrl && (
                    <a 
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1 text-sm text-white/60 hover:text-white transition-colors"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                      GitHub
                    </a>
                  )}
                  {project.liveUrl && (
                    <a 
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1 text-sm text-white/60 hover:text-white transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Live Demo
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Skills Section */}
        <section id="skills" className="mb-16" aria-labelledby="skills-heading">
          <h2 id="skills-heading" className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
            <span className="text-gradient-accent">Skills</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="glass rounded-2xl p-6 card-hover-effect relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
              <div className="relative z-10">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-gradient-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  Languages
                </h3>
                <div className="space-y-2">
                  {portfolioData.skills.languages.map((skill, index) => (
                    <span key={index} className="block px-3 py-2 glass-strong text-white/80 rounded hover:scale-105 transition-transform">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="glass rounded-2xl p-6 card-hover-effect relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
              <div className="relative z-10">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-gradient-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Frameworks
                </h3>
                <div className="space-y-2">
                  {portfolioData.skills.frameworks.map((skill, index) => (
                    <span key={index} className="block px-3 py-2 glass-strong text-white/80 rounded hover:scale-105 transition-transform">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="glass rounded-2xl p-6 card-hover-effect relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
              <div className="relative z-10">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-gradient-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                  </svg>
                  DevOps & Cloud
                </h3>
                <div className="space-y-2">
                  {portfolioData.skills.devops.map((skill, index) => (
                    <span key={index} className="block px-3 py-2 glass-strong text-white/80 rounded hover:scale-105 transition-transform">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="glass rounded-2xl p-6 card-hover-effect relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
              <div className="relative z-10">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-gradient-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Tools
                </h3>
                <div className="space-y-2">
                  {portfolioData.skills.tools.map((skill, index) => (
                    <span key={index} className="block px-3 py-2 glass-strong text-white/80 rounded hover:scale-105 transition-transform">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Education Section */}
        <section id="education" className="mb-16" aria-labelledby="education-heading">
          <h2 id="education-heading" className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
            <span className="text-gradient-accent">Education</span>
          </h2>
          <div className="space-y-6">
            {portfolioData.education.map((education: EducationItem) => (
              <div key={education.id} className="glass rounded-2xl p-6 card-hover-effect relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-start md:justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-1">
                      {education.degree}
                    </h3>
                    <p className="text-lg text-gradient-accent mb-2 font-medium">
                      {education.field}
                    </p>
                    <p className="text-white/60 mb-1">
                      {education.institution}
                    </p>
                    <p className="text-white/50">
                      {education.location}
                    </p>
                  </div>
                  <div className="text-white/40 mt-2 md:mt-0">
                    <span className="inline-flex items-center gap-1 glass-strong px-3 py-1 rounded-full text-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V6a2 2 0 012-2h4a2 2 0 012 2v1m-6 0h6m-6 0l.01.01M18 7l.01.01M8 7l.01.01m-.01.01h.01m-.01 0h.01m6 0h.01M8 17v4a2 2 0 002 2h4a2 2 0 002-2v-4m-6 0V16a2 2 0 012-2h4a2 2 0 012 2v1m-6 0h6" />
                      </svg>
                      {education.period}
                      {education.current && (
                        <span className="ml-2 px-2 py-1 glass-strong text-gradient-accent rounded text-xs font-medium badge">
                          Current
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Achievements Section */}
        <section id="achievements" className="mb-16" aria-labelledby="achievements-heading">
          <h2 id="achievements-heading" className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
            <span className="text-gradient-accent">Achievements</span>
          </h2>
          <div className="space-y-6">
            {portfolioData.achievements.map((achievement: Achievement) => (
              <div key={achievement.id} className="glass rounded-2xl p-6 card-hover-effect relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-start md:justify-between">
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 glass-strong rounded-full flex items-center justify-center flex-shrink-0 mt-1 glow-purple">
                        <svg className="w-4 h-4 text-gradient-accent" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-1">
                          {achievement.title}
                        </h3>
                        <p className="text-lg text-gradient-accent mb-2 font-medium">
                          {achievement.organization}
                        </p>
                        <p className="text-white/60 mb-2">
                          {achievement.description}
                        </p>
                        <span className="inline-flex items-center px-3 py-1 glass-strong text-white/80 rounded-full text-sm badge">
                          {achievement.category}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-white/40 mt-2 md:mt-0">
                    <span className="inline-flex items-center gap-1 glass-strong px-3 py-1 rounded-full text-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V6a2 2 0 012-2h4a2 2 0 012 2v1m-6 0h6m-6 0l.01.01M18 7l.01.01M8 7l.01.01m-.01.01h.01m-.01 0h.01m6 0h.01M8 17v4a2 2 0 002 2h4a2 2 0 002-2v-4m-6 0V16a2 2 0 012-2h4a2 2 0 012 2v1m-6 0h6" />
                      </svg>
                      {achievement.date}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Portfolio Navigation */}
      <PortfolioNavigation />
      
      {/* Floating Navigation */}
      <Navigation 
        portfolioData={portfolioData} 
        variant="floating" 
      />
      </div>
    </>
  );
}