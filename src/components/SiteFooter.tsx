"use client";

import { useLang } from "./LangProvider";
import { useNavigation } from "./NavigationProvider";
import type { PageKey } from "./SiteNavigation";

export function SiteFooter() {
  const { t: tr } = useLang();
  const { navigate } = useNavigation();

  const focusKeys: { key: PageKey; labelKey: string; scrollId: string }[] = [
    { key: "focus-areas", labelKey: "focus.digital", scrollId: "area-01" },
    { key: "focus-areas", labelKey: "focus.geopolitics", scrollId: "area-02" },
    { key: "focus-areas", labelKey: "focus.energy", scrollId: "area-03" },
    { key: "focus-areas", labelKey: "focus.climate", scrollId: "area-04" },
    { key: "focus-areas", labelKey: "focus.economy", scrollId: "area-05" },
    { key: "focus-areas", labelKey: "focus.society", scrollId: "area-06" },
  ];

  const orgLinks: { key: PageKey; labelKey: string }[] = [
    { key: "home", labelKey: "footer.about" },
    { key: "approach", labelKey: "footer.our-approach" },
    { key: "opinions", labelKey: "footer.opinions" },
    { key: "contact", labelKey: "footer.contact" },
  ];

  const legalLinks: { key: PageKey; labelKey: string }[] = [
    { key: "impressum", labelKey: "footer.impressum" },
    { key: "datenschutz", labelKey: "footer.datenschutz" },
    { key: "agb", labelKey: "footer.agb" },
  ];

  return (
    <footer className="bg-primary text-primary-foreground mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 border-b border-white/10">
          <div className="lg:col-span-1">
            <button onClick={() => navigate("home")} className="flex items-center gap-3 mb-4 hover:opacity-80 transition-opacity">
              <img src="/src-symbol.svg" alt="SRC" width={32} height={32} className="rounded-full" />
              <div>
                <div className="text-sm font-bold tracking-[0.15em]">SRC</div>
                <div className="text-[10px] tracking-widest text-white/50 uppercase">Security & Resilience Counsel</div>
              </div>
            </button>
            <p className="text-sm text-white/60 leading-relaxed">{tr("footer.desc")}</p>
          </div>
          <div>
            <h4 className="text-xs font-bold tracking-[0.12em] uppercase mb-4 text-white/40">{tr("footer.focus-areas")}</h4>
            <ul className="space-y-2.5 text-sm text-white/60">
              {focusKeys.map((item) => (
                <li key={item.labelKey}>
                  <button onClick={() => navigate(item.key, item.scrollId)} className="hover:text-white transition-colors">
                    {tr(item.labelKey)}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold tracking-[0.12em] uppercase mb-4 text-white/40">{tr("footer.organisation")}</h4>
            <ul className="space-y-2.5 text-sm text-white/60">
              {orgLinks.map((item) => (
                <li key={item.labelKey}>
                  <button onClick={() => navigate(item.key)} className="hover:text-white transition-colors">
                    {tr(item.labelKey)}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold tracking-[0.12em] uppercase mb-4 text-white/40">{tr("footer.legal")}</h4>
            <ul className="space-y-2.5 text-sm text-white/60">
              {legalLinks.map((item) => (
                <li key={item.labelKey}>
                  <button onClick={() => navigate(item.key)} className="hover:text-white transition-colors">
                    {tr(item.labelKey)}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/40">
          <span>&copy; {new Date().getFullYear()} SRC — Security & Resilience Counsel. {tr("footer.copyright")}</span>
          <span className="flex items-center gap-1.5">
            <img src="/src-symbol.svg" alt="" width={14} height={14} className="rounded-full" />
            {tr("footer.based-in")}
          </span>
        </div>
      </div>
    </footer>
  );
}