"use client";

import { useState } from "react";
import { Send, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SwissCrossLogo } from "./SwissCrossLogo";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useLang } from "./LangProvider";

const INQUIRY_KEYS = [
  "contact.inquiry.general",
  "contact.inquiry.membership",
  "contact.inquiry.media",
  "contact.inquiry.collaboration",
  "contact.inquiry.expert",
  "contact.inquiry.technical",
];

export function ContactView() {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const { t: tr } = useLang();

  return (
    <div>
      <div className="bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <div className="flex items-center gap-4 mb-4">
            <SwissCrossLogo size={28} className="opacity-80" />
            <span className="text-xs font-bold tracking-[0.15em] uppercase text-[#E8272C]">{tr("contact.tag")}</span>
          </div>
          <h1 className="heading-serif text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 max-w-xl">{tr("contact.title")}</h1>
          <p className="text-sm text-white/60 max-w-lg leading-relaxed">{tr("contact.subtitle")}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-12 lg:gap-16">
          <div>
            <h2 className="heading-serif text-xl font-bold text-primary mb-6">{tr("contact.info.title")}</h2>
            <div className="space-y-5 mb-8">
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-[#E8272C] mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-primary mb-0.5">{tr("contact.info.email")}</h4>
                  <p className="text-sm text-muted-foreground">info@src.guide</p>
                </div>
              </div>
            </div>
            <div className="bg-secondary border border-border aspect-[4/3] flex items-center justify-center relative overflow-hidden">
              <SwissCrossLogo size={120} className="opacity-[0.06] absolute" />
              <div className="relative text-center">
                <SwissCrossLogo size={28} className="mx-auto mb-3 opacity-40" />
                <p className="text-xs font-medium text-muted-foreground">{tr("contact.location")}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{tr("contact.city")}</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="heading-serif text-xl font-bold text-primary mb-6">{tr("contact.form.title")}</h2>
            <div className="space-y-5">
              <div>
                <Label className="text-xs font-medium text-muted-foreground mb-2 block">{tr("contact.form.type")}</Label>
                <div className="flex flex-wrap gap-2">
                  {INQUIRY_KEYS.map((key) => (
                    <button key={key} onClick={() => setSelectedType(key)} className={`px-3 py-1.5 text-[11px] font-medium rounded-sm border transition-colors ${selectedType === key ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/30 hover:text-primary"}`}>
                      {tr(key)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">{tr("contact.form.first-name")}</Label>
                  <Input placeholder={tr("contact.form.first-name.placeholder")} className="h-10 text-sm" />
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">{tr("contact.form.last-name")}</Label>
                  <Input placeholder={tr("contact.form.last-name.placeholder")} className="h-10 text-sm" />
                </div>
              </div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">{tr("contact.info.email")}</Label>
                <Input type="email" placeholder={tr("reports.gate.email.placeholder")} className="h-10 text-sm" />
              </div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">{tr("contact.form.organisation")}</Label>
                <Input placeholder={tr("contact.form.organisation.placeholder")} className="h-10 text-sm" />
              </div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">{tr("contact.form.message")}</Label>
                <Textarea placeholder={tr("contact.form.message.placeholder")} className="text-sm min-h-[120px] resize-none" />
              </div>
              <Button className="bg-primary hover:bg-primary/90 text-sm gap-2">
                <Send className="w-4 h-4" />{tr("contact.form.send")}
              </Button>
              <p className="text-[10px] text-muted-foreground leading-relaxed">{tr("contact.form.disclaimer")}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}