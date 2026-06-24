"use client";

import { useState } from "react";
import { X, Menu, ArrowRight } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export type PageKey = "home" | "reports" | "opinions" | "focus-areas" | "approach" | "contact";

const NAV: { key: PageKey; label: string }[] = [
  { key: "home", label: "Home" },
  { key: "reports", label: "Reports" },
  { key: "opinions", label: "Opinions" },
  { key: "focus-areas", label: "Focus Areas" },
  { key: "approach", label: "Approach" },
  { key: "contact", label: "Contact" },
];

interface Props {
  currentPage: PageKey;
  onNavigate: (page: PageKey) => void;
}

export function SiteNavigation({ currentPage, onNavigate }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNav = (key: PageKey) => {
    onNavigate(key);
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-border">
        {/* Swiss red top stripe */}
        <div className="h-[3px] bg-[#E8272C]" />

        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <button
              onClick={() => handleNav("home")}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <Image
                src="/src-logo.png"
                alt="SRC Logo"
                width={36}
                height={36}
                className="rounded-full"
              />
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-bold tracking-[0.15em] text-primary">SRC</span>
                <span className="text-[10px] tracking-[0.08em] text-muted-foreground hidden sm:block">
                  Security & Resilience Counsel
                </span>
              </div>
            </button>

            {/* Desktop nav */}
            <div className="hidden lg:flex items-center gap-1">
              {NAV.map((item) => (
                <button
                  key={item.key}
                  onClick={() => handleNav(item.key)}
                  className={`px-3 py-2 text-xs tracking-wide uppercase font-medium transition-colors rounded-sm ${
                    currentPage === item.key
                      ? "text-primary bg-secondary"
                      : "text-muted-foreground hover:text-primary hover:bg-secondary/50"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* CTA + Mobile toggle */}
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                variant="outline"
                className="hidden sm:flex items-center gap-2 text-xs tracking-wide"
                onClick={() => handleNav("reports")}
              >
                Member Access
                <ArrowRight className="w-3 h-3" />
              </Button>
              <button
                className="lg:hidden p-2 hover:bg-secondary rounded-sm transition-colors"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-border bg-white">
            <div className="px-4 py-3 space-y-1">
              {NAV.map((item) => (
                <button
                  key={item.key}
                  onClick={() => handleNav(item.key)}
                  className={`block w-full text-left px-3 py-2.5 text-sm font-medium rounded-sm transition-colors ${
                    currentPage === item.key
                      ? "text-primary bg-secondary"
                      : "text-muted-foreground hover:text-primary hover:bg-secondary/50"
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <div className="pt-2 border-t border-border">
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2 text-xs"
                  onClick={() => handleNav("reports")}
                >
                  Member Access
                  <ArrowRight className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}