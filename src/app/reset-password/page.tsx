"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useLang } from "@/components/LangProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, KeyRound } from "lucide-react";

function ResetPasswordInner() {
  const { t: tr } = useLang();
  const params = useSearchParams();
  const token = params.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError(tr("auth.error.password-min"));
      return;
    }
    if (password !== confirm) {
      setError(tr("reset.mismatch"));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || tr("reset.invalid"));
        return;
      }
      setDone(true);
    } catch {
      setError(tr("reset.invalid"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-[#0A2540] mb-1">{tr("reset.title")}</h1>
        <p className="text-sm text-muted-foreground mb-6">SRC Advisory</p>

        {!token ? (
          <div className="text-[#E8272C] text-sm font-medium bg-red-50 border border-red-200 rounded-sm px-4 py-3">
            {tr("reset.invalid")}
          </div>
        ) : done ? (
          <div className="space-y-5">
            <div className="flex items-start gap-3 text-sm text-[#0A2540] bg-green-50 border border-green-200 rounded-sm px-4 py-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
              <span>{tr("reset.success")}</span>
            </div>
            <Link
              href="/?tab=account"
              className="inline-block text-[#0A2540] text-sm font-semibold hover:underline"
            >
              {tr("reset.signin")}
            </Link>
          </div>
        ) : (
          <form noValidate onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider">
                {tr("reset.password")}
              </Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-10 mt-1.5"
                autoComplete="new-password"
                required
                minLength={6}
              />
            </div>
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider">
                {tr("reset.confirm")}
              </Label>
              <Input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="h-10 mt-1.5"
                autoComplete="new-password"
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="text-[#E8272C] text-xs font-medium bg-red-50 border border-red-200 rounded-sm px-3 py-2">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0A2540] hover:bg-[#0A2540]/90 text-white font-semibold text-sm uppercase tracking-wider h-10"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <KeyRound className="h-4 w-4 mr-2" />
              )}
              {loading ? "..." : tr("reset.submit")}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh]" />}>
      <ResetPasswordInner />
    </Suspense>
  );
}
