"use client";

import { Ticker } from "./Ticker";
import { SiteFooter } from "./SiteFooter";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Ticker />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}