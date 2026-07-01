import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Spectral } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { SiteShell } from "@/components/SiteShell";
import { LangProvider } from "@/components/LangProvider";
import { SearchProvider } from "@/components/SearchCommand";
import { prisma, VALID_LANGUAGES } from "@/lib/db";
import type { Lang } from "@/lib/i18n";
import { ServiceWorkerRegistrar } from "@/components/ServiceWorkerRegistrar";
import { SessionProvider } from "@/components/SessionProvider";

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

export const viewport: Viewport = {
  themeColor: "#0A2540",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

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
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SRC Advisory",
    startupImage: "/icons/icon-512x512.png",
  },
  icons: {
    icon: [
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-180x180.png", sizes: "180x180", type: "image/png" },
    ],
  },
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

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<Record<string, string | string[]>>;
}>) {
  const p = await params;
  let htmlLang = "en";

  // When serving a specific report page, drive the html lang from the report's own language.
  const id = typeof p.id === "string" ? p.id : undefined;
  if (id) {
    try {
      const report = await prisma.report.findUnique({
        where: { id },
        select: { language: true },
      });
      if (
        report?.language &&
        (VALID_LANGUAGES as readonly string[]).includes(report.language)
      ) {
        htmlLang = report.language;
      }
    } catch {
      // keep default
    }
  }

  return (
    <html lang={htmlLang} suppressHydrationWarning>
      <body
        className={`${inter.variable} ${spectral.variable} font-sans antialiased bg-background text-foreground`}
      >
        <SessionProvider>
          <LangProvider initialLang={htmlLang as Lang}>
            <SearchProvider>
              <SiteShell>{children}</SiteShell>
            </SearchProvider>
          </LangProvider>
        </SessionProvider>
        <Toaster />
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}