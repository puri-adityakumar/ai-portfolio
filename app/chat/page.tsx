import Link from "next/link";
import { Metadata } from "next";
import { getPortfolioData } from "@/lib/data";
import ChatInterface from "./components/ChatInterface";
import Navigation from "@/app/components/Navigation";

const portfolioData = getPortfolioData();
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://localhost:3000';

export const metadata: Metadata = {
  title: `Chat with AI - ${portfolioData.profile.name}`,
  description: `Have a natural conversation with an AI assistant about ${portfolioData.profile.name}'s professional experience, projects, and skills. Get instant answers to your questions.`,
  keywords: [
    'AI chat',
    'portfolio assistant',
    'interactive resume',
    'AI conversation',
    portfolioData.profile.name,
    portfolioData.profile.title,
    ...portfolioData.skills.languages.slice(0, 5), // Limit keywords
  ].join(", "),
  openGraph: {
    title: `Chat with AI - ${portfolioData.profile.name}`,
    description: `Have a natural conversation about ${portfolioData.profile.name}'s professional background through an AI-powered chat interface.`,
    url: `${siteUrl}/chat`,
    type: 'website',
    images: [
      {
        url: '/og-chat.jpg',
        width: 1200,
        height: 630,
        alt: `Chat with AI about ${portfolioData.profile.name}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Chat with AI - ${portfolioData.profile.name}`,
    description: `Have a natural conversation about ${portfolioData.profile.name}'s professional background through an AI-powered chat interface.`,
    images: ['/og-chat.jpg'],
  },
  alternates: {
    canonical: `${siteUrl}/chat`,
  },
};

export default function Chat() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Navigation Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4" role="banner">
        <div className="container mx-auto flex items-center justify-between">
          <Navigation 
            portfolioData={portfolioData} 
            variant="minimal" 
            showModeToggle={true}
          />
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
            Chat with AI
          </h1>
          <div className="w-24" /> {/* Spacer for balance */}
        </div>
      </header>

      {/* Chat Interface */}
      <main id="main-content" className="container mx-auto max-w-4xl" style={{ height: 'calc(100vh - 80px)' }} role="main">
        <ChatInterface portfolioData={portfolioData} />
      </main>
      
      {/* Floating Navigation */}
      <Navigation 
        portfolioData={portfolioData} 
        variant="floating" 
      />
    </div>
  );
}