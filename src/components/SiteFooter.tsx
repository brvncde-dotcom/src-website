"use client";

import Image from "next/image";
import { useLang } from "./LangProvider";

export function SiteFooter() {
  const { t: tr } = useLang();

  const focusKeys = ["focus.digital", "focus.geopolitics", "focus.energy", "focus.climate", "focus.economy", "focus.society"];
  const orgKeys = ["footer.about", "footer.our-approach", "footer.opinions", "footer.contact"];
  const legalKeys = ["footer.impressum", "footer.datenschutz", "footer.agb"];

  return (
    <footer className="bg-primary text-primary-foreground mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 border-b border-white/10">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <Image src="/src-logo.png" alt="SRC Logo" width={32} height={32} className="rounded-full" />
              <div>
                <div className="text-sm font-bold tracking-[0.15em]">SRC</div>
                <div className="text-[10px] tracking-widest text-white/50 uppercase">Security & Resilience Counsel</div>
              </div>
            </div>
            <p className="text-sm text-white/60 leading-relaxed">{tr("footer.desc")}</p>
          </div>
          <div>
            <h4 className="text-xs font-bold tracking-[0.12em] uppercase mb-4 text-white/40">{tr("footer.focus-areas")}</h4>
            <ul className="space-y-2.5 text-sm text-white/60">
              {focusKeys.map((k) => <li key={k} className="hover:text-white transition-colors cursor-pointer">{tr(k)}</li>)}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold tracking-[0.12em] uppercase mb-4 text-white/40">{tr("footer.organisation")}</h4>
            <ul className="space-y-2.5 text-sm text-white/60">
              {orgKeys.map((k) => <li key={k} className="hover:text-white transition-colors cursor-pointer">{tr(k)}</li>)}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold tracking-[0.12em] uppercase mb-4 text-white/40">{tr("footer.legal")}</h4>
            <ul className="space-y-2.5 text-sm text-white/60">
              {legalKeys.map((k) => <li key={k} className="hover:text-white transition-colors cursor-pointer">{tr(k)}</li>)}
            </ul>
          </div>
        </div>
        <div className="py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/40">
          <span>&copy; {new Date().getFullYear()} SRC — Security & Resilience Counsel. {tr("footer.copyright")}</span>
          <span className="flex items-center gap-1.5">
            <Image src="/src-logo.png" alt="" width={14} height={14} className="rounded-full" />
            {tr("footer.based-in")}
          </span>
        </div>
      </div>
    </footer>
  );
}