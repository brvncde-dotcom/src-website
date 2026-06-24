"use client";

import { useLang } from "./LangProvider";

export function OpinionsView() {
  const { t: tr } = useLang();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      {/* Header */}
      <div className="max-w-2xl mb-10">
        <span className="text-xs font-bold tracking-[0.15em] uppercase text-[#E8272C] mb-2 block">
          {tr("opinions.tag")}
        </span>
        <h1 className="heading-serif text-2xl sm:text-3xl font-bold text-primary mb-3">
          {tr("opinions.heading")}
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {tr("opinions.desc")}
        </p>
      </div>

      {/* Empty state — content will be published via Paperclip */}
      <div className="max-w-3xl py-16 text-center">
        <p className="text-sm text-muted-foreground">
          {tr("opinions.empty")}
        </p>
        <p className="text-xs text-muted-foreground/70 mt-2">
          {tr("opinions.empty.hint")}
        </p>
      </div>
    </div>
  );
}