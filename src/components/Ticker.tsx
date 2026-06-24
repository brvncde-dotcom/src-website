"use client";

import { useEffect, useRef } from "react";

const TICKER_ITEMS = [
  "Swiss National Bank signals tighter monetary oversight for 2026",
  "NATO Summit: D-A-CH nations commit to 2.5% GDP defence spending",
  "EU Cyber Resilience Act enters force — implications for Swiss operators",
  "SRC Analysis: SMR deployment timeline for Central Europe revised",
  "Bundeswehr reform: 2030 readiness targets updated",
  "Austrian energy grid stress test reveals winter vulnerabilities",
  "New SRC Report: AI Governance in Critical Infrastructure",
  "Bundesamt für Bevölkerungsschutz updates civil defence guidelines",
];

export function Ticker() {
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

  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <div className="bg-primary text-primary-foreground overflow-hidden h-9 flex items-center relative">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-primary to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-primary to-transparent z-10 pointer-events-none" />

      <div ref={scrollRef} className="flex whitespace-nowrap gap-12">
        {items.map((item, i) => (
          <span key={i} className="flex items-center gap-3 text-xs tracking-wide uppercase font-medium">
            <span className="w-1.5 h-1.5 bg-[#E8272C] rounded-full flex-shrink-0" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}