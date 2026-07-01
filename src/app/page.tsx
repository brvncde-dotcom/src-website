"use client";

import { useState } from "react";
import { SiteNavigation, type PageKey } from "@/components/SiteNavigation";
import { NavigationProvider } from "@/components/NavigationProvider";
import { HomeView } from "@/components/HomeView";
import { ReportsView } from "@/components/ReportsView";
import { DailyBriefView } from "@/components/DailyBriefView";
import { OpinionsView } from "@/components/OpinionsView";
import { FocusAreasView } from "@/components/FocusAreasView";
import { ApproachView } from "@/components/ApproachView";
import { ContactView } from "@/components/ContactView";
import { MembershipView } from "@/components/MembershipView";
import { UserAccountView } from "@/components/UserAccountView";
import { LegalView } from "@/components/LegalView";
import { SiteFooter } from "@/components/SiteFooter";
import { SessionProvider } from "@/components/SessionProvider";
import { LangProvider } from "@/components/LangProvider";

function getInitialPage(): PageKey {
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    if (params.get("tab") === "account") {
      window.history.replaceState({}, "", "/");
      return "account";
    }
    if (params.get("tab") === "membership") {
      window.history.replaceState({}, "", "/");
      return "membership";
    }
  }
  return "home";
}

const LEGAL_PAGES: Set<PageKey> = new Set(["impressum", "datenschutz", "agb"]);

function PageRouter({ page }: { page: PageKey }) {
  if (LEGAL_PAGES.has(page)) {
    return <LegalView page={page as "impressum" | "datenschutz" | "agb"} />;
  }

  switch (page) {
    case "home":
      return <HomeView />;
    case "brief":
      return <DailyBriefView />;
    case "reports":
      return <ReportsView />;
    case "opinions":
      return <OpinionsView />;
    case "focus-areas":
      return <FocusAreasView />;
    case "approach":
      return <ApproachView />;
    case "membership":
      return <MembershipView />;
    case "contact":
      return <ContactView />;
    case "account":
      return <UserAccountView />;
    default:
      return <HomeView />;
  }
}

export default function Page() {
  const [currentPage, setCurrentPage] = useState<PageKey>(getInitialPage);

  return (
    <LangProvider>
      <SessionProvider>
        <NavigationProvider currentPage={currentPage} onNavigate={setCurrentPage}>
          <SiteNavigation currentPage={currentPage} onNavigate={setCurrentPage} />
          <main className="flex-1">
            <PageRouter page={currentPage} />
          </main>
          <SiteFooter />
        </NavigationProvider>
      </SessionProvider>
    </LangProvider>
  );
}