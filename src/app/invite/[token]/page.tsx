"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, UserPlus } from "lucide-react";

export default function AcceptInvitePage() {
  const params = useParams();
  const token = String(params?.token || "");

  const [loading, setLoading] = useState(true);
  const [valid, setValid] = useState(false);
  const [email, setEmail] = useState("");
  const [tierName, setTierName] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    fetch(`/api/invitations/${token}`)
      .then((r) => r.json())
      .then((d) => {
        setValid(!!d.valid);
        setEmail(d.email || "");
        setTierName(d.tierName || null);
      })
      .catch(() => setValid(false))
      .finally(() => setLoading(false));
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/invitations/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, name, password }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error || "Could not accept invitation.");
        return;
      }
      setDone(true);
      // Auto-login with the credentials just set, then land on the account
      // page so the member is immediately signed in and sees their access.
      const signInRes = await signIn("credentials", { email, password, redirect: false });
      if (signInRes?.ok) {
        window.location.href = "/?tab=account";
        return;
      }
      // Fallback: account created but auto-login failed → the "done" screen
      // tells them they can sign in manually.
    } catch {
      setError("Could not accept invitation.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-[#0A2540] mb-1">Accept your invitation</h1>
        <p className="text-sm text-muted-foreground mb-6">SRC Advisory</p>

        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Checking invitation…
          </div>
        ) : !valid ? (
          <div className="text-[#E8272C] text-sm font-medium bg-red-50 border border-red-200 rounded-sm px-4 py-3">
            This invitation is invalid or has expired. Please ask your administrator for a new one.
          </div>
        ) : done ? (
          <div className="space-y-5">
            <div className="flex items-start gap-3 text-sm text-[#0A2540] bg-green-50 border border-green-200 rounded-sm px-4 py-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
              <span>Your account is ready. You can now sign in.</span>
            </div>
            <Link href="/?tab=account" className="inline-block text-[#0A2540] text-sm font-semibold hover:underline">
              Go to sign in
            </Link>
          </div>
        ) : (
          <form noValidate onSubmit={handleSubmit} className="space-y-4">
            <div className="text-sm text-muted-foreground -mt-2 mb-2">
              Setting up the account for <span className="font-semibold text-[#0A2540]">{email}</span>
              {tierName && (
                <> — includes <span className="font-semibold text-[#0A2540]">{tierName}</span> access.</>
              )}
            </div>
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider">Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} className="h-10 mt-1.5" autoComplete="name" />
            </div>
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider">Password</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-10 mt-1.5" autoComplete="new-password" required minLength={6} />
            </div>
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider">Confirm password</Label>
              <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="h-10 mt-1.5" autoComplete="new-password" required minLength={6} />
            </div>

            {error && (
              <div className="text-[#E8272C] text-xs font-medium bg-red-50 border border-red-200 rounded-sm px-3 py-2">
                {error}
              </div>
            )}

            <Button type="submit" disabled={submitting} className="w-full bg-[#0A2540] hover:bg-[#0A2540]/90 text-white font-semibold text-sm uppercase tracking-wider h-10">
              {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <UserPlus className="h-4 w-4 mr-2" />}
              {submitting ? "…" : "Create account"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
