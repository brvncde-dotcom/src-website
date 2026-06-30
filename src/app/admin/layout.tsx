"use client";

import { SessionProvider } from "@/components/SessionProvider";

// Wrap all /admin routes in a SessionProvider so the admin pages' useSession()
// can see the NextAuth session. Without this, the admin dashboard can't detect
// a logged-in admin and falls back to manual API-key entry.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
