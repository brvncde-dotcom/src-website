"use client";

import { useState } from "react";
import { Ticker } from "@/components/prototype/Ticker";
import { SiteNavigation, type PageKey } from "@/components/prototype/SiteNavigation";
import { SiteFooter } from "@/components/prototype/SiteFooter";
import { HomeView } from "@/components/prototype/HomeView";
import { ReportsView } from "@/components/prototype/ReportsView";
import { OpinionsView } from "@/components/prototype/OpinionsView";
import { FocusAreasView } from "@/components/prototype/FocusAreasView";
import { ApproachView } from "@/components/prototype/ApproachView";
import { ExpertsView } from "@/components/prototype/ExpertsView";
import { ContactView } from "@/components/prototype/ContactView";

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
    case "experts":
      return <ExpertsView />;
    case "contact":
      return <ContactView />;
    default:
      return <HomeView onNavigate={onNavigate} />;
  }
}

export default function Page() {
  const [currentPage, setCurrentPage] = useState<PageKey>("home");

  return (
    <div className="min-h-screen flex flex-col">
      <Ticker />
      <SiteNavigation currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="flex-1">
        <PageRouter page={currentPage} onNavigate={setCurrentPage} />
      </main>
      <SiteFooter />
    </div>
  );
}