"use client";

import { useEffect, useRef } from "react";
import { useLang } from "./LangProvider";

export function Ticker() {
  const { t: tr } = useLang();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let animId: number;
    let pos = 0;
    const speed = 0.5;

    const animate = () => {
      pos -= speed;
      if (Math.abs(pos) >= el.scrollWidth / 2) {
        pos = 0;
      }
      el.style.transform = `translateX(${pos}px)`;
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, []);

  const items = [
    tr("ticker.1"), tr("ticker.2"), tr("ticker.3"), tr("ticker.4"),
    tr("ticker.5"), tr("ticker.6"), tr("ticker.7"), tr("ticker.8"),
  ];
  const doubled = [...items, ...items];

  return (
    <div className="bg-primary text-primary-foreground overflow-hidden h-9 flex items-center relative">
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-primary to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-primary to-transparent z-10 pointer-events-none" />

      <div ref={scrollRef} className="flex whitespace-nowrap gap-12">
        {doubled.map((item, i) => (
          <span key={i} className="flex items-center gap-3 text-xs tracking-wide uppercase font-medium">
            <span className="w-1.5 h-1.5 bg-[#E8272C] rounded-full flex-shrink-0" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}