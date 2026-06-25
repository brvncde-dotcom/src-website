"use client";

import { useState } from "react";
import { SiteNavigation, type PageKey } from "@/components/SiteNavigation";
import { SiteFooter } from "@/components/SiteFooter";
import { HomeView } from "@/components/HomeView";
import { ReportsView } from "@/components/ReportsView";
import { OpinionsView } from "@/components/OpinionsView";
import { FocusAreasView } from "@/components/FocusAreasView";
import { ApproachView } from "@/components/ApproachView";
import { ContactView } from "@/components/ContactView";
import { MembershipView } from "@/components/MembershipView";
import { LegalView } from "@/components/LegalView";
import { NavigationProvider } from "@/components/NavigationProvider";

const LEGAL_PAGES: PageKey[] = ["impressum", "datenschutz", "agb"];

function PageRouter({ page }: { page: PageKey }) {
  if (LEGAL_PAGES.includes(page)) {
    return <LegalView page={page as "impressum" | "datenschutz" | "agb"} />;
  }
  switch (page) {
  case "home":
    return <HomeView />;
  case "reports":
    return <ReportsView />;
  case "opinions":
    return <OpinionsView />;
  case "focus-areas":
    return <FocusAreasView />;
  case "approach":
    return <ApproachView />;
  case "contact":
    return <ContactView />;
  case "membership":
    return <MembershipView />;
  default:
    return <HomeView />;
  }
}

export default function Page() {
  const [currentPage, setCurrentPage] = useState<PageKey>("home");

  return (
    <NavigationProvider currentPage={currentPage} onNavigate={setCurrentPage}>
      <SiteNavigation />
      <PageRouter page={currentPage} />
      <SiteFooter />
    </NavigationProvider>
  );
}