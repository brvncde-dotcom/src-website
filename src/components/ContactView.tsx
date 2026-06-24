"use client";

import { useState } from "react";
import { Send, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SwissCrossLogo } from "./SwissCrossLogo";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const INQUIRY_TYPES = [
  "General Inquiry",
  "Membership",
  "Media / Press",
  "Collaboration",
  "Expert Panel Application",
  "Technical Issue",
];

export function ContactView() {
  const [selectedType, setSelectedType] = useState<string | null>(null);

  return (
    <div>
      {/* Hero */}
      <div className="bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <div className="flex items-center gap-4 mb-4">
            <SwissCrossLogo size={28} className="opacity-80" />
            <span className="text-xs font-bold tracking-[0.15em] uppercase text-[#E8272C]">
              Reach Out
            </span>
          </div>
          <h1 className="heading-serif text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 max-w-xl">
            Contact SRC
          </h1>
          <p className="text-sm text-white/60 max-w-lg leading-relaxed">
            Whether you are interested in membership, have a media inquiry, or want to explore
            collaboration opportunities — we would like to hear from you.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-12 lg:gap-16">
          {/* Left: Contact info */}
          <div>
            <h2 className="heading-serif text-xl font-bold text-primary mb-6">
              Get in Touch
            </h2>

            <div className="space-y-5 mb-8">
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-[#E8272C] mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-primary mb-0.5">Email</h4>
                  <p className="text-sm text-muted-foreground">info@src.guide</p>
                </div>
              </div>
            </div>

            {/* Swiss identity block */}
            <div className="bg-secondary border border-border aspect-[4/3] flex items-center justify-center relative overflow-hidden">
              <SwissCrossLogo size={120} className="opacity-[0.06] absolute" />
              <div className="relative text-center">
                <SwissCrossLogo size={28} className="mx-auto mb-3 opacity-40" />
                <p className="text-xs font-medium text-muted-foreground">SRC — Security & Resilience Counsel</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Zug, Switzerland
                </p>
              </div>
            </div>
          </div>

          {/* Right: Contact form */}
          <div>
            <h2 className="heading-serif text-xl font-bold text-primary mb-6">
              Send a Message
            </h2>

            <div className="space-y-5">
              {/* Inquiry type */}
              <div>
                <Label className="text-xs font-medium text-muted-foreground mb-2 block">
                  Inquiry Type
                </Label>
                <div className="flex flex-wrap gap-2">
                  {INQUIRY_TYPES.map((type) => (
                    <button
                      key={type}
                      onClick={() => setSelectedType(type)}
                      className={`px-3 py-1.5 text-[11px] font-medium rounded-sm border transition-colors ${
                        selectedType === type
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border text-muted-foreground hover:border-primary/30 hover:text-primary"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    First Name
                  </Label>
                  <Input placeholder="First name" className="h-10 text-sm" />
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    Last Name
                  </Label>
                  <Input placeholder="Last name" className="h-10 text-sm" />
                </div>
              </div>

              <div>
                <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Email
                </Label>
                <Input type="email" placeholder="your@email.com" className="h-10 text-sm" />
              </div>

              <div>
                <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Organisation
                </Label>
                <Input placeholder="Your organisation (optional)" className="h-10 text-sm" />
              </div>

              <div>
                <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Message
                </Label>
                <Textarea
                  placeholder="How can we help?"
                  className="text-sm min-h-[120px] resize-none"
                />
              </div>

              <Button className="bg-primary hover:bg-primary/90 text-sm gap-2">
                <Send className="w-4 h-4" />
                Send Message
              </Button>

              <p className="text-[10px] text-muted-foreground leading-relaxed">
                By submitting this form, you agree to SRC&apos;s privacy policy. We will respond
                to your inquiry within 2 business days.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}