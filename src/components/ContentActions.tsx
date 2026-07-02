"use client";

// ContentActions — the single Save / Share / PDF action system used on every
// reading surface: report detail page, Opinion/Editorial reader (SRC Position),
// Daily Brief masthead + footer, and the reports list (QuickSaveButton).
// One anatomy, one behavior, two skins:
//   variant="light" — navy-on-white surfaces (default)
//   variant="dark"  — the Daily Brief's deep-green masthead/footer
// All saves land in /api/me/saved; shares log to /api/content/[id]/share.

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { Bookmark, Share2, Download, Mail, Check, Loader2 } from "lucide-react";
import { AuthDialog } from "@/components/AuthDialog";
import { useLang } from "@/components/LangProvider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

/* ------------------------------------------------------------------ */
/* Saved-ids cache — shared by every instance on the page so the list  */
/* view's 100 quick-save buttons don't fire 100 fetches. Instances     */
/* stay in sync via the "src:saved-changed" window event.              */
/* ------------------------------------------------------------------ */

let savedIdsPromise: Promise<Set<string>> | null = null;

function loadSavedIds(): Promise<Set<string>> {
  if (!savedIdsPromise) {
    savedIdsPromise = fetch("/api/me/saved")
      .then((r) => (r.ok ? r.json() : { saved: [] }))
      .then(
        (d) =>
          new Set<string>(
            (d.saved || []).map((s: { reportId: string }) => s.reportId)
          )
      )
      .catch(() => new Set<string>());
  }
  return savedIdsPromise;
}

function updateSavedCache(id: string, saved: boolean) {
  if (savedIdsPromise) {
    savedIdsPromise.then((set) => {
      if (saved) set.add(id);
      else set.delete(id);
    });
  }
  window.dispatchEvent(
    new CustomEvent("src:saved-changed", { detail: { id, saved } })
  );
}

async function copyToClipboard(text: string): Promise<void> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }
  } catch {
    // fall through to the legacy path
  }
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand("copy");
  } catch {
    /* ignore */
  }
  document.body.removeChild(ta);
}

/* ------------------------------------------------------------------ */
/* useSaveState — bookmark state + toggle, with sign-in interception.  */
/* After a successful sign-in the pending save completes automatically. */
/* ------------------------------------------------------------------ */

function useSaveState(reportId: string) {
  const { status } = useSession();
  const authed = status === "authenticated";
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const pendingSave = useRef(false);

  useEffect(() => {
    let alive = true;
    if (authed) {
      loadSavedIds().then((set) => {
        if (alive) setSaved(set.has(reportId));
      });
    }
    const onChange = (e: Event) => {
      const d = (e as CustomEvent).detail as { id: string; saved: boolean };
      if (d?.id === reportId) setSaved(d.saved);
    };
    window.addEventListener("src:saved-changed", onChange);
    return () => {
      alive = false;
      window.removeEventListener("src:saved-changed", onChange);
    };
  }, [authed, reportId]);

  // Returns what happened so the caller can toast appropriately.
  const toggle = useCallback(async (): Promise<
    "saved" | "removed" | "auth" | "error"
  > => {
    if (!authed) {
      pendingSave.current = true;
      setAuthOpen(true);
      return "auth";
    }
    if (busy) return "error";
    setBusy(true);
    try {
      const res = await fetch(`/api/me/saved/${reportId}`, {
        method: saved ? "DELETE" : "POST",
      });
      if (!res.ok) return "error";
      const next = !saved;
      setSaved(next);
      updateSavedCache(reportId, next);
      return next ? "saved" : "removed";
    } catch {
      return "error";
    } finally {
      setBusy(false);
    }
  }, [authed, busy, saved, reportId]);

  // Complete the save the user asked for before they signed in. The session
  // cookie is live immediately even if useSession hasn't re-polled yet, so we
  // POST directly instead of going back through toggle()'s auth check.
  const completeAfterAuth = useCallback(async (): Promise<boolean> => {
    setAuthOpen(false);
    if (!pendingSave.current) return false;
    pendingSave.current = false;
    savedIdsPromise = null; // refetch under the new session
    try {
      const res = await fetch(`/api/me/saved/${reportId}`, { method: "POST" });
      if (!res.ok) return false;
      setSaved(true);
      updateSavedCache(reportId, true);
      return true;
    } catch {
      return false;
    }
  }, [reportId]);

  return { saved, busy, toggle, authOpen, setAuthOpen, completeAfterAuth };
}

/* ------------------------------------------------------------------ */
/* Toast — small fixed confirmation, auto-dismissed by the caller.     */
/* ------------------------------------------------------------------ */

