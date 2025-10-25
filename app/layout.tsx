import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getPortfolioData } from "@/lib/data";
import { generatePersonStructuredData, generateWebsiteStructuredData } from "@/lib/seo";
import ErrorBoundary from "@/app/components/ErrorBoundary";
import UserFlowTest from "@/app/components/UserFlowTest";
import ResponsiveTest from "@/app/components/ResponsiveTest";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Load portfolio data with error handling
let portfolioData;
try {
  portfolioData = getPortfolioData();
} catch (error) {
  console.error('Failed to load portfolio data in layout:', error);
  // Use minimal fallback data for metadata
  portfolioData = {
    profile: {
      name: 'Portfolio',
      title: 'Professional Portfolio',
      bio: 'Professional portfolio website',
      email: 'contact@example.com',
      phone: '',
      github: '',
      githubUrl: '#',
      linkedin: '',
      linkedinUrl: '#',
      location: ''
    },
    skills: { languages: [], frameworks: [], devops: [], tools: [] },
    experiences: [],
    projects: [],
    achievements: [],
    education: []
  };
}
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${portfolioData.profile.name} - ${portfolioData.profile.title}`,
    template: `%s | ${portfolioData.profile.name}`,
  },
  description: portfolioData.profile.bio,
  keywords: [
    portfolioData.profile.name,
    portfolioData.profile.title,
    'software engineer',
    'full-stack developer',
    'AI/ML engineer',
    'portfolio',
    'resume',
    ...portfolioData.skills.languages,
    ...portfolioData.skills.frameworks,
    ...portfolioData.skills.devops,
  ].join(", "),
  authors: [{ name: portfolioData.profile.name, url: siteUrl }],
  creator: portfolioData.profile.name,
  publisher: portfolioData.profile.name,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: `${portfolioData.profile.name} - Portfolio`,
    title: `${portfolioData.profile.name} - ${portfolioData.profile.title}`,
    description: portfolioData.profile.bio,
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: `${portfolioData.profile.name} - ${portfolioData.profile.title}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${portfolioData.profile.name} - ${portfolioData.profile.title}`,
    description: portfolioData.profile.bio,
    images: ['/og-image.jpg'],
    creator: portfolioData.profile.linkedin ? `@${portfolioData.profile.linkedin}` : undefined,
  },
  alternates: {
    canonical: siteUrl,
  },
  category: 'technology',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const personStructuredData = generatePersonStructuredData(portfolioData, siteUrl);
  const websiteStructuredData = generateWebsiteStructuredData(portfolioData, siteUrl);

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(personStructuredData),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteStructuredData),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 px-4 py-2 bg-blue-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Skip to main content
        </a>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
        <UserFlowTest />
        <ResponsiveTest />
      </body>
    </html>
  );
}
