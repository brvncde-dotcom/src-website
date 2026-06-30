"use client";

import { useState } from "react";
import { useLang } from "@/components/LangProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Loader2, LogIn, UserPlus, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { signIn, useSession } from "next-auth/react";

type Mode = "login" | "register" | "forgot";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultMode?: "login" | "register";
  onSuccess?: () => void;
}

export function AuthDialog({ open, onOpenChange, defaultMode = "login", onSuccess }: Props) {
  const { t: tr, lang } = useLang();
  const { update } = useSession();
  const [mode, setMode] = useState<Mode>(defaultMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [forgotSent, setForgotSent] = useState(false);

  // Form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setName("");
    setError("");
    setForgotSent(false);
  };

  const switchMode = (newMode: Mode) => {
    setMode(newMode);
    resetForm();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.includes("@")) {
      setError(tr("auth.error.email-required"));
      return;
    }
    if (password.length < 6) {
      setError(tr("auth.error.password-min"));
      return;
    }

    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (res?.error) {
        setError(tr("auth.error.login"));
      } else {
        // Refresh the client session so useSession() consumers (e.g. the
        // navbar) update immediately instead of only after a page reload.
        await update();
        onOpenChange(false);
        resetForm();
        onSuccess?.();
      }
    } catch {
      setError(tr("auth.error.login"));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.includes("@")) {
      setError(tr("auth.error.email-required"));
      return;
    }
    if (password.length < 6) {
      setError(tr("auth.error.password-min"));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || tr("auth.error.register"));
        return;
      }

      // Auto-login after registration, then refresh the client session so the
      // navbar reflects the logged-in state immediately (no reload needed).
      await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      await update();
      onOpenChange(false);
      resetForm();
      onSuccess?.();
    } catch {
      setError(tr("auth.error.register"));
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.includes("@")) {
      setError(tr("auth.error.email-required"));
      return;
    }

    setLoading(true);
    try {
      // Endpoint always returns ok (no account enumeration); we show the same
      // confirmation regardless.
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, lang }),
      });
      setForgotSent(true);
    } catch {
      // Even on network error, show the generic confirmation.
      setForgotSent(true);
    } finally {
      setLoading(false);
    }
  };

  const title =
    mode === "login"
      ? tr("auth.login")
      : mode === "register"
        ? tr("auth.register")
        : tr("auth.forgot.title");

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          resetForm();
          setMode(defaultMode);
        }
        onOpenChange(v);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#0A2540]">{title}</DialogTitle>
          <DialogDescription>SRC Advisory</DialogDescription>
        </DialogHeader>

        {mode === "forgot" ? (
          forgotSent ? (
            <div className="mt-2 space-y-4">
              <div className="flex items-start gap-3 text-sm text-[#0A2540] bg-green-50 border border-green-200 rounded-sm px-3 py-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                <span>{tr("auth.forgot.sent")}</span>
              </div>
              <button
                type="button"
                onClick={() => switchMode("login")}
                className="inline-flex items-center gap-1.5 text-[#0A2540] text-xs font-semibold hover:underline"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                {tr("auth.back-to-login")}
              </button>
            </div>
          ) : (
            <form noValidate onSubmit={handleForgot} className="space-y-4 mt-2">
              <p className="text-sm text-muted-foreground">{tr("auth.forgot.desc")}</p>
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider">
                  {tr("auth.email")}
                </Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={tr("auth.email.placeholder")}
                  className="h-10 mt-1.5"
                  autoComplete="email"
                  required
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
                  <Mail className="h-4 w-4 mr-2" />
                )}
                {loading ? "..." : tr("auth.forgot.submit")}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className="inline-flex items-center gap-1.5 text-[#0A2540] text-xs font-semibold hover:underline"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  {tr("auth.back-to-login")}
                </button>
              </div>
            </form>
          )
        ) : (
          <form
            noValidate
            onSubmit={mode === "login" ? handleLogin : handleRegister}
            className="space-y-4 mt-2"
          >
            {mode === "register" && (
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider">
                  {tr("auth.name")}
                </Label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={tr("auth.name.placeholder")}
                  className="h-10 mt-1.5"
                  autoComplete="name"
                />
              </div>
            )}

            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider">
                {tr("auth.email")}
              </Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={tr("auth.email.placeholder")}
                className="h-10 mt-1.5"
                autoComplete="email"
                required
              />
            </div>

            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider">
                {tr("auth.password")}
              </Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={tr("auth.password.placeholder")}
                className="h-10 mt-1.5"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                required
                minLength={6}
              />
              {mode === "login" && (
                <div className="text-right mt-1.5">
                  <button
                    type="button"
                    onClick={() => switchMode("forgot")}
                    className="text-xs text-muted-foreground hover:text-[#0A2540] hover:underline"
                  >
                    {tr("auth.forgot")}
                  </button>
                </div>
              )}
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
              ) : mode === "login" ? (
                <LogIn className="h-4 w-4 mr-2" />
              ) : (
                <UserPlus className="h-4 w-4 mr-2" />
              )}
              {loading
                ? "..."
                : mode === "login"
                  ? tr("auth.submit.login")
                  : tr("auth.submit.register")}
            </Button>

            <div className="text-center text-xs text-muted-foreground">
              {mode === "login" ? (
                <>
                  {tr("auth.no-account")}{" "}
                  <button
                    type="button"
                    onClick={() => switchMode("register")}
                    className="text-[#0A2540] font-semibold hover:underline"
                  >
                    {tr("auth.register")}
                  </button>
                </>
              ) : (
                <>
                  {tr("auth.has-account")}{" "}
                  <button
                    type="button"
                    onClick={() => switchMode("login")}
                    className="text-[#0A2540] font-semibold hover:underline"
                  >
                    {tr("auth.login")}
                  </button>
                </>
              )}
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
