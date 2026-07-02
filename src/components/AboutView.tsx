"use client";

import {
  Star, Eye, Globe, Zap, Unlock, ShieldAlert, Bot, Scale,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang } from "./LangProvider";
import { useNavigation } from "./NavigationProvider";

const DIFFERENTIATORS = [
  { icon: Star,       titleKey: "about.d1.title", descKey: "about.d1.desc" },
  { icon: Eye,        titleKey: "about.d2.title", descKey: "about.d2.desc" },
  { icon: Scale,      titleKey: "about.d3.title", descKey: "about.d3.desc" },
  { icon: Globe,      titleKey: "about.d4.title", descKey: "about.d4.desc" },
  { icon: Unlock,     titleKey: "about.d5.title", descKey: "about.d5.desc" },
];

const VS_ROWS = [
  { nameKey: "about.vs.src",      biasKey: "about.vs.src.bias",      speedKey: "about.vs.src.speed",      scoringKey: "about.vs.src.scoring",      langsKey: "about.vs.src.langs",      accessKey: "about.vs.src.access",      isSrc: true  },
  { nameKey: "about.vs.brookings", biasKey: "about.vs.brookings.bias", speedKey: "about.vs.brookings.speed", scoringKey: "about.vs.brookings.scoring", langsKey: "about.vs.brookings.langs", accessKey: "about.vs.brookings.access", isSrc: false },
  { nameKey: "about.vs.rand",      biasKey: "about.vs.rand.bias",      speedKey: "about.vs.rand.speed",      scoringKey: "about.vs.rand.scoring",      langsKey: "about.vs.rand.langs",      accessKey: "about.vs.rand.access",      isSrc: false },
  { nameKey: "about.vs.chatham",   biasKey: "about.vs.chatham.bias",   speedKey: "about.vs.chatham.speed",   scoringKey: "about.vs.chatham.scoring",   langsKey: "about.vs.chatham.langs",   accessKey: "about.vs.chatham.access",   isSrc: false },
  { nameKey: "about.vs.cfr",       biasKey: "about.vs.cfr.bias",       speedKey: "about.vs.cfr.speed",       scoringKey: "about.vs.cfr.scoring",       langsKey: "about.vs.cfr.langs",       accessKey: "about.vs.cfr.access",       isSrc: false },
];

