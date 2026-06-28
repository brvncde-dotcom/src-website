"use client";

import { createContext, useContext, useCallback, useEffect, useRef } from "react";
import type { PageKey } from "./SiteNavigation";

interface NavigationContextValue {
  currentPage: PageKey;
  navigate: (page: PageKey, scrollId?: string) => void;
}

const NavigationContext = createContext<NavigationContextValue>({
  currentPage: "home",
  navigate: () => {},
});

export function useNavigation() {
  return useContext(NavigationContext);
}

export { NavigationContext };

// Map hash fragment to a valid PageKey
function hashToPage(hash: string): PageKey {
  const validPages: PageKey[] = [
    "home", "reports", "opinions", "focus-areas", "approach", "membership", "contact",
    "account", "impressum", "datenschutz", "agb",
  ];
  const page = hash.replace(/^#\/?/, "");
  if (validPages.includes(page as PageKey)) return page as PageKey;
  return "home";
}

export function NavigationProvider({
  children,
  currentPage,
  onNavigate,
}: {
  children: React.ReactNode;
  currentPage: PageKey;
  onNavigate: (page: PageKey) => void;
}) {
  const initialised = useRef(false);
  const pendingScrollId = useRef<string | undefined>(undefined);

  // Read initial hash on mount and sync
  useEffect(() => {
    if (initialised.current) return;
    initialised.current = true;
    const hash = window.location.hash;
    const page = hashToPage(hash);
    window.history.replaceState({ page }, "", `#${page}`);
    if (page !== "home") {
      onNavigate(page);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll to element after page change renders
  useEffect(() => {
    if (!pendingScrollId.current) return;
    const id = pendingScrollId.current;
    pendingScrollId.current = undefined;
    // Small delay to allow the new page to render
    const timer = setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
    return () => clearTimeout(timer);
  }, [currentPage]);

  const navigate = useCallback(
    (page: PageKey, scrollId?: string) => {
      if (page === currentPage && !scrollId) return;
      window.scrollTo({ top: 0, behavior: "smooth" });
      if (scrollId) {
        pendingScrollId.current = scrollId;
      }
      window.history.pushState({ page }, "", `#${page}`);
      onNavigate(page);
    },
    [currentPage, onNavigate],
  );

  // Handle browser back/forward
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      const page = (e.state?.page as PageKey) || "home";
      window.scrollTo({ top: 0, behavior: "smooth" });
      onNavigate(page);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [onNavigate]);

  return (
    <NavigationContext.Provider value={{ currentPage, navigate }}>
      {children}
    </NavigationContext.Provider>
  );
}