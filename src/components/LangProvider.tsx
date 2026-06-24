"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { t, type Lang, LANG_LABELS } from "@/lib/i18n";

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const Ctx = createContext<LangCtx>({
  lang: "en",
  setLang: () => {},
  t: (key: string) => key,
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const saved = localStorage.getItem("src_lang") as Lang | null;
    if (saved && LANG_LABELS[saved]) setLangState(saved);
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem("src_lang", l);
  }, []);

  const translate = useCallback(
    (key: string) => t(lang, key),
    [lang]
  );

  return (
    <Ctx.Provider value={{ lang, setLang, t: translate }}>
      {children}
    </Ctx.Provider>
  );
}

export function useLang() {
  return useContext(Ctx);
}