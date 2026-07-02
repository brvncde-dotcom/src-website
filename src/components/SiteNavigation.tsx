"use client";

import { useState, useEffect } from "react";
import { X, Menu, User, LogIn, Shield, Search, ChevronDown, Globe, HelpCircle, Bell } from "lucide-react";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { AuthDialog } from "@/components/AuthDialog";
import { useSearch } from "@/components/SearchCommand";
import { useLang } from "@/components/LangProvider";
import { LANG_LABELS, type Lang } from "@/lib/i18n";

export type PageKey =
  | "home"
  | "brief"
  | "reports"
  | "opinions"
  | "focus-areas"
  | "approach"
  | "membership"
  | "contact"
  | "help"
  | "account"
  | "impressum"
  | "datenschutz"
  | "agb";

const NAV_MAIN: { key: PageKey; labelKey: string }[] = [
  { key: "brief", labelKey: "nav.brief" },
  { key: "opinions", labelKey: "nav.opinions" },
  { key: "reports", labelKey: "nav.reports" },
];

const NAV_ABOUT: { key: PageKey; labelKey: string }[] = [
  { key: "focus-areas", labelKey: "nav.focus-areas" },
  { key: "membership", labelKey: "nav.membership" },
];

const ALL_LANGS: Lang[] = ["en", "de", "fr", "it"];

function LangSwitcher() {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="flex items-center gap-1 px-2 py-1.5 rounded-sm border border-border text-[11px] font-bold tracking-wide text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
          aria-label="Select language"
        >
          <Globe className="h-3 w-3" />
          {lang.toUpperCase()}
          <ChevronDown className="h-2.5 w-2.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-20 p-1">
        <div className="flex flex-col gap-0.5">
          {ALL_LANGS.map((l) => (
            <button
              key={l}
              onClick={() => { setLang(l); setOpen(false); }}
              className={`w-full text-left px-2.5 py-1.5 text-xs font-bold tracking-wide rounded-sm transition-colors ${
                lang === l
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-primary hover:bg-secondary/50"
              }`}
            >
              {LANG_LABELS[l]}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

interface Props {
  currentPage: PageKey;
  onNavigate: (page: PageKey) => void;
}

export function SiteNavigation({ currentPage, onNavigate }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const { data: session, status } = useSession();
  const { t: tr } = useLang();
  const { open: openSearch } = useSearch();
  const [authOpen, setAuthOpen] = useState(false);
  const [unreadMonitors, setUnreadMonitors] = useState(0);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/monitors/matches?countOnly=true")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d?.unread) setUnreadMonitors(d.unread); })
      .catch(() => {});
  }, [status]);

  const handleNav = (key: PageKey) => {
    onNavigate(key);
    setMobileOpen(false);
    setAboutOpen(false);
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

  const isAboutActive = currentPage === "focus-areas" || currentPage === "membership";

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-border">
        {/* Swiss red top stripe */}
        <div className="h-[3px] bg-[#E8272C]" />

        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-28 gap-4">
            {/* Logo — bigger, acts as HOME */}
            <button
              onClick={() => handleNav("home")}
              className="flex items-center hover:opacity-80 transition-opacity flex-shrink-0"
            >
              <Image
                src="/src-logo-full.svg"
                alt="SRC — Security & Resilience Counsel"
                width={440}
                height={88}
                className="h-[88px] w-auto"
              />
            </button>

            {/* Desktop nav — left-aligned after logo */}
            <div className="hidden lg:flex items-center gap-1">
              {NAV_MAIN.map((item) => (
                <button
                  key={item.key}
                  onClick={() => handleNav(item.key)}
                  className={`px-4 py-2.5 text-base tracking-wide uppercase font-medium transition-colors rounded-sm ${
                    currentPage === item.key
                      ? "text-primary bg-secondary"
                      : "text-muted-foreground hover:text-primary hover:bg-secondary/50"
                  }`}
                >
                  {tr(item.labelKey)}
                </button>
              ))}

              {/* About SRC dropdown */}
              <Popover open={aboutOpen} onOpenChange={setAboutOpen}>
                <PopoverTrigger asChild>
                  <button
                    className={`flex items-center gap-1 px-4 py-2.5 text-base tracking-wide uppercase font-medium rounded-sm transition-colors ${
                      isAboutActive
                        ? "text-primary bg-secondary"
                        : "text-muted-foreground hover:text-primary hover:bg-secondary/50"
                    }`}
                  >
                    {tr("nav.about")}
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-48 p-1">
                  {NAV_ABOUT.map((item) => (
                    <button
                      key={item.key}
                      onClick={() => handleNav(item.key)}
                      className={`w-full text-left px-3 py-2.5 text-sm font-medium rounded-sm transition-colors ${
                        currentPage === item.key
                          ? "text-primary bg-secondary"
                          : "text-muted-foreground hover:text-primary hover:bg-secondary/50"
                      }`}
                    >
                      {tr(item.labelKey)}
                    </button>
                  ))}
                </PopoverContent>
              </Popover>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Right cluster: search + lang + account + mobile toggle */}
            <div className="flex items-center gap-2">
              {/* Search — icon button, left of the language selector */}
              <button
                onClick={openSearch}
                className="flex items-center justify-center h-9 w-9 rounded-sm text-muted-foreground hover:text-primary hover:bg-secondary/50 transition-colors"
                aria-label={tr("search.title")}
                title={tr("search.title")}
              >
                <Search className="h-5 w-5" />
              </button>

              {/* Language switcher — compact dropdown, desktop only */}
              <div className="hidden lg:block">
                <LangSwitcher />
              </div>

              {/* Account / Login */}
              {status === "authenticated" ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      className="flex items-center p-0.5 rounded-full hover:opacity-80 transition-opacity"
                      aria-label="Account"
                    >
                      {session?.user?.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={session.user.image}
                          alt={session?.user?.name || "Account"}
                          className="h-[88px] w-[88px] rounded-full object-cover border border-border"
                        />
                      ) : (
                        <div className="h-[88px] w-[88px] rounded-full bg-[#0A2540] flex items-center justify-center">
                          <span className="text-white text-3xl font-bold">
                            {(session?.user?.name || session?.user?.email || "?")[0].toUpperCase()}
                          </span>
                        </div>
                      )}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-52 p-2">
                    <div className="px-3 py-2 text-xs text-muted-foreground border-b border-border mb-1 truncate">
                      {session?.user?.name || session?.user?.email}
                    </div>
                    <button
                      onClick={handleAccountClick}
                      className="w-full text-left px-3 py-2 text-xs font-medium rounded-sm hover:bg-secondary/50 flex items-center gap-2"
                    >
                      <User className="h-3.5 w-3.5" />
                      {tr("account.title")}
                    </button>
                    {(session?.user as { isAdmin?: boolean } | undefined)?.isAdmin && (
                      <a
                        href="/admin"
                        className="block w-full text-left px-3 py-2 text-xs font-semibold rounded-sm hover:bg-secondary/50 flex items-center gap-2 text-[#0A2540]"
                      >
                        <Shield className="h-3.5 w-3.5" />
                        {tr("account.admin")}
                      </a>
                    )}
                    <a
                      href="/monitors"
                      className="w-full text-left px-3 py-2 text-xs font-medium rounded-sm hover:bg-secondary/50 flex items-center gap-2"
                    >
                      <Bell className="h-3.5 w-3.5" />
                      {tr("nav.monitors")}
                      {unreadMonitors > 0 && (
                        <span className="ml-auto bg-[#E8272C] text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none">
                          {unreadMonitors > 99 ? "99+" : unreadMonitors}
                        </span>
                      )}
                    </a>
                    <a
                      href="/help"
                      className="w-full text-left px-3 py-2 text-xs font-medium rounded-sm hover:bg-secondary/50 flex items-center gap-2"
                    >
                      <HelpCircle className="h-3.5 w-3.5" />
                      {tr("nav.help")}
                    </a>
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="w-full text-left px-3 py-2 text-xs font-medium rounded-sm hover:bg-red-50 text-[#E8272C] flex items-center gap-2"
                    >
                      <LogIn className="h-3.5 w-3.5 rotate-180" />
                      {tr("account.signout")}
                    </button>
                  </PopoverContent>
                </Popover>
              ) : (
                <button
                  onClick={() => setAuthOpen(true)}
                  className="p-2 rounded-sm hover:bg-secondary/50 transition-colors text-muted-foreground hover:text-primary"
                  aria-label={tr("auth.login")}
                  title={tr("auth.login")}
                >
                  <User className="h-5 w-5" />
                </button>
              )}

              {/* Mobile hamburger */}
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
              {/* Search first on mobile */}
              <button
                onClick={() => { openSearch(); setMobileOpen(false); }}
                className="flex items-center gap-2 w-full text-left px-3 py-2.5 text-sm font-medium rounded-sm text-muted-foreground hover:text-primary hover:bg-secondary/50 transition-colors"
              >
                <Search className="h-4 w-4" />
                {tr("search.title")}
              </button>

              {NAV_MAIN.map((item) => (
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

              {/* About SRC group */}
              <div className="pt-1">
                <div className="px-3 py-1.5 text-[10px] uppercase tracking-widest font-semibold text-muted-foreground/60">
                  {tr("nav.about")}
                </div>
                {NAV_ABOUT.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => handleNav(item.key)}
                    className={`block w-full text-left px-5 py-2 text-sm font-medium rounded-sm transition-colors ${
                      currentPage === item.key
                        ? "text-primary bg-secondary"
                        : "text-muted-foreground hover:text-primary hover:bg-secondary/50"
                    }`}
                  >
                    {tr(item.labelKey)}
                  </button>
                ))}
              </div>

              {/* Account / Login */}
              <div className="pt-2 border-t border-border space-y-1">
                {status === "authenticated" ? (
                  <>
                    <div className="px-3 py-2 text-xs text-muted-foreground truncate">
                      {session?.user?.name || session?.user?.email}
                    </div>
                    <button
                      onClick={handleAccountClick}
                      className="block w-full text-left px-3 py-2.5 text-sm font-medium rounded-sm transition-colors text-primary bg-secondary"
                    >
                      {tr("account.title")}
                    </button>
                    {(session?.user as { isAdmin?: boolean } | undefined)?.isAdmin && (
                      <a
                        href="/admin"
                        className="block w-full text-left px-3 py-2.5 text-sm font-semibold rounded-sm transition-colors text-[#0A2540] hover:bg-secondary"
                      >
                        {tr("account.admin")}
                      </a>
                    )}
                    <a
                      href="/monitors"
                      className="flex items-center gap-2 w-full text-left px-3 py-2.5 text-sm font-medium rounded-sm transition-colors text-muted-foreground hover:text-primary hover:bg-secondary/50"
                    >
                      <Bell className="h-4 w-4" />
                      {tr("nav.monitors")}
                      {unreadMonitors > 0 && (
                        <span className="ml-1 bg-[#E8272C] text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none">
                          {unreadMonitors > 99 ? "99+" : unreadMonitors}
                        </span>
                      )}
                    </a>
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="block w-full text-left px-3 py-2.5 text-sm font-medium rounded-sm transition-colors text-[#E8272C] hover:bg-red-50"
                    >
                      {tr("account.signout")}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => { setMobileOpen(false); setAuthOpen(true); }}
                    className="flex items-center gap-2 w-full text-left px-3 py-2.5 text-sm font-medium rounded-sm transition-colors text-primary bg-secondary"
                  >
                    <User className="h-4 w-4" />
                    {tr("auth.login")}
                  </button>
                )}
              </div>

              {/* Language switcher — mobile */}
              <div className="pt-3 border-t border-border">
                <LangSwitcher />
              </div>
            </div>
          </div>
        )}
      </header>

      <AuthDialog
        open={authOpen}
        onOpenChange={setAuthOpen}
        onSuccess={() => { handleNav("account"); }}
      />
    </>
  );
}
