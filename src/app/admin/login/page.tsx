"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { SwissCrossLogo } from "@/components/SwissCrossLogo";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password.");
    } else {
      router.push("/admin/reports");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F6F9]">
      <div className="w-full max-w-md">
        <div className="bg-white border border-[#D8DEE6] rounded-sm shadow-sm px-10 py-12">
          <div className="flex flex-col items-center mb-10">
            <SwissCrossLogo className="h-10 w-auto mb-4" />
            <h1 className="font-serif text-2xl text-[#0A2540] tracking-tight">
              Admin Access
            </h1>
            <p className="text-sm text-[#5A6B7F] mt-1">
              SRC — Security &amp; Resilience Counsel
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-[#0A2540] uppercase tracking-wider mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-[#D8DEE6] rounded-sm px-3 py-2.5 text-sm text-[#0A2540] placeholder:text-[#5A6B7F] focus:outline-none focus:ring-1 focus:ring-[#0A2540] focus:border-[#0A2540] bg-white"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-xs font-medium text-[#0A2540] uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-[#D8DEE6] rounded-sm px-3 py-2.5 text-sm text-[#0A2540] placeholder:text-[#5A6B7F] focus:outline-none focus:ring-1 focus:ring-[#0A2540] focus:border-[#0A2540] bg-white"
                placeholder="••••••••"
              />
            </div>
            {error && (
              <p className="text-sm text-[#E8272C]">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0A2540] text-white text-sm font-medium py-2.5 rounded-sm hover:bg-[#1A3A5C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
        <p className="text-center text-xs text-[#5A6B7F] mt-6">
          Not an admin?{" "}
          <a href="/" className="underline hover:text-[#0A2540] transition-colors">
            Return to site
          </a>
        </p>
      </div>
    </div>
  );
}