export function AboutView() {
  const { t: tr } = useLang();
  const { navigate } = useNavigation();

  return (
    <div>
      {/* Hero */}
      <div className="bg-[#0A2540] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <span className="text-xs font-bold tracking-[0.15em] uppercase text-[#E8272C] mb-3 block">
            {tr("about.hero.tag")}
          </span>
          <h1 className="heading-serif text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 max-w-2xl leading-tight">
            {tr("about.hero.title.1")}
            <br />
            {tr("about.hero.title.2")}
          </h1>
          <p className="text-base text-white/60 max-w-xl leading-relaxed">
            {tr("about.hero.desc")}
          </p>
        </div>
      </div>

      {/* The Problem */}
      <div className="bg-[#F4F6F9] dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <div className="max-w-3xl">
            <span className="text-xs font-bold tracking-[0.15em] uppercase text-[#E8272C] mb-3 block">
              {tr("about.problem.tag")}
            </span>
            <h2 className="heading-serif text-2xl sm:text-3xl font-bold text-[#0A2540] dark:text-white mb-5">
              {tr("about.problem.heading")}
            </h2>
            <p className="text-base text-gray-600 dark:text-gray-300 leading-relaxed">
              {tr("about.problem.body")}
            </p>
          </div>
        </div>
      </div>

      {/* Mission + Promise side-by-side */}
      <div className="bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
            {/* Mission */}
            <div>
              <span className="text-xs font-bold tracking-[0.15em] uppercase text-[#E8272C] mb-3 block">
                {tr("about.mission.tag")}
              </span>
              <h2 className="heading-serif text-2xl sm:text-3xl font-bold text-[#0A2540] dark:text-white mb-4">
                {tr("about.mission.heading")}
              </h2>
              <p className="text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                {tr("about.mission.body")}
              </p>
            </div>

            {/* Promise */}
            <div className="border-l-4 border-[#0A2540] dark:border-blue-400 pl-6">
              <span className="text-xs font-bold tracking-[0.15em] uppercase text-[#E8272C] mb-3 block">
                {tr("about.promise.tag")}
              </span>
              <h2 className="heading-serif text-2xl sm:text-3xl font-bold text-[#0A2540] dark:text-white mb-4">
                {tr("about.promise.heading")}
              </h2>
              <p className="text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                {tr("about.promise.body")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 5 Differentiators */}
      <div className="bg-[#F4F6F9] dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {DIFFERENTIATORS.map(({ icon: Icon, titleKey, descKey }, i) => (
              <div
                key={i}
                className={`bg-white dark:bg-slate-800 rounded-xl p-6 flex flex-col gap-3 ${
                  i === 4 ? "sm:col-span-2 lg:col-span-1" : ""
                }`}
              >
                <div className="w-10 h-10 rounded-lg bg-[#0A2540] flex items-center justify-center flex-shrink-0">
                  <Icon size={18} className="text-white" />
                </div>
                <h3 className="font-bold text-[#0A2540] dark:text-white text-sm">
                  {tr(titleKey)}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  {tr(descKey)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bias + AI commitments */}
      <div className="bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
            {/* Bias */}
            <div className="flex gap-5">
              <div className="flex-shrink-0 mt-1">
                <div className="w-10 h-10 rounded-lg bg-[#E8272C]/10 flex items-center justify-center">
                  <ShieldAlert size={18} className="text-[#E8272C]" />
                </div>
              </div>
              <div>
                <span className="text-xs font-bold tracking-[0.15em] uppercase text-[#E8272C] mb-2 block">
                  {tr("about.bias.tag")}
                </span>
                <h3 className="font-bold text-lg text-[#0A2540] dark:text-white mb-3">
                  {tr("about.bias.heading")}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  {tr("about.bias.body")}
                </p>
              </div>
            </div>

            {/* AI */}
            <div className="flex gap-5">
              <div className="flex-shrink-0 mt-1">
                <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                  <Bot size={18} className="text-[#0A2540] dark:text-blue-400" />
                </div>
              </div>
              <div>
                <span className="text-xs font-bold tracking-[0.15em] uppercase text-[#E8272C] mb-2 block">
                  {tr("about.ai.tag")}
                </span>
                <h3 className="font-bold text-lg text-[#0A2540] dark:text-white mb-3">
                  {tr("about.ai.heading")}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  {tr("about.ai.body")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison table */}
      <div className="bg-[#F4F6F9] dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <span className="text-xs font-bold tracking-[0.15em] uppercase text-[#E8272C] mb-3 block">
            {tr("about.vs.tag")}
          </span>
          <h2 className="heading-serif text-2xl sm:text-3xl font-bold text-[#0A2540] dark:text-white mb-8">
            {tr("about.vs.heading")}
          </h2>
          <div className="overflow-x-auto rounded-xl border border-[#D8DEE6] dark:border-slate-700">
            <table className="w-full text-sm font-variant-numeric-tabular">
              <thead>
                <tr className="bg-[#0A2540] text-white">
                  <th className="text-left px-4 py-3 font-semibold rounded-tl-xl">Institution</th>
                  <th className="text-left px-4 py-3 font-semibold">{tr("about.vs.bias")}</th>
                  <th className="text-left px-4 py-3 font-semibold">{tr("about.vs.speed")}</th>
                  <th className="text-left px-4 py-3 font-semibold">{tr("about.vs.scoring")}</th>
                  <th className="text-left px-4 py-3 font-semibold">{tr("about.vs.langs")}</th>
                  <th className="text-left px-4 py-3 font-semibold rounded-tr-xl">{tr("about.vs.access")}</th>
                </tr>
              </thead>
              <tbody>
                {VS_ROWS.map((row, i) => (
                  <tr
                    key={i}
                    className={
                      row.isSrc
                        ? "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-[#0A2540]"
                        : i % 2 === 0
                        ? "bg-white dark:bg-slate-800"
                        : "bg-[#F4F6F9] dark:bg-slate-900"
                    }
                  >
                    <td className={`px-4 py-3 font-semibold ${row.isSrc ? "text-[#0A2540] dark:text-blue-300" : "text-gray-800 dark:text-gray-200"}`}>
                      {tr(row.nameKey)}
                      {row.isSrc && (
                        <span className="ml-2 text-[10px] font-bold tracking-wide uppercase bg-[#0A2540] text-white px-1.5 py-0.5 rounded">
                          us
                        </span>
                      )}
                    </td>
                    <td className={`px-4 py-3 ${row.isSrc ? "text-[#0A2540] dark:text-blue-200 font-medium" : "text-gray-600 dark:text-gray-400"}`}>
                      {tr(row.biasKey)}
                    </td>
                    <td className={`px-4 py-3 ${row.isSrc ? "text-[#0A2540] dark:text-blue-200 font-medium" : "text-gray-600 dark:text-gray-400"}`}>
                      {tr(row.speedKey)}
                    </td>
                    <td className={`px-4 py-3 ${row.isSrc ? "text-[#0A2540] dark:text-blue-200 font-medium" : "text-gray-600 dark:text-gray-400"}`}>
                      {tr(row.scoringKey)}
                    </td>
                    <td className={`px-4 py-3 ${row.isSrc ? "text-[#0A2540] dark:text-blue-200 font-medium" : "text-gray-600 dark:text-gray-400"}`}>
                      {tr(row.langsKey)}
                    </td>
                    <td className={`px-4 py-3 ${row.isSrc ? "text-[#0A2540] dark:text-blue-200 font-medium" : "text-gray-600 dark:text-gray-400"}`}>
                      {tr(row.accessKey)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-[#0A2540] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 text-center">
          <h2 className="heading-serif text-2xl sm:text-3xl font-bold mb-4">
            {tr("about.cta.heading")}
          </h2>
          <p className="text-white/60 max-w-md mx-auto mb-8 text-base leading-relaxed">
            {tr("about.cta.body")}
          </p>
          <Button
            onClick={() => navigate("position")}
            className="bg-white text-[#0A2540] hover:bg-white/90 font-semibold px-6 py-3"
          >
            {tr("about.cta.button")}
          </Button>
        </div>
      </div>
    </div>
  );
}
