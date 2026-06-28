"use client";

import { useState } from "react";
import { X, Menu, ArrowRight, User, LogIn } from "lucide-react";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { AuthDialog } from "@/components/AuthDialog";
import { useLang } from "@/components/LangProvider";
import { LANG_LABELS, type Lang } from "@/lib/i18n";

export type PageKey =
  | "home"
  | "reports"
  | "opinions"
  | "focus-areas"
  | "approach"
  | "membership"
  | "contact"
  | "account"
  | "impressum"
  | "datenschutz"
  | "agb";

const NAV: { key: PageKey; labelKey: string }[] = [
  { key: "home", labelKey: "nav.home" },
  { key: "reports", labelKey: "nav.reports" },
  { key: "opinions", labelKey: "nav.opinions" },
  { key: "focus-areas", labelKey: "nav.focus-areas" },
  { key: "approach", labelKey: "nav.approach" },
  { key: "membership", labelKey: "nav.membership" },
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

interface Props {
  currentPage: PageKey;
  onNavigate: (page: PageKey) => void;
}

export function SiteNavigation({ currentPage, onNavigate }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: session, status } = useSession();
  const { t: tr } = useLang();
  const [authOpen, setAuthOpen] = useState(false);

  const handleNav = (key: PageKey) => {
    onNavigate(key);
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAccountClick = () => {
    if (status === "authenticated") {
      handleNav("account");
    } else {
      setAuthOpen(true);
    }
    setMobileOpen(false);
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
              className="flex items-center hover:opacity-80 transition-opacity"
            >
              <Image src="/src-logo-full.svg" alt="SRC — Security & Resilience Counsel" width={140} height={28} className="h-7 w-auto" />
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
                  {tr(item.labelKey)}
                </button>
              ))}
            </div>

            {/* Lang switcher + Account + CTA + Mobile toggle */}
            <div className="flex items-center gap-2">
              {/* Language switcher — desktop */}
              <div className="hidden md:block">
                <LangSwitcher />
              </div>

              {/* Account / Login button */}
              {status === "authenticated" ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      className="flex items-center gap-2 px-3 py-1.5 rounded-sm hover:bg-secondary/50 transition-colors"
                    >
                      <div className="h-7 w-7 rounded-full bg-[#0A2540] flex items-center justify-center">
                        <span className="text-white text-xs font-bold">
                          {(session?.user?.name || session?.user?.email || "?")[0].toUpperCase()}
                        </span>
                      </div>
                      <span className="hidden sm:block text-xs font-medium text-[#0A2540] max-w-[120px] truncate">
                        {session?.user?.name || session?.user?.email}
                      </span>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-48 p-2">
                    <button
                      onClick={handleAccountClick}
                      className="w-full text-left px-3 py-2 text-xs font-medium rounded-sm hover:bg-secondary/50 flex items-center gap-2"
                    >
                      <User className="h-3.5 w-3.5" />
                      {tr("account.title")}
                    </button>
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="w-full text-left px-3 py-2 text-xs font-medium rounded-sm hover:bg-red-50 text-[#E8272C] flex items-center gap-2"
                    >
                      <LogIn className="h-3.5 w-3.5" />
                      {tr("account.signout")}
                    </button>
                  </PopoverContent>
                </Popover>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  className="hidden sm:flex items-center gap-2 text-xs font-medium"
                  onClick={() => setAuthOpen(true)}
                >
                  <LogIn className="h-3.5 w-3.5" />
                  {tr("auth.login")}
                </Button>
              )}

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
                  {tr(item.labelKey)}
                </button>
              ))}

              {/* Account / Login in mobile menu */}
              <div className="pt-2 border-t border-border space-y-1">
                {status === "authenticated" ? (
                  <>
                    <button
                      onClick={handleAccountClick}
                      className="block w-full text-left px-3 py-2.5 text-sm font-medium rounded-sm transition-colors text-primary bg-secondary"
                    >
                      {tr("account.title")}
                    </button>
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="block w-full text-left px-3 py-2.5 text-sm font-medium rounded-sm transition-colors text-[#E8272C] hover:bg-red-50"
                    >
                      {tr("account.signout")}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      setAuthOpen(true);
                    }}
                    className="block w-full text-left px-3 py-2.5 text-sm font-medium rounded-sm transition-colors text-primary bg-secondary"
                  >
                    {tr("auth.login")}
                  </button>
                )}
              </div>

              {/* Language switcher + Member Access — mobile */}
              <div className="pt-3 border-t border-border space-y-2">
                <LangSwitcher />
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

      {/* Auth Dialog */}
      <AuthDialog
        open={authOpen}
        onOpenChange={setAuthOpen}
        onSuccess={() => {
          handleAccountClick();
        }}
      />
    </>
  );
}