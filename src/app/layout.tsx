import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Spectral } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { SiteShell } from "@/components/SiteShell";
import { LangProvider } from "@/components/LangProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const spectral = Spectral({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "SRC — Security & Resilience Counsel | Global Think Tank",
  description:
    "The leading non-partisan, fact-based think tank for global security and resilience — independent analysis grounded in Swiss neutrality.",
  authors: [{ name: "SRC — Security & Resilience Counsel" }],
  keywords: [
    "SRC",
    "Security & Resilience Counsel",
    "think tank",
    "global security",
    "geopolitics",
    "energy security",
    "AI governance",
    "resilience",
    "Swiss think tank",
    "independent analysis",
  ],
  openGraph: {
    title: "SRC — Security & Resilience Counsel",
    description:
      "Independent, global analysis on security, resilience, and geopolitics — grounded in Swiss neutrality.",
    siteName: "SRC",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SRC — Security & Resilience Counsel",
    description:
      "Independent, global analysis on security, resilience, and geopolitics — grounded in Swiss neutrality.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${spectral.variable} font-sans antialiased bg-background text-foreground`}
      >
        <LangProvider>
          <SiteShell>{children}</SiteShell>
        </LangProvider>
        <Toaster />
      </body>
    </html>
  );
}