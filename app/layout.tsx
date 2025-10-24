import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getPortfolioData } from "@/lib/data";
import { generatePersonStructuredData, generateWebsiteStructuredData } from "@/lib/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const portfolioData = getPortfolioData();
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
        {children}
      </body>
    </html>
  );
}
