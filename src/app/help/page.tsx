"use client";

export const dynamic = "force-dynamic";

import { useState, useMemo } from "react";
import nextDynamic from "next/dynamic";
import { ChevronDown, Search } from "lucide-react";
import Link from "next/link";
import { useLang } from "@/components/LangProvider";
import { SiteNavigation, type PageKey } from "@/components/SiteNavigation";
import { SiteFooter } from "@/components/SiteFooter";
import { NavigationProvider } from "@/components/NavigationProvider";

const HelpChat = nextDynamic(() => import("@/components/HelpChat").then(m => ({ default: m.HelpChat })), { ssr: false });
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const HELP_SECTIONS = [
  "daily-brief",
  "reports",
  "search",
  "account",
  "membership",
  "pdf",
];

interface HelpSection {
  id: string;
  titleKey: string;
  items: {
    keyPrefix: string;
    subItems?: string[];
  }[];
}

export default function HelpPage() {
  const { t: tr } = useLang();
  const [searchQuery, setSearchQuery] = useState("");
  const [showChat, setShowChat] = useState(false);

  // Navigation: clicking any SiteNavigation item goes back to the SPA at that hash
  const handleNav = (key: PageKey) => {
    window.location.href = key === "home" ? "/" : `/#${key}`;
  };

  const helpSections: HelpSection[] = [
    {
      id: "daily-brief",
      titleKey: "help.daily-brief.title",
      items: [
        { keyPrefix: "help.daily-brief.what" },
        { keyPrefix: "help.daily-brief.for-free" },
        { keyPrefix: "help.daily-brief.for-essential" },
        { keyPrefix: "help.daily-brief.unsubscribe" },
        { keyPrefix: "help.daily-brief.no-brief" },
      ],
    },
    {
      id: "reports",
      titleKey: "help.reports.title",
      items: [
        { keyPrefix: "help.reports.what" },
        { keyPrefix: "help.reports.tiers" },
        { keyPrefix: "help.reports.search" },
        { keyPrefix: "help.reports.bookmark" },
        { keyPrefix: "help.reports.share" },
      ],
    },
    {
      id: "search",
      titleKey: "help.search.title",
      items: [
        { keyPrefix: "help.search.how" },
        { keyPrefix: "help.search.gated" },
        { keyPrefix: "help.search.advanced" },
      ],
    },
    {
      id: "account",
      titleKey: "help.account.title",
      items: [
        { keyPrefix: "help.account.picture" },
        { keyPrefix: "help.account.language" },
        { keyPrefix: "help.account.saved" },
        { keyPrefix: "help.account.logout" },
      ],
    },
    {
      id: "membership",
      titleKey: "help.membership.title",
      items: [
        { keyPrefix: "help.membership.free" },
        { keyPrefix: "help.membership.essential" },
        { keyPrefix: "help.membership.professional" },
        { keyPrefix: "help.membership.trial" },
        { keyPrefix: "help.membership.cancel" },
      ],
    },
    {
      id: "pdf",
      titleKey: "help.pdf.title",
      items: [
        { keyPrefix: "help.pdf.who" },
        { keyPrefix: "help.pdf.how" },
        { keyPrefix: "help.pdf.format" },
      ],
    },
  ];

  // Filter sections based on search query
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return helpSections;

    const query = searchQuery.toLowerCase();
    return helpSections
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => {
          const content = tr(item.keyPrefix).toLowerCase();
          const title = tr(section.titleKey).toLowerCase();
          return content.includes(query) || title.includes(query);
        }),
      }))
      .filter((section) => section.items.length > 0);
  }, [searchQuery, tr]);

  return (
    <NavigationProvider currentPage="help" onNavigate={handleNav}>
    <SiteNavigation currentPage="help" onNavigate={handleNav} />
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Header */}
      <div className="border-b border-[#D8DEE6] dark:border-slate-800 bg-gradient-to-br from-[#0A2540] via-[#0F3A5F] to-[#14445A] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            {tr("help.page-title")}
          </h1>
          <p className="text-lg text-blue-100 max-w-2xl">
            Find answers to common questions about SRC, your membership, reports,
            and how to get the most from our platform.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* Search Bar */}
        <div className="mb-12 max-w-2xl">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
            <input
              type="text"
              placeholder={tr("help.search-placeholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-[#D8DEE6] dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2540] dark:bg-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Desktop Layout: Sidebar + Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Navigation Sidebar - Desktop Only */}
          <div className="hidden lg:block">
            <nav className="sticky top-8 space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Topics
              </p>
              {helpSections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="block px-4 py-2 rounded-lg text-[#0A2540] dark:text-white hover:bg-[#F4F6F9] dark:hover:bg-slate-800 transition-colors text-sm font-medium"
                >
                  {tr(section.titleKey)}
                </a>
              ))}
            </nav>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2">
            {filteredSections.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  No results found for "{searchQuery}"
                </p>
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-[#0A2540] dark:text-blue-400 hover:underline"
                >
                  Clear search
                </button>
              </div>
            ) : (
              <Accordion type="single" collapsible className="space-y-4">
                {filteredSections.map((section) => (
                  <div key={section.id} id={section.id} className="scroll-mt-8">
                    {section.items.map((item, idx) => (
                      <AccordionItem
                        key={`${section.id}-${idx}`}
                        value={`${section.id}-${idx}`}
                        className="border border-[#D8DEE6] dark:border-slate-700 rounded-lg px-4 mb-3 data-[state=open]:bg-[#F4F6F9] dark:data-[state=open]:bg-slate-900"
                      >
                        <AccordionTrigger className="text-left py-4 hover:no-underline hover:text-[#0A2540]">
                          <span className="font-semibold text-[#0A2540] dark:text-white">
                            {tr(item.keyPrefix)}
                          </span>
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-700 dark:text-gray-300 pb-4 leading-relaxed">
                          {idx === 0 && (
                            <p className="mb-3 font-semibold text-[#0A2540] dark:text-white">
                              {tr(section.titleKey)}
                            </p>
                          )}
                          {/* Render additional details based on section */}
                          {section.id === "daily-brief" && idx === 0 && (
                            <div className="space-y-3">
                              <p>{tr("help.daily-brief.what")}</p>
                              <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-[#0A2540] p-3 rounded text-sm">
                                <p className="font-semibold text-[#0A2540] dark:text-blue-400 mb-1">
                                  Tier Access
                                </p>
                                <ul className="space-y-1">
                                  <li>
                                    <strong>Observer:</strong>{" "}
                                    {tr("help.daily-brief.for-free")}
                                  </li>
                                  <li>
                                    <strong>Essential/Professional:</strong>{" "}
                                    {tr("help.daily-brief.for-essential")}
                                  </li>
                                </ul>
                              </div>
                              <p>{tr("help.daily-brief.unsubscribe")}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {tr("help.daily-brief.no-brief")}
                              </p>
                            </div>
                          )}
                          {section.id === "reports" && idx === 0 && (
                            <div className="space-y-3">
                              <p>{tr("help.reports.what")}</p>
                              <p>{tr("help.reports.tiers")}</p>
                            </div>
                          )}
                          {section.id === "reports" && idx === 1 && (
                            <p>{tr("help.reports.search")}</p>
                          )}
                          {section.id === "reports" && idx === 2 && (
                            <p>{tr("help.reports.bookmark")}</p>
                          )}
                          {section.id === "reports" && idx === 3 && (
                            <p>{tr("help.reports.share")}</p>
                          )}
                          {section.id === "search" && idx === 0 && (
                            <p>{tr("help.search.how")}</p>
                          )}
                          {section.id === "search" && idx === 1 && (
                            <p>{tr("help.search.gated")}</p>
                          )}
                          {section.id === "search" && idx === 2 && (
                            <p>{tr("help.search.advanced")}</p>
                          )}
                          {section.id === "account" && idx === 0 && (
                            <p>{tr("help.account.picture")}</p>
                          )}
                          {section.id === "account" && idx === 1 && (
                            <p>{tr("help.account.language")}</p>
                          )}
                          {section.id === "account" && idx === 2 && (
                            <p>{tr("help.account.saved")}</p>
                          )}
                          {section.id === "account" && idx === 3 && (
                            <p>{tr("help.account.logout")}</p>
                          )}
                          {section.id === "membership" && idx === 0 && (
                            <p>{tr("help.membership.free")}</p>
                          )}
                          {section.id === "membership" && idx === 1 && (
                            <p>{tr("help.membership.essential")}</p>
                          )}
                          {section.id === "membership" && idx === 2 && (
                            <p>{tr("help.membership.professional")}</p>
                          )}
                          {section.id === "membership" && idx === 3 && (
                            <p>{tr("help.membership.trial")}</p>
                          )}
                          {section.id === "membership" && idx === 4 && (
                            <p>{tr("help.membership.cancel")}</p>
                          )}
                          {section.id === "pdf" && idx === 0 && (
                            <p>{tr("help.pdf.who")}</p>
                          )}
                          {section.id === "pdf" && idx === 1 && (
                            <p>{tr("help.pdf.how")}</p>
                          )}
                          {section.id === "pdf" && idx === 2 && (
                            <p>{tr("help.pdf.format")}</p>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </div>
                ))}
              </Accordion>
            )}
          </div>

          {/* Chat Widget - Desktop: fixed height so it never grows or scrolls the page */}
          <div className="hidden lg:block sticky top-8 h-[480px]">
            <HelpChat />
          </div>
        </div>
      </div>

      {/* Mobile Chat Button */}
      <button
        onClick={() => setShowChat(!showChat)}
        className="lg:hidden fixed bottom-4 right-4 bg-[#0A2540] text-white rounded-full p-4 shadow-lg hover:bg-[#0F3A5F] transition-colors z-40"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      </button>

      {/* Mobile Chat Modal */}
      {showChat && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="w-full h-[80vh] sm:max-w-md sm:h-[600px]">
            <HelpChat isModal onClose={() => setShowChat(false)} />
          </div>
        </div>
      )}
    </div>
    <SiteFooter />
    </NavigationProvider>
  );
}
