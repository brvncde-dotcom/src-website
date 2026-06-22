import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SRC — Security & Resilience Counsel | D-A-CH Think Tank",
  description:
    "The leading non-partisan, fact-based think tank for the security and resilience of critical infrastructures in the D-A-CH region (Switzerland, Germany, Austria).",
  authors: [{ name: "SRC — Security & Resilience Counsel" }],
  keywords: [
    "SRC",
    "Security & Resilience Counsel",
    "think tank",
    "critical infrastructure",
    "ICT security",
    "energy security",
    "D-A-CH",
    "resilience",
    "security",
  ],
  openGraph: {
    title: "SRC — Security & Resilience Counsel",
    description:
      "The leading non-partisan think tank for critical infrastructure security and resilience in the D-A-CH region.",
    siteName: "SRC",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SRC — Security & Resilience Counsel",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}