function Toast({ msg }: { msg: string | null }) {
  if (!msg) return null;
  return (
    <div
      aria-live="polite"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 bg-[#0A2540] text-white text-xs font-semibold px-4 py-2.5 rounded-md shadow-lg pointer-events-none"
    >
      <Check className="h-3.5 w-3.5 text-[#2ECC7A]" />
      {msg}
    </div>
  );
}

function useToast() {
  const [msg, setMsg] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const show = useCallback((m: string) => {
    setMsg(m);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setMsg(null), 2500);
  }, []);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );
  return { msg, show };
}

/* ------------------------------------------------------------------ */
/* ContentActions — the labeled Save / Share / PDF row.                */
/* ------------------------------------------------------------------ */

interface ContentActionsProps {
  reportId: string;
  title: string;
  variant?: "light" | "dark";
  showPdf?: boolean;
  className?: string;
}

export function ContentActions({
  reportId,
  title,
  variant = "light",
  showPdf = true,
  className = "",
}: ContentActionsProps) {
  const { t: tr } = useLang();
  const { status } = useSession();
  const { saved, busy, toggle, authOpen, setAuthOpen, completeAfterAuth } =
    useSaveState(reportId);
  const { msg: toast, show: showToast } = useToast();
  const [shareOpen, setShareOpen] = useState(false);
  const [sharedConfirmation, setSharedConfirmation] = useState<string | null>(
    null
  );
  const [pdfBusy, setPdfBusy] = useState(false);

  const btnBase =
    "inline-flex items-center gap-1.5 h-9 px-2.5 rounded-md text-xs font-semibold transition-colors disabled:opacity-50";
  const btnSkin =
    variant === "dark"
      ? "text-[#8BA89A] hover:text-[#2ECC7A] hover:bg-white/[0.06]"
      : "text-muted-foreground hover:text-[#0A2540] hover:bg-[#0A2540]/5";
  const savedSkin = variant === "dark" ? "text-[#2ECC7A]" : "text-[#E8272C]";

  const handleSave = async () => {
    const result = await toggle();
    if (result === "saved") showToast(tr("actions.saved-toast"));
    else if (result === "removed") showToast(tr("actions.removed-toast"));
  };

  // Share the canonical public report URL. window.open / mailto must fire
  // inside the click gesture (popup blockers kill them after an await).
  // Share tracking is fire-and-forget for signed-in members only.
  const handleShare = (channel: string) => {
    const reportUrl = `${window.location.origin}/reports/${reportId}`;

    if (status === "authenticated") {
      fetch(`/api/content/${reportId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel }),
      }).catch(() => {});
    }

    const confirm = (c: string) => {
      setSharedConfirmation(c);
      setTimeout(() => setSharedConfirmation(null), 2000);
    };

    if (channel === "copy") {
      copyToClipboard(reportUrl).finally(() => {
        confirm("copy");
        showToast(tr("actions.copied-toast"));
      });
      return;
    }
    if (channel === "email") {
      window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${title}\n\n${reportUrl}`)}`;
    } else if (channel === "twitter") {
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(reportUrl)}`,
        "_blank",
        "noopener,noreferrer"
      );
    } else if (channel === "linkedin") {
      window.open(
        `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(reportUrl)}`,
        "_blank",
        "noopener,noreferrer"
      );
    }
    confirm(channel);
  };

  // PDF is always visible; the tier gate answers at click time (401/403 →
  // membership toast). A locked button sells the tier; a hidden one is nothing.
  const handlePdf = async () => {
    if (pdfBusy) return;
    setPdfBusy(true);
    try {
      const res = await fetch(`/api/reports/${reportId}/pdf`);
      if (res.status === 401 || res.status === 403) {
        showToast(tr("reports.detail.pdf-professional"));
        return;
      }
      if (!res.ok) {
        showToast(tr("actions.pdf-failed"));
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `SRC-${reportId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      showToast(tr("actions.pdf-failed"));
    } finally {
      setPdfBusy(false);
    }
  };

  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      <button
        onClick={handleSave}
        disabled={busy}
        className={`${btnBase} ${saved ? savedSkin : btnSkin}`}
        aria-label={saved ? tr("reports.detail.unsave") : tr("reports.detail.save")}
      >
        <Bookmark
          className={`h-4 w-4 ${saved ? "fill-current" : ""}`}
        />
        {saved ? tr("actions.saved") : tr("reports.detail.save")}
      </button>

      <button
        onClick={() => setShareOpen(true)}
        className={`${btnBase} ${btnSkin}`}
        aria-label={tr("reports.detail.share-title")}
      >
        <Share2 className="h-4 w-4" />
        {tr("actions.share")}
      </button>

      {showPdf && (
        <button
          onClick={handlePdf}
          disabled={pdfBusy}
          className={`${btnBase} ${btnSkin}`}
          aria-label={tr("reports.detail.download-pdf")}
        >
          {pdfBusy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          PDF
        </button>
      )}

      {/* Share Dialog — four channels, same everywhere */}
      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#0A2540]">
              {tr("reports.detail.share-title")}
            </DialogTitle>
            <DialogDescription>{title}</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 mt-2">
            <button
              onClick={() => handleShare("email")}
              className="flex items-center gap-3 rounded-md border border-[#D8DEE6] px-4 py-3 text-sm font-medium text-[#0A2540] hover:bg-[#0A2540]/5 transition-colors"
            >
              <Mail className="h-4 w-4" />
              <span>
                {sharedConfirmation === "email" ? (
                  <span className="inline-flex items-center gap-1 text-green-600">
                    <Check className="h-3.5 w-3.5" /> {tr("reports.detail.share-shared")}
                  </span>
                ) : (
                  tr("reports.detail.share-email")
                )}
              </span>
            </button>

            <button
              onClick={() => handleShare("twitter")}
              className="flex items-center gap-3 rounded-md border border-[#D8DEE6] px-4 py-3 text-sm font-medium text-[#0A2540] hover:bg-[#0A2540]/5 transition-colors"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <span>
                {sharedConfirmation === "twitter" ? (
                  <span className="inline-flex items-center gap-1 text-green-600">
                    <Check className="h-3.5 w-3.5" /> {tr("reports.detail.share-shared")}
                  </span>
                ) : (
                  tr("reports.detail.share-x")
                )}
              </span>
            </button>

            <button
              onClick={() => handleShare("linkedin")}
              className="flex items-center gap-3 rounded-md border border-[#D8DEE6] px-4 py-3 text-sm font-medium text-[#0A2540] hover:bg-[#0A2540]/5 transition-colors"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              <span>
                {sharedConfirmation === "linkedin" ? (
                  <span className="inline-flex items-center gap-1 text-green-600">
                    <Check className="h-3.5 w-3.5" /> {tr("reports.detail.share-shared")}
                  </span>
                ) : (
                  tr("reports.detail.share-linkedin")
                )}
              </span>
            </button>

            <button
              onClick={() => handleShare("copy")}
              className="flex items-center gap-3 rounded-md border border-[#D8DEE6] px-4 py-3 text-sm font-medium text-[#0A2540] hover:bg-[#0A2540]/5 transition-colors"
            >
              <Share2 className="h-4 w-4" />
              <span>
                {sharedConfirmation === "copy" ? (
                  <span className="inline-flex items-center gap-1 text-green-600">
                    <Check className="h-3.5 w-3.5" /> {tr("reports.detail.share-copied")}
                  </span>
                ) : (
                  tr("reports.detail.share-copy")
                )}
              </span>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <AuthDialog
        open={authOpen}
        onOpenChange={setAuthOpen}
        onSuccess={() => {
          completeAfterAuth().then((ok) => {
            if (ok) showToast(tr("actions.saved-toast"));
          });
        }}
      />
      <Toast msg={toast} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* QuickSaveButton — icon-only bookmark for list rows. The row itself  */
/* is the label context, so this is the one icon-only placement. Stops */
/* the click from reaching the row's Link.                             */
/* ------------------------------------------------------------------ */

export function QuickSaveButton({
  reportId,
  className = "",
}: {
  reportId: string;
  className?: string;
}) {
  const { t: tr } = useLang();
  const { saved, busy, toggle, authOpen, setAuthOpen, completeAfterAuth } =
    useSaveState(reportId);
  const { msg: toast, show: showToast } = useToast();

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const result = await toggle();
    if (result === "saved") showToast(tr("actions.saved-toast"));
    else if (result === "removed") showToast(tr("actions.removed-toast"));
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={busy}
        className={`inline-flex items-center justify-center w-8 h-8 rounded-md border border-transparent text-muted-foreground hover:text-[#0A2540] hover:border-[#D8DEE6] transition-colors disabled:opacity-50 ${
          saved ? "text-[#E8272C] hover:text-[#E8272C]" : ""
        } ${className}`}
        aria-label={saved ? tr("reports.detail.unsave") : tr("reports.detail.save")}
        title={saved ? tr("reports.detail.unsave") : tr("reports.detail.save")}
      >
        <Bookmark className={`h-4 w-4 ${saved ? "fill-current" : ""}`} />
      </button>
      <AuthDialog
        open={authOpen}
        onOpenChange={setAuthOpen}
        onSuccess={() => {
          completeAfterAuth().then((ok) => {
            if (ok) showToast(tr("actions.saved-toast"));
          });
        }}
      />
      <Toast msg={toast} />
    </>
  );
}
