"use client";

import { useState } from "react";
import { SiteNavigation, type PageKey } from "@/components/SiteNavigation";
import { HomeView } from "@/components/HomeView";
import { ReportsView } from "@/components/ReportsView";
import { OpinionsView } from "@/components/OpinionsView";
import { FocusAreasView } from "@/components/FocusAreasView";
import { ApproachView } from "@/components/ApproachView";
import { ContactView } from "@/components/ContactView";
import { NavigationProvider } from "@/components/NavigationProvider";

function PageRouter({ page }: { page: PageKey }) {
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
    </NavigationProvider>
  );
}