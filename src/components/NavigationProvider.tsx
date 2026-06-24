"use client";

import { createContext, useContext, useCallback, useEffect, useRef } from "react";
import type { PageKey } from "./SiteNavigation";

interface NavigationContextValue {
  currentPage: PageKey;
  navigate: (page: PageKey) => void;
}

const NavigationContext = createContext<NavigationContextValue>({
  currentPage: "home",
  navigate: () => {},
});

export function useNavigation() {
  return useContext(NavigationContext);
}

export { NavigationContext };

export function NavigationProvider({
  children,
  currentPage,
  onNavigate,
}: {
  children: React.ReactNode;
  currentPage: PageKey;
  onNavigate: (page: PageKey) => void;
}) {
  // Track last programmatic navigation to avoid popstate loops
  const isPushing = useRef(false);

  const navigate = useCallback(
    (page: PageKey) => {
      if (page === currentPage) return;
      window.scrollTo({ top: 0, behavior: "smooth" });
      // Use history API so browser back/forward works
      isPushing.current = true;
      window.history.pushState({ page }, "", `#${page}`);
      onNavigate(page);
    },
    [currentPage, onNavigate],
  );

  // Handle browser back/forward
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (isPushing.current) {
        isPushing.current = false;
        return;
      }
      const page = (e.state?.page as PageKey) || "home";
      window.scrollTo({ top: 0, behavior: "smooth" });
      onNavigate(page);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [onNavigate]);

  // Set initial history state
  useEffect(() => {
    window.history.replaceState({ page: currentPage }, "", `#${currentPage}`);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <NavigationContext.Provider value={{ currentPage, navigate }}>
      {children}
    </NavigationContext.Provider>
  );
}