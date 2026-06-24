"use client";

import { useLang } from "./LangProvider";

export function Ticker() {
  const { t: tr } = useLang();

  // Ticker items are published via Paperclip — return empty until content arrives
  return null;
}