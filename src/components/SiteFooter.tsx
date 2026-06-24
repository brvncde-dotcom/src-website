"use client";

import { ArrowRight } from "lucide-react";
import Image from "next/image";

export function SiteFooter() {
  return (
    <footer className="bg-primary text-primary-foreground mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top section */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 border-b border-white/10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/src-logo.png"
                alt="SRC Logo"
                width={32}
                height={32}
                className="rounded-full"
              />
              <div>
                <div className="text-sm font-bold tracking-[0.15em]">SRC</div>
                <div className="text-[10px] tracking-widest text-white/50 uppercase">
                  Security & Resilience Counsel
                </div>
              </div>
            </div>
            <p className="text-sm text-white/60 leading-relaxed">
              A non-partisan, fact-based think tank for the security and resilience of critical
              infrastructures in the D-A-CH region.
            </p>
          </div>

          {/* Focus Areas */}
          <div>
            <h4 className="text-xs font-bold tracking-[0.12em] uppercase mb-4 text-white/40">
              Focus Areas
            </h4>
            <ul className="space-y-2.5 text-sm text-white/60">
              <li className="hover:text-white transition-colors cursor-pointer">Digital Power & AI</li>
              <li className="hover:text-white transition-colors cursor-pointer">
                Geopolitics & Hard Security
              </li>
              <li className="hover:text-white transition-colors cursor-pointer">Energy & Resources</li>
              <li className="hover:text-white transition-colors cursor-pointer">
                Climate, Environment & Food
              </li>
              <li className="hover:text-white transition-colors cursor-pointer">
                Economy & Competitiveness
              </li>
              <li className="hover:text-white transition-colors cursor-pointer">
                Society, Migration & Institutions
              </li>
            </ul>
          </div>

          {/* Organisation */}
          <div>
            <h4 className="text-xs font-bold tracking-[0.12em] uppercase mb-4 text-white/40">
              Organisation
            </h4>
            <ul className="space-y-2.5 text-sm text-white/60">
              <li className="hover:text-white transition-colors cursor-pointer">About SRC</li>
              <li className="hover:text-white transition-colors cursor-pointer">Our Approach</li>
              <li className="hover:text-white transition-colors cursor-pointer">Opinions</li>
              <li className="hover:text-white transition-colors cursor-pointer">Contact</li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs font-bold tracking-[0.12em] uppercase mb-4 text-white/40">Legal</h4>
            <ul className="space-y-2.5 text-sm text-white/60">
              <li className="hover:text-white transition-colors cursor-pointer">Impressum</li>
              <li className="hover:text-white transition-colors cursor-pointer">Datenschutz</li>
              <li className="hover:text-white transition-colors cursor-pointer">AGB</li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/40">
          <span>&copy; {new Date().getFullYear()} SRC — Security & Resilience Counsel. All rights reserved.</span>
          <span className="flex items-center gap-1.5">
            <Image
              src="/src-logo.png"
              alt=""
              width={14}
              height={14}
              className="rounded-full"
            />
            Based in Zug, Switzerland
          </span>
        </div>
      </div>
    </footer>
  );
}