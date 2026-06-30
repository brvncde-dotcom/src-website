"use client";

import { SessionProvider } from "@/components/SessionProvider";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

// Persistent admin nav so admins move between sections (and back to the site)
// without typing URLs. Hidden on the login screen.
function AdminBar() {
  const pathname = usePathname();
  const links = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/reports", label: "Reports" },
    { href: "/admin/users", label: "Users" },
  ];
  return (
    <div className="bg-[#0A2540] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span className="text-sm font-bold tracking-wide mr-4">SRC Admin</span>
          {links.map((l) => {
            const active =
              l.href === "/admin" ? pathname === "/admin" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`px-3 py-1.5 text-xs font-semibold rounded-sm transition-colors ${
                  active ? "bg-white/15" : "text-white/75 hover:bg-white/10 hover:text-white"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </div>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-xs font-medium text-white/70 hover:text-white">
            View site
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-xs font-medium text-white/70 hover:text-white"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showBar = pathname !== "/admin/login";
  return (
    <SessionProvider>
      {showBar && <AdminBar />}
      {children}
    </SessionProvider>
  );
}
