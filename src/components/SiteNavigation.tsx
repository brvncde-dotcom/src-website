"use client";

import { useState } from "react";
import { X, Menu, ArrowRight, Globe } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useLang } from "./LangProvider";
import { LANG_LABELS, type Lang } from "@/lib/i18n";
import { useNavigation } from "./NavigationProvider";

export type PageKey = "home" | "reports" | "opinions" | "focus-areas" | "approach" | "contact";

const NAV_KEYS: { key: PageKey; labelKey: string }[] = [
  { key: "home", labelKey: "nav.home" },
  { key: "reports", labelKey: "nav.reports" },
  { key: "opinions", labelKey: "nav.opinions" },
  { key: "focus-areas", labelKey: "nav.focus-areas" },
  { key: "approach", labelKey: "nav.approach" },
  { key: "contact", labelKey: "nav.contact" },
];

const ALL_LANGS: Lang[] = ["en", "de", "fr", "it"];

function LangSwitcher() {
  const { lang, setLang } = useLang();
  return (
    <div className="flex items-center gap-0.5 border border-border rounded-sm overflow-hidden">
      {ALL_LANGS.map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={`px-1.5 py-1 text-[10px] font-bold tracking-wide transition-colors ${
            lang === l
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-primary hover:bg-secondary/50"
          }`}
        >
          {LANG_LABELS[l]}
        </button>
      ))}
    </div>
  );
}

export function SiteNavigation() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t: tr } = useLang();
  const { currentPage, navigate } = useNavigation();

  const handleNav = (key: PageKey) => {
    navigate(key);
    setMobileOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-border">
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
              {NAV_KEYS.map((item) => (
                <button
                  key={item.key}
                  onClick={() => handleNav(item.key)}
                  className={`px-3 py-2 text-xs tracking-wide uppercase font-medium transition-colors rounded-sm ${
                    currentPage === item.key
                      ? "text-primary bg-secondary"
                      : "text-muted-foreground hover:text-primary hover:bg-secondary/50"
                  }`}
                >
                  {tr(item.labelKey)}
                </button>
              ))}
            </div>

            {/* Lang switcher + CTA + Mobile toggle */}
            <div className="flex items-center gap-2">
              <div className="hidden md:block">
                <LangSwitcher />
              </div>
              <Button
                size="sm"
                variant="outline"
                className="hidden sm:flex items-center gap-2 text-xs tracking-wide"
                onClick={() => handleNav("reports")}
              >
                {tr("nav.member-access")}
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
              {NAV_KEYS.map((item) => (
                <button
                  key={item.key}
                  onClick={() => handleNav(item.key)}
                  className={`block w-full text-left px-3 py-2.5 text-sm font-medium rounded-sm transition-colors ${
                    currentPage === item.key
                      ? "text-primary bg-secondary"
                      : "text-muted-foreground hover:text-primary hover:bg-secondary/50"
                  }`}
                >
                  {tr(item.labelKey)}
                </button>
              ))}
              <div className="pt-3 border-t border-border">
                <div className="mb-2">
                  <LangSwitcher />
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2 text-xs"
                  onClick={() => handleNav("reports")}
                >
                  {tr("nav.member-access")}
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