import { PortfolioData } from '@/types/portfolio';

export function generatePersonStructuredData(portfolioData: PortfolioData, siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": portfolioData.profile.name,
    "jobTitle": portfolioData.profile.title,
    "description": portfolioData.profile.bio,
    "url": siteUrl,
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
    "knowsAbout": [
      ...portfolioData.skills.languages,
      ...portfolioData.skills.frameworks,
      ...portfolioData.skills.devops,
      ...portfolioData.skills.tools,
    ],
    "alumniOf": portfolioData.education.map(edu => ({
      "@type": "EducationalOrganization",
      "name": edu.institution,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": edu.location
      }
    })),
    "worksFor": portfolioData.experiences.map(exp => ({
      "@type": "Organization",
      "name": exp.company,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": exp.location
      }
    })),
    "hasCredential": portfolioData.achievements.map(achievement => ({
      "@type": "EducationalOccupationalCredential",
      "name": achievement.title,
      "credentialCategory": achievement.category,
      "recognizedBy": {
        "@type": "Organization",
        "name": achievement.organization
      },
      "dateCreated": achievement.date
    }))
  };
}

export function generateWebsiteStructuredData(portfolioData: PortfolioData, siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": `${portfolioData.profile.name} - Portfolio`,
    "description": portfolioData.profile.bio,
    "url": siteUrl,
    "author": {
      "@type": "Person",
      "name": portfolioData.profile.name,
      "jobTitle": portfolioData.profile.title,
      "email": portfolioData.profile.email,
      "url": siteUrl
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${siteUrl}/chat?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };
}

export function generateBreadcrumbStructuredData(items: Array<{name: string, url: string}>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
}

export function generateProjectStructuredData(portfolioData: PortfolioData, siteUrl: string) {
  return portfolioData.projects.map(project => ({
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "name": project.name,
    "description": project.description,
    "creator": {
      "@type": "Person",
      "name": portfolioData.profile.name,
      "jobTitle": portfolioData.profile.title
    },
    "keywords": project.techStack.join(', '),
    "url": project.liveUrl || project.githubUrl,
    "dateCreated": new Date().getFullYear().toString(), // Fallback since projects don't have dates
    "programmingLanguage": project.techStack.filter(tech => 
      portfolioData.skills.languages.includes(tech)
    ),
    "applicationCategory": "WebApplication"
  }));
}

export function generateOrganizationStructuredData(portfolioData: PortfolioData) {
  return portfolioData.experiences.map(exp => ({
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": exp.company,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": exp.location
    },
    "employee": {
      "@type": "Person",
      "name": portfolioData.profile.name,
      "jobTitle": exp.role,
      "startDate": exp.startDate,
      "endDate": exp.current ? undefined : exp.endDate
    }
  }));
}

export function generateMetaKeywords(portfolioData: PortfolioData, additionalKeywords: string[] = []) {
  const baseKeywords = [
    portfolioData.profile.name,
    portfolioData.profile.title,
    'software engineer',
    'developer',
    'portfolio',
    'resume',
    'professional',
  ];

  const skillKeywords = [
    ...portfolioData.skills.languages,
    ...portfolioData.skills.frameworks,
    ...portfolioData.skills.devops.slice(0, 5), // Limit to avoid too many keywords
  ];

  return [...baseKeywords, ...skillKeywords, ...additionalKeywords]
    .filter((keyword, index, array) => array.indexOf(keyword) === index) // Remove duplicates
    .join(', ');
}