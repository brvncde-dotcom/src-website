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
import { Loader2, LogIn, UserPlus } from "lucide-react";
import { signIn } from "next-auth/react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultMode?: "login" | "register";
  onSuccess?: () => void;
}

export function AuthDialog({ open, onOpenChange, defaultMode = "login", onSuccess }: Props) {
  const { t: tr } = useLang();
  const [mode, setMode] = useState<"login" | "register">(defaultMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setName("");
    setError("");
  };

  const switchMode = (newMode: "login" | "register") => {
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

      // Auto-login after registration
      const loginRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (loginRes?.error) {
        // Registration succeeded but auto-login failed — close dialog, user can login manually
        onOpenChange(false);
        resetForm();
        onSuccess?.();
      } else {
        onOpenChange(false);
        resetForm();
        onSuccess?.();
      }
    } catch {
      setError(tr("auth.error.register"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) resetForm();
        onOpenChange(v);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#0A2540]">
            {mode === "login" ? tr("auth.login") : tr("auth.register")}
          </DialogTitle>
          <DialogDescription>
            {mode === "login"
              ? "SRC Advisory"
              : "SRC Advisory"}
          </DialogDescription>
        </DialogHeader>

        {/* noValidate: suppress the browser's native required/minLength validation
            popups (e.g. "Fülle dieses Feld aus.") — the dialog runs its own
            validation with styled, i18n error messages below. */}
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
      </DialogContent>
    </Dialog>
  );
}