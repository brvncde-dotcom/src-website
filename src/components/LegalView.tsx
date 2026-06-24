"use client";

import { useLang } from "./LangProvider";
import { useNavigation } from "./NavigationProvider";

// Placeholder legal content — to be replaced with real legal text
const LEGAL_CONTENT: Record<string, { headingKey: string; bodyKey: string }> = {
  impressum: {
    headingKey: "footer.impressum",
    bodyKey: "legal.impressum.body",
  },
  datenschutz: {
    headingKey: "footer.datenschutz",
    bodyKey: "legal.datenschutz.body",
  },
  agb: {
    headingKey: "footer.agb",
    bodyKey: "legal.agb.body",
  },
};

export function LegalView({ page }: { page: "impressum" | "datenschutz" | "agb" }) {
  const { t: tr } = useLang();
  const { navigate } = useNavigation();
  const info = LEGAL_CONTENT[page];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
      <button
        onClick={() => navigate("home")}
        className="text-xs text-muted-foreground hover:text-primary transition-colors mb-8 inline-flex items-center gap-1"
      >
        &larr; {tr("legal.back")}
      </button>
      <h1 className="heading-serif text-2xl sm:text-3xl font-bold text-primary mb-6">
        {tr(info.headingKey)}
      </h1>
      <div className="prose-src text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
        {tr(info.bodyKey)}
      </div>
    </div>
  );
}