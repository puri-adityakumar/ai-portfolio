import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getPortfolioData } from "@/lib/data";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const portfolioData = getPortfolioData();

export const metadata: Metadata = {
  title: `${portfolioData.profile.name} - ${portfolioData.profile.title}`,
  description: portfolioData.profile.bio,
  keywords: [
    portfolioData.profile.name,
    portfolioData.profile.title,
    ...portfolioData.skills.languages,
    ...portfolioData.skills.frameworks,
  ].join(", "),
  authors: [{ name: portfolioData.profile.name }],
  creator: portfolioData.profile.name,
  openGraph: {
    title: `${portfolioData.profile.name} - ${portfolioData.profile.title}`,
    description: portfolioData.profile.bio,
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${portfolioData.profile.name} - ${portfolioData.profile.title}`,
    description: portfolioData.profile.bio,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
