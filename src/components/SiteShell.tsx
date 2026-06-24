"use client";

import { Ticker } from "./Ticker";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Ticker />
      {children}
    </div>
  );
}