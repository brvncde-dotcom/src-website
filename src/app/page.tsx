"use client";

import { useState } from "react";
import { SiteNavigation, type PageKey } from "@/components/SiteNavigation";
import { HomeView } from "@/components/HomeView";
import { ReportsView } from "@/components/ReportsView";
import { OpinionsView } from "@/components/OpinionsView";
import { FocusAreasView } from "@/components/FocusAreasView";
import { ApproachView } from "@/components/ApproachView";
import { ContactView } from "@/components/ContactView";
import { MembershipView } from "@/components/MembershipView";
import { UserAccountView } from "@/components/UserAccountView";
import { SessionProvider } from "@/components/SessionProvider";

function getInitialPage(): PageKey {
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    if (params.get("tab") === "account") {
      window.history.replaceState({}, "", "/");
      return "account";
    }
  }
  return "home";
}

function PageRouter({ page, onNavigate }: { page: PageKey; onNavigate: (p: PageKey) => void }) {
  switch (page) {
    case "home":
      return <HomeView onNavigate={onNavigate} />;
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
      return <HomeView onNavigate={onNavigate} />;
  }
}

export default function Page() {
  const [currentPage, setCurrentPage] = useState<PageKey>(getInitialPage);

  return (
    <SessionProvider>
      <SiteNavigation currentPage={currentPage} onNavigate={setCurrentPage} />
      <PageRouter page={currentPage} onNavigate={setCurrentPage} />
    </SessionProvider>
  );
}