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
    <div className="min-h-screen relative overflow-hidden">
      {/* Enhanced background gradient overlay with animated gradients */}
      <div className="fixed inset-0 bg-gradient-to-br from-black via-black to-black/95 pointer-events-none" />
      
      {/* Animated gradient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" style={{ animation: 'pulse 8s infinite, orb-float 20s infinite' }} />
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" style={{ animation: 'pulse 10s infinite 2s, orb-float 25s infinite 5s' }} />
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" style={{ animation: 'pulse 12s infinite 4s, orb-float 30s infinite 10s' }} />
      </div>

      {/* Chat Interface */}
      <main id="main-content" className="relative z-10 container mx-auto max-w-3xl md:max-w-4xl" style={{ height: '100vh' }} role="main">
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