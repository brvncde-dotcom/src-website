# SRC Advisory Membership Model: Comprehensive Requirements Analysis

## Document Information
- **Project**: SRC Advisory — Membership Model Redesign
- **Client**: Security & Resilience Counsel (SRC), Zug, Switzerland
- **Date**: July 2026
- **Document Type**: Requirements Analysis
- **Research Dimensions**: 12 (Think tanks, intelligence services, premium media, pricing psychology, expert access, AI video, newsletters, corporate membership, technical platform)

---

# Part I: Explicit Requirements Extraction

## 1.1 User Query Decomposition

### Core Mandate
> "Introduce several member types: free, basic, premium, expert"

| Requirement ID | Source | Requirement | Priority |
|---|---|---|---|
| R-001 | Explicit | Implement 4-tier membership: Free, Basic, Premium, Expert | Must-Have |
| R-002 | Explicit | Opinions must be free for all registered free users | Must-Have |
| R-003 | Explicit | Basic Reports must be free for all registered free users | Must-Have |
| R-004 | Explicit | "More" content tier for next member classes above Free | Must-Have |
| R-005 | Explicit | Expert tier: Video calls participation | Must-Have |
| R-006 | Explicit | Expert tier: Exclusive Briefings access | Must-Have |
| R-007 | Explicit | Expert tier: Premium content access | Must-Have |
| R-008 | Explicit | Expert tier: Early content access | Must-Have |
| R-009 | Explicit | Expert tier: Breaking news (super important) | Must-Have |
| R-010 | Explicit | vAvatar — Video Section with avatar-based video content | Must-Have |
| R-011 | Explicit | Expert Interviews section | Must-Have |
| R-012 | Explicit | Studies section (deeper analytical products) | Must-Have |
| R-013 | Explicit | Research world's leading think-tanks, media for best practice | Must-Have |
| R-014 | Explicit | Build perfect model aligned to SRC purpose | Must-Have |

### Content Gating Specified in Query

```
Tier      | Opinions | Reports     | Exclusive Briefings | Studies | Video (vAvatar) | Interviews | Video Calls | Early Access | Breaking News
----------|----------|-------------|---------------------|---------|-----------------|------------|-------------|--------------|--------------
Free      |   YES    | Base Version|         NO          |   NO    |       NO        |    NO      |     NO      |     NO       |      NO
Basic     |   YES    | MORE content|         NO          |   NO    |   Limited       |    NO      |     NO      |     NO       |      NO
Premium   |   YES    | MORE content|         YES         |   YES   |       YES       |    YES     |     NO      |     NO       |      NO
Expert    |   YES    | FULL access |         YES         |   YES   |       YES       |    YES     |     YES     |     YES      |      YES
```

---

## 1.2 SRC Context Requirements

| Requirement ID | Source | Requirement | Priority |
|---|---|---|---|
| R-015 | Context | Swiss-based (Zug) — pricing in CHF | Must-Have |
| R-016 | Context | Independent think tank positioning | Must-Have |
| R-017 | Context | Non-partisan, Swiss neutrality principles | Must-Have |
| R-018 | Context | Focus: Digital Power & AI, Geopolitics & Hard Security | Must-Have |
| R-019 | Context | AI-Augmented Speed + Expert-Validated Rigour methodology | Must-Have |
| R-020 | Context | 6 Focus Areas: Digital Power & AI; Geopolitics & Hard Security; Energy & Resources; Climate, Environment & Food; Economy & Competitiveness; Society, Migration & Institutions | Must-Have |
| R-021 | Context | Multilingual support (EN/DE/FR/IT) | Must-Have |
| R-022 | Context | Member Portal already exists — requires feature integration | Must-Have |
| R-023 | Context | 10-day free trial already offered — must be redesigned into tiered model | Must-Have |
| R-024 | Context | Currently has 19+ published reports across all pillars | Nice-to-Have |
| R-025 | Context | Must maintain editorial independence from corporate influence | Must-Have |

---

# Part II: Implicit Requirements Extraction

## 2.1 From Competitive Research — Think Tank Freemium Models

### 2.1.1 Council on Foreign Relations (CFR) [^133^]
| Implicit Requirement | Evidence | Priority |
|---|---|---|
| R-026: Individual life membership with nomination process signals prestige tiering | Life/Term membership distinction at $100K+ Gold corporate level | Should-Have |
| R-026a: Corporate membership at 3 levels (Gold $100K, Silver $75K, Bronze $50K) | Three-tier corporate model for organizational clients | Must-Have |
| R-027: ~1,000 events annually — event access as tier differentiator | "Convening nearly one thousand events annually" | Should-Have |
| R-028: CEO Summit and exclusive dinners for top-tier members | "Companies at top levels access exclusive CEO events" | Should-Have |
| R-029: Term membership (age 30-36) as young professional pipeline | "Stephen M. Kellen Term Member Program" — 5-year fixed term | Should-Have |

### 2.1.2 Chatham House [^29^][^33^]
| Implicit Requirement | Evidence | Priority |
|---|---|---|
| R-030: Individual membership at GBP 195-345/year — price anchoring at mid-tier | Full: GBP 345/year + GBP 50 join fee; Associate: GBP 195/year + GBP 50 | Must-Have |
| R-031: "Under 30" concession tier at GBP 220 — young professional strategy | Same benefits at 36% discount for under-30s | Should-Have |
| R-032: Student tier at GBP 190 — no joining fee | Full-time student discount eliminates barrier | Should-Have |
| R-033: Major Corporate tier with risk briefings under Chatham House Rule | "Regular briefings on emerging geopolitical risk, held under Chatham House Rule" | Must-Have |
| R-034: 120+ on-record events plus flagship conferences | Invitations to major policy speeches, Q&As with heads of state | Should-Have |
| R-035: Virtual AND in-person event access as separate benefits | Full: 100 in-person events + all online; Associate: online only | Should-Have |
| R-036: eLibrary with 2,000+ journals as content asset | Access to thousands of world newspapers and journals | Should-Have |

### 2.1.3 Brookings Institution
| Implicit Requirement | Evidence | Priority |
|---|---|---|
| R-037: Free content strategy — 85%+ of content publicly accessible | Brookings makes vast majority free to maintain policy influence | Must-Have |
| R-038: Named sponsorships for research programs | Corporate funding through program sponsorship | Nice-to-Have |
| R-039: Annual reports as prestige publications | Flagship publications drive premium perception | Should-Have |

### 2.1.4 CSIS (Center for Strategic and International Studies)
| Implicit Requirement | Evidence | Priority |
|---|---|---|
| R-040: Commission work as premium/B2B offering | CSIS commissions research for specific clients | Should-Have |
| R-041: Priority access to events for "Chairman's Circle" members | Inner-circle tiering for highest donors | Should-Have |

### 2.1.5 IISS (International Institute for Strategic Studies) [^31^]
| Implicit Requirement | Evidence | Priority |
|---|---|---|
| R-042: Fellowship tier for distinguished professionals | Fellowship conferred upon Advisory Council approval | Should-Have |
| R-043: Student membership as pipeline tier | Reduced-rate student tier for pipeline building | Should-Have |

---

## 2.2 From Intelligence Service Research

### 2.2.1 Oxford Analytica [^79^][^121^]
| Implicit Requirement | Evidence | Priority |
|---|---|---|
| R-044: Annual subscription $10,000-$20,000 for enterprise clients | "Standard annual subscriptions span $10,000 to $20,000" | Reference |
| R-045: Qualitative geopolitical forecasting as premium product | "Exceptional academic rigor; forward-looking scenario analyses" | Must-Have |
| R-046: Bespoke consulting services above subscription tier | Consulting scales above standard subscription pricing | Should-Have |
| R-047: Decision-oriented outputs (briefings, scenarios, strategic assessments) | Executive and risk committee workflow integration | Must-Have |

### 2.2.2 RANE/Stratfor Model
| Implicit Requirement | Evidence | Priority |
|---|---|---|
| R-048: Risk intelligence platform with tiered access | Stratfor's core model: Free briefs → Paid analysis → Enterprise risk intelligence | Must-Have |
| R-049: Security intelligence feeds as real-time premium product | Breaking news and threat alerts as top-tier differentiator | Must-Have |
| R-050: Client advisory services at enterprise level | Direct analyst access as highest-tier benefit | Must-Have |

---

## 2.3 From Premium Media Paywall Research

### 2.3.1 Financial Times [^1071^][^48^]
| Implicit Requirement | Evidence | Priority |
|---|---|---|
| R-051: Premium Digital at $75/month — high-anchor pricing | "Complete coverage $75 per month. Complete digital access on any device" | Reference |
| R-052: 50% discounted first-year pricing (GBP 159 vs GBP 319) | Trial discount as conversion strategy | Should-Have |
| R-053: Hard paywall model — all content locked after limited preview | Hard paywall combined with registration wall | Reference |

### 2.3.2 The Economist [^52^]
| Implicit Requirement | Evidence | Priority |
|---|---|---|
| R-054: First month free trial for monthly plan | "Monthly: First month free" — reduces trial friction | Should-Have |
| R-055: Annual save messaging (Save GBP 83.70) | Price framing showing savings vs monthly | Should-Have |
| R-056: Bundled value-adds (NYT complimentary access) | "Includes complimentary access to The New York Times for a year" | Should-Have |
| R-057: Podcast and narrated stories as format differentiation | "All podcasts, narrated stories and exclusive newsletters" | Should-Have |
| R-058: Digital edition archive access (1997-today) | Deep archive as retention asset | Should-Have |

### 2.3.3 Foreign Affairs (CFR) [^226^][^143^]
| Implicit Requirement | Evidence | Priority |
|---|---|---|
| R-059: Three subscription tiers: Digital / All Access / Print | Digital at $39.99; All Access at $44.99-$56.99 | Must-Have |
| R-060: 3 free articles for new users before paywall | Free preview as acquisition tool | Must-Have |
| R-061: Student discount tier | "Unlimited digital access at a special discount for students" | Should-Have |
| R-062: Group/institutional subscription plans | "Foreign Affairs develops unique group subscription plans" | Must-Have |
| R-063: Audio format (narrated articles) as premium feature | "Six digital issues available in Audio, PDF, and other digital formats" | Must-Have |
| R-064: Archive access as retention driver | "Over a century of archives" — 1922 to present | Should-Have |
| R-065: Subscriber-only newsletters as engagement tool | Regular newsletters to maintain touchpoint | Must-Have |

### 2.3.4 Foreign Policy [^1073^]
| Implicit Requirement | Evidence | Priority |
|---|---|---|
| R-066: Quarterly trial at 67% off ($19.99 for 90 days) | Aggressive trial pricing to reduce friction | Should-Have |
| R-067: FP Insider tier — ad-free + exclusive content | Premium tier with experiential benefits | Should-Have |

---

## 2.4 From Pricing Psychology Research [^749^][^750^][^318^][^1079^]

| Implicit Requirement | Evidence | Priority |
|---|---|---|
| R-068: CHF charm pricing (.90/.95 endings) — CHF 99.95 vs CHF 100 | "CHF 99.– instead of CHF 100.– makes an offer more attractive" | Must-Have |
| R-069: Three-tier anchoring: Premium at CHF 299 makes CHF 149 look attractive | "Displaying premium at CHF 299.– first makes CHF 149.– more attractive" | Should-Have |
| R-070: "Recommended" or "Most Popular" badge on preferred tier | Visual highlighting guides choice to target tier | Must-Have |
| R-071: Bilingual pricing display (fr-CH and en-CH formatting) | Swiss market requires both French and English pricing display | Must-Have |
| R-072: Price anchoring — show highest price first | "When we use the principle of a price anchor, we should show the anchor first" | Should-Have |
| R-073: Value framing — show savings vs monthly for annual plans | Headspace model: annual displayed as "best value" | Should-Have |
| R-074: Clear pricing comparison table on signup page | "Clear pricing communication and well-structured displays can increase conversions by 30%" | Must-Have |
| R-075: Avoid charging for previously free content (Bawa & Shoemaker) | "Avoid charging for things which customers received for free previously" | Must-Have |

---

## 2.5 From Freemium Model Best Practices [^235^][^1076^][^1077^][^237^]

| Implicit Requirement | Evidence | Priority |
|---|---|---|
| R-076: Free tier must deliver genuine value while leaving clear gap | "The free version should be useful enough that users develop a habit" | Must-Have |
| R-077: Conversion rate target: 2-5% average, 6-8% strong | "Freemium conversion rate of 2-5% is considered average" | Reference |
| R-078: Hybrid model combining freemium + free trial | "Many successful businesses use a hybrid approach" | Should-Have |
| R-079: Key ROI Feature — identify and drive users to most valuable feature | Spotify model: drive users to key activation feature | Should-Have |
| R-080: Gate "next step" features, not core value | Spotify: free gets all music, but no offline/shuffle control | Must-Have |
| R-081: Make premium features visible to free users (show what they miss) | "Don't hide the pro features from users. Make sure they know what they could get" | Must-Have |
| R-082: Referral/viral loop for acquisition | Referral program to incentivize users to promote | Nice-to-Have |
| R-083: Free tier as marketing channel — monetize via ads if large enough | "You can also monetise a free audience if it's large enough" | Nice-to-Have |

---

# Part III: Deliverables Requirements Specification

## 3.1 Deliverable 1: 4-Tier Membership Model (Free → Basic → Premium → Expert)

### Hierarchical Structure

```
H1: SRC Membership Architecture
  H2: FREE TIER — "Registered Member" (Acquisition)
    H3: Price: CHF 0 (registration required)
    H3: Content Access
      H4: All Opinions — full access, no restrictions [R-002]
      H4: Reports — Base Version only (abstract + key findings, ~20% of content) [R-003]
      H4: Monthly newsletter (general edition) [R-065]
      H4: 3 free report previews per month (paywall preview) [R-060]
    H3: Platform Features
      H4: Member Portal access (basic)
      H4: Save/bookmark articles
      H4: Comment on Opinions (community engagement)
      H4: Topic preference settings
    H3: Trial Conversion Mechanism
      H4: 10-day free trial of Premium features (existing mechanism redesign) [R-023]
      H4: "Upgrade to see full report" paywall triggers on premium content
      H4: Weekly email showing what was missed (gated content digest)

  H2: BASIC TIER — "Core Member" (Engagement)
    H3: Price: CHF 29.90/month or CHF 299/year (1 month free with annual) [R-068]
    H3: Content Access
      H4: All Opinions — full access [R-002]
      H4: Reports — MORE content (executive summary + analysis section, ~60% of content) [R-004]
      H4: Monthly newsletter (expanded edition with data visualizations)
      H4: Weekly briefings digest (email roundups)
    H3: Platform Features
      H4: All Free tier features
      H4: Download reports (PDF)
      H4: Full-text search across all content
      H4: Custom alert keywords (up to 3 topics)
      H4: Mobile app access (if available)
    H3: Upgrade Triggers
      H4: Studies content locked behind "Upgrade to Premium" gate
      H4: Video sections show 30-sec previews only
      H4: Briefings listed but locked

  H2: PREMIUM TIER — "Intelligence Member" (Retention)
    H3: Price: CHF 79.90/month or CHF 799/year (2 months free with annual) [R-068]
    H3: Content Access
      H4: All Opinions — full access [R-002]
      H4: Reports — FULL access (complete reports + methodology + data annexes) [R-004]
      H4: Exclusive Briefings — full access [R-006]
      H4: Studies — full access (deep-dive analytical products) [R-011]
      H4: Video Section (vAvatar) — full access with AI-generated expert video content [R-010]
      H4: Interviews — expert interviews with transcripts [R-011]
      H4: Premium newsletter (exclusive analysis + forecasts)
      H4: 6-month content archive (rolling access)
    H3: Platform Features
      H4: All Basic tier features
      H4: Custom alert keywords (unlimited)
      H4: Report download with data annexes (Excel/CSV)
      H4: Share reports (limited team sharing links)
      H4: Personal research dashboard
      H4: Weekly video briefing digest (vAvatar highlights)
    H3: Event & Community Access
      H4: Access to monthly virtual briefings (viewer-only)
      H4: Priority registration for public events
      H4: Access to member discussion forums

  H2: EXPERT TIER — "Strategic Partner" (High-Value)
    H3: Price: CHF 299/month or CHF 2,999/year (2 months free + exclusive benefits) [R-068]
    H3: Content Access
      H4: ALL content from Premium tier
      H4: Early Access — reports and briefings 48-72 hours before general release [R-008]
      H4: Breaking News Alerts — real-time intelligence alerts for critical developments [R-009]
      H4: Premium content not available to lower tiers [R-007]
      H4: Full content archive (no time limit)
      H4: Bespoke research requests (limited per year)
    H3: Direct Expert Access
      H4: Video Calls — quarterly 1:1 video consultations with SRC analysts [R-005]
      H4: Exclusive Briefings — invitation-only monthly video briefings with Q&A [R-006]
      H4: Direct messaging channel to SRC expert panel
      H4: Annual strategy consultation session (half-day)
    H3: Event & Community Access
      H4: All Premium virtual briefing access + interactive Q&A participation
      H4: Invitation to in-person events (Zug/London/Geneva) under Chatham House Rule
      H4: Member directory access (networking with other Expert tier members)
      H4: Guest passes (2 per year) for events
    H3: Recognition & Status
      H4: "Strategic Partner" badge on Member Portal
      H4: Annual recognition in SRC Impact Report
      H4: Input on SRC research agenda (annual priority survey)
```

---

## 3.2 Deliverable 2: Content Gating Architecture

### Hierarchical Structure

```
H1: Content Gating Matrix
  H2: Opinions (All Tiers)
    H3: Free: Full text, no registration gate after initial signup
    H3: Rationale: Opinions as thought leadership and SEO acquisition channel [R-075]
    H3: Monetization: Contextual upgrade CTAs embedded in content, not paywall blocking

  H2: Reports (Tiered Access)
    H3: Base Version (Free)
      H4: Abstract (250 words)
      H4: 3 Key Findings (bullet points)
      H4: "SRC Take" summary paragraph (100 words)
      H4: Full report locked — "Core Members see 60% more" upgrade prompt
    H3: Expanded Version (Basic)
      H4: Base Version content
      H4: Executive Summary (full)
      H4: Main Analysis section (excluding data annexes)
      H4: Key charts and visualizations
      H4: Methodology note
      H4: Studies content locked — "Intelligence Members get full studies access"
    H3: Complete Version (Premium+)
      H4: Expanded Version content
      H4: Data Annexes (Excel downloads)
      H4: Full Methodology
      H4: Expert interview transcripts (where applicable)
      H4: Related reading recommendations (AI-curated)

  H2: Studies (Premium+)
    H3: Free/Basic: Title + abstract only (teaser)
    H3: Premium: Full study access (5,000-15,000 word deep analysis)
    H3: Expert: Studies + raw data + supplementary research materials

  H2: Exclusive Briefings (Premium+)
    H3: Free/Basic: Title + 2-sentence summary only
    H3: Premium: Full briefing text + audio narration
    H3: Expert: Full briefing + live video briefing participation + Q&A archive

  H2: Video Section — vAvatar (Premium+)
    H3: Free/Basic: 30-second preview clips only (upgrade prompt at end)
    H3: Premium: Full vAvatar videos (AI-generated expert avatars delivering analysis)
    H3: Expert: Full videos + request custom vAvatar briefings (limited)
    H3: Content Types:
      H4: Weekly vAvatar Briefing (Monday morning geopolitical roundup)
      H4: Breaking vAvatar Alert (critical event analysis within 4 hours)
      H4: vAvatar Deep Dive (thematic video analysis, 10-15 minutes)
      H4: vAvatar Interview (simulated expert dialogues on key topics)

  H2: Interviews (Premium+)
    H3: Free/Basic: Excerpt transcript (200 words) + audio clip (2 minutes)
    H3: Premium: Full interview transcript + full audio + video (if recorded)
    H3: Expert: Full interview + opportunity to suggest future interview subjects

  H2: Breaking News / Early Access (Expert Only)
    H3: Free/Basic/Premium: Standard publication schedule
    H3: Expert: 48-72 hour early access to all reports and briefings [R-008]
    H3: Expert: Real-time Breaking News alerts via push notification + email + SMS [R-009]
    H3: Expert: Weekly "Week Ahead" preview briefings (Sunday evening)

  H2: Video Calls (Expert Only)
    H3: Quarterly 1:1 video consultation with SRC analyst (30 minutes) [R-005]
    H3: Monthly Expert Briefing (group video call, 60 minutes, Chatham House Rule) [R-006]
    H3: Annual half-day strategy session (in-person in Zug or virtual)
```

---

## 3.3 Deliverable 3: Pricing Structure with CHF Pricing

### Hierarchical Structure

```
H1: Pricing Architecture
  H2: Individual Membership Pricing
    H3: Free Tier
      H4: Price: CHF 0 (registration required)
      H4: No payment method required
      H4: No time limit (permanent free access)
      H4: Positioning: "Start exploring SRC intelligence"

    H3: Basic — "Core Member"
      H4: Monthly: CHF 29.90/month [R-068]
      H4: Annual: CHF 299/year (equivalent to ~CHF 24.90/month, 17% savings) [R-068]
      H4: First month: 50% off (CHF 14.95) for new subscribers
      H4: Positioning: "Deeper analysis for engaged professionals"
      H4: Price anchor: ~1 coffee per day in Switzerland

    H3: Premium — "Intelligence Member"
      H4: Monthly: CHF 79.90/month [R-068]
      H4: Annual: CHF 799/year (equivalent to ~CHF 66.60/month, 17% savings)
      H4: Trial: 10-day free trial (existing mechanism preserved) [R-023]
      H4: Annual bonus: 2 months free + exclusive annual report
      H4: Positioning: "Complete intelligence for decision-makers"
      H4: Price anchor: Less than The Economist (CHF 279/year) for specialized intelligence
      H4: RECOMMENDED tier (visual badge) [R-070]

    H3: Expert — "Strategic Partner"
      H4: Monthly: CHF 299/month [R-068]
      H4: Annual: CHF 2,999/year (equivalent to ~CHF 249.90/month, 16% savings)
      H4: Application: Invitation or application with vetting (preserves exclusivity) [R-026]
      H4: Onboarding: Personal onboarding call with SRC team
      H4: Positioning: "Direct access to SRC's expert network"
      H4: Price reference: 70% below Oxford Analytica ($10K-$20K/year) [^79^]

  H2: Special Pricing Categories
    H3: Student Tier
      H4: Price: CHF 99/year (67% off Basic) [R-032]
      H4: Access: Equivalent to Basic tier
      H4: Eligibility: Full-time students with .edu/academic email
      H4: Duration: Maximum 4 years (requires annual verification)

    H3: Young Professional (Under 30)
      H4: Price: CHF 199/year (33% off Basic) [R-031]
      H4: Access: Equivalent to Basic tier
      H4: Eligibility: Age verification at signup
      H4: Upgrade path: Auto-renews at full Basic price after age 30

    H3: Startup/SME Tier
      H4: Price: CHF 499/year (37% off Premium) [R-031]
      H4: Access: Equivalent to Premium tier for 1-3 person teams
      H4: Eligibility: Companies with <50 employees
      H4: Requires company email domain verification

  H2: Pricing Psychology Implementation [^749^][^750^][^1079^]
    H3: Charm Pricing
      H4: All prices end in .90 (Swiss professional services convention) [R-068]
      H4: Annual prices: CHF 299, CHF 799, CHF 2,999 (left-digit effect)
    H3: Anchoring Strategy
      H4: Display Expert tier first (CHF 299/month) → Premium looks attractive [R-072]
      H4: Show "Value" comparison: Oxford Analytica starts at $10K/year vs SRC Expert at CHF 2,999
      H4: Monthly prices shown smaller, annual prices prominently displayed with "SAVE X%" badge
    H3: Decoy Effect
      H4: Position Premium as the clear value choice between Basic and Expert
      H4: Basic: "Good"; Premium: "Best Value" (badge); Expert: "Most Comprehensive"
    H3: Framing
      H4: Daily cost framing: Premium = "Less than CHF 2.70/day" (cheaper than a coffee)
      H4: Perception anchoring: "Complete intelligence suite for less than a daily espresso"
```

---

## 3.4 Deliverable 4: Feature Matrix per Tier

### Required Table

```
H1: Feature Comparison Matrix (Table: src_feature_matrix)

| Feature Category | Feature | Free | Basic | Premium | Expert |
|---|---|---|---|---|---|
| CONTENT | Opinions (Full Text) | YES | YES | YES | YES |
| CONTENT | Reports — Base Version (Abstract + Key Findings) | YES | YES | YES | YES |
| CONTENT | Reports — Expanded (Executive Summary + Analysis) | NO | YES | YES | YES |
| CONTENT | Reports — Complete (+ Data Annexes, Methodology) | NO | NO | YES | YES |
| CONTENT | Studies (Deep-Dive Analysis) | NO | NO | YES | YES |
| CONTENT | Exclusive Briefings (Text) | NO | NO | YES | YES |
| CONTENT | Video Section (vAvatar) — Full Access | NO | NO | YES | YES |
| CONTENT | Expert Interviews (Full Transcript + Audio/Video) | NO | NO | YES | YES |
| CONTENT | Content Archive Access | 30 days | 90 days | 6 months | Unlimited |
| CONTENT | Early Access (48-72h before release) | NO | NO | NO | YES |
| CONTENT | Breaking News Alerts | NO | NO | NO | YES |
| CONTENT | Bespoke Research Requests | NO | NO | NO | YES (4/year) |
| PLATFORM | Member Portal Access | Basic | Standard | Advanced | Bespoke |
| PLATFORM | Save/Bookmark Content | YES | YES | YES | YES |
| PLATFORM | Comment on Content | YES | YES | YES | YES |
| PLATFORM | Full-Text Search | Limited | YES | YES | YES |
| PLATFORM | PDF Report Download | NO | YES | YES | YES |
| PLATFORM | Data Annex Download (Excel/CSV) | NO | NO | YES | YES |
| PLATFORM | Custom Alert Keywords | 1 topic | 3 topics | Unlimited | Unlimited + Priority |
| PLATFORM | Mobile App Access | NO | YES | YES | YES |
| PLATFORM | Research Dashboard | NO | NO | YES | YES (Customized) |
| PLATFORM | Share Reports (Team Links) | NO | NO | YES (5/month) | YES (Unlimited) |
| EXPERT ACCESS | Monthly Video Briefings (Viewer) | NO | NO | YES | YES + Interactive Q&A |
| EXPERT ACCESS | Quarterly 1:1 Video Call | NO | NO | NO | YES (30 min) |
| EXPERT ACCESS | Direct Analyst Messaging | NO | NO | NO | YES |
| EXPERT ACCESS | Annual Strategy Session | NO | NO | NO | YES (Half-day) |
| EXPERT ACCESS | Input on Research Agenda | NO | NO | NO | YES |
| COMMUNITY | Member Discussion Forums | NO | NO | YES | YES |
| COMMUNITY | Member Directory Access | NO | NO | NO | YES |
| COMMUNITY | Event Guest Passes | NO | NO | NO | YES (2/year) |
| EVENTS | Public Event Registration | Standard | Priority | Priority | VIP |
| EVENTS | Virtual Briefings | NO | NO | YES | YES + Q&A |
| EVENTS | In-Person Events (Chatham House Rule) | NO | NO | NO | YES |
| RECOGNITION | Profile Badge | — | Core | Intelligence | Strategic Partner |
| RECOGNITION | Annual Impact Report Mention | NO | NO | NO | YES |
| NEWSLETTER | General Newsletter | YES | YES | YES | YES |
| NEWSLETTER | Expanded Newsletter | NO | YES | YES | YES |
| NEWSLETTER | Premium Analysis Newsletter | NO | NO | YES | YES |
| NEWSLETTER | Breaking News Alerts | NO | NO | NO | YES |
| NEWSLETTER | Week Ahead Preview | NO | NO | NO | YES |
```

---

## 3.5 Deliverable 5: Expert Tier Deep Specification

### Hierarchical Structure

```
H1: Expert Tier — "Strategic Partner" Detailed Specification
  H2: Value Proposition
    H3: Positioning: "Not just content — direct access to the SRC expert network"
    H3: Target audience: C-suite executives, government officials, institutional investors, risk managers, senior policy advisors
    H3: Core promise: "Your personal intelligence partnership"

  H2: Video Calls Architecture
    H3: Quarterly 1:1 Analyst Consultation [R-005]
      H4: Format: 30-minute video call (Zoom/Teams, or in-person in Zug)
      H4: Scheduling: Self-service booking with 3-day advance requirement
      H4: Preparation: Pre-call questionnaire to maximize value
      H4: Follow-up: Written summary of key points within 48 hours
      H4: Topics: Client's choice — can cover any SRC focus area
      H4: Rollover: Unused calls expire quarterly (no accumulation)
    H3: Monthly Expert Briefing (Group) [R-006]
      H4: Format: 60-minute video conference, Chatham House Rule
      H4: Schedule: First Tuesday of each month, 16:00 CET
      H4: Content: "Behind the Analysis" — SRC analysts discuss current developments not yet published
      H4: Q&A: 20-minute interactive Q&A session
      H4: Recording: Available to Expert tier members within 24 hours
      H4: Attendance: Maximum 25 participants per session (intimacy preserved)
    H3: Annual Strategy Session
      H4: Format: Half-day (4 hours) in Zug or virtual
      H4: Content: Bespoke strategic intelligence assessment for member's organization
      H4: Deliverable: Written strategic memo within 5 business days
      H4: Scheduling: Coordinated 4-6 weeks in advance

  H2: Content Differentiation
    H3: Early Access Protocol [R-008]
      H4: All reports available 48-72 hours before lower tiers
      H4: Exclusive "Week Ahead" Sunday evening preview briefing
      H4: Quarterly "Pipeline Preview" — upcoming research agenda preview
    H3: Breaking News Alerts [R-009]
      H4: Channel: Push notification (app) + email + optional SMS
      H4: Speed: Within 2 hours of critical development
      H4: Content: Initial assessment + "what to watch" guidance
      H4: Follow-up: Full analysis within 24 hours
      H4: Definition of "Breaking": Geopolitical crises, security incidents, major policy shifts, market-moving events
    H3: Bespoke Research
      H4: Allocation: 4 requests per year (quarterly)
      H4: Scope: Single-issue analysis (up to 2,000 words)
      H4: Turnaround: 10 business days
      H4: Format: Written memo + optional 15-min follow-up call
      H4: Limitations: Not for consulting engagements; research scope only

  H2: Community & Recognition
    H3: "Strategic Partner" Digital Badge
    H3: Annual SRC Impact Report acknowledgment (optional, opt-in)
    H3: Research Agenda Input — annual priority-setting survey
    H3: Member Directory — opt-in networking with other Expert members
    H3: 2 Annual Event Guest Passes for colleagues/associates
    H3: Invitation to Annual SRC Expert Gathering (in-person, Zug)

  H2: Onboarding & Service
    H3: Personal onboarding call (30 min) within 5 days of signup
    H3: Dedicated account manager (email response within 4 hours)
    H3: Quarterly check-in emails
    H3: Annual membership review and feedback session
```

---

## 3.6 Deliverable 6: vAvatar Video Section Strategy

### Hierarchical Structure

```
H1: vAvatar Video Section — AI-Powered Video Intelligence
  H2: Concept Definition
    H3: "vAvatar" = AI-generated expert avatar delivering SRC analysis in video format
    H3: Value proposition: "Expert intelligence, delivered as a briefing"
    H3: Differentiation: First think tank to offer AI-augmented video intelligence at scale
    H3: Technology: AI avatar generation (e.g., Synthesia, HeyGen) + SRC expert scripts
    H3: Quality standard: "Expert-validated scripts, AI-delivered presentation"

  H2: vAvatar Content Types
    H3: vAvatar Weekly Briefing
      H4: Frequency: Every Monday, 08:00 CET
      H4: Duration: 8-12 minutes
      H4: Content: Weekend geopolitical developments + week ahead preview
      H4: Format: Single avatar, desk setup, with key visual overlays
      H4: Access: Premium + Expert tiers
    H3: vAvatar Breaking Alert
      H4: Frequency: As needed (target: <5 per month)
      H4: Duration: 3-5 minutes
      H4: Content: Critical event analysis within 4 hours of occurrence
      H4: Format: Single avatar, urgent visual treatment
      H4: Access: Expert tier only (first 24 hours); Premium after 24h
    H3: vAvatar Deep Dive
      H4: Frequency: Bi-weekly
      H4: Duration: 15-20 minutes
      H4: Content: Thematic analysis (e.g., "AI Governance in 2026", "D-A-CH Energy Security")
      H4: Format: Single or dual avatar (simulated expert dialogue)
      H4: Access: Premium + Expert tiers
    H3: vAvatar Interview
      H4: Frequency: Monthly
      H4: Duration: 20-30 minutes
      H4: Content: Simulated expert dialogue on major topics
      H4: Format: Two avatars in conversation format (interviewer + expert)
      H4: Access: Premium + Expert tiers
    H3: vAvatar Expert Exclusive (Expert Tier)
      H4: Frequency: Monthly
      H4: Duration: 30-45 minutes
      H4: Content: Live-recorded expert briefing with real SRC analysts (not avatar)
      H4: Format: Real expert panel discussion
      H4: Access: Expert tier only

  H2: Technical Implementation
    H3: Video delivery: HLS streaming for adaptive quality
    H3: Platform integration: Embedded in Member Portal + mobile app
    H3: Transcripts: AI-generated, human-reviewed, available as text
    H3: Subtitles: EN/DE/FR/IT (AI translation, expert-reviewed for key content)
    H3: Download: Premium+ tiers can download for offline viewing
    H3: Search: Video transcripts fully searchable

  H2: Production Workflow
    H3: Script: SRC analyst writes briefing script (2-3 hours)
    H3: Review: Second analyst validates (1 hour)
    H3: Avatar generation: AI platform renders video (15-30 min processing)
    H3: Post-production: Add visuals, lower thirds, branding (1 hour)
    H3: Quality check: Final review and publish (30 min)
    H3: Total turnaround: 6-8 hours from script to publish

  H2: Free Tier Preview Strategy [R-081]
    H3: All vAvatar videos show 30-second preview clip
    H3: At end of preview: "Intelligence Members get the full briefing — upgrade now"
    H3: Preview clips distributed on social media as acquisition content
    H3: YouTube/LinkedIn presence for SEO and brand awareness
```

---

## 3.7 Deliverable 7: Conversion Funnel Design

### Hierarchical Structure

```
H1: Membership Conversion Funnel
  H2: Funnel Architecture
    H3: Stage 1: Awareness (Free Content → Registration)
      H4: Channel 1: Opinions (free, SEO-optimized, shareable)
      H4: Channel 2: Social media distribution of vAvatar previews
      H4: Channel 3: Newsletter (free tier, weekly digest)
      H4: Channel 4: Events (public, with upgrade messaging)
      H4: Conversion action: Free registration (email capture)
      H4: Target: 10,000+ registered free members within 12 months

    H3: Stage 2: Activation (Free → Trial)
      H4: Mechanism: 10-day free Premium trial [R-023]
      H4: Trigger 1: After reading 3 report abstracts → "Start trial to unlock"
      H4: Trigger 2: Weekly "What You Missed" email showing gated content
      H4: Trigger 3: Contextual upgrade prompts at content paywalls [R-080]
      H4: Trial experience: Full Premium access for 10 days
      H4: Target: 20%+ trial start rate from active free users

    H3: Stage 3: Conversion (Trial → Paid)
      H4: Day 3: Onboarding email highlighting key Premium features
      H4: Day 7: "Key ROI Feature" email — drive to most valuable content [R-079]
      H4: Day 9: Urgency email — "2 days left, don't lose access"
      H4: Day 10: Final conversion email + 20% first-month discount offer
      H4: Post-trial: Downgrade to free (retain, re-engage later)
      H4: Target: 5-8% trial-to-Premium conversion rate [R-077]

    H3: Stage 4: Expansion (Premium → Expert)
      H4: Trigger: Power user identification (high engagement, multiple logins/week)
      H4: Outreach: Personalized email from SRC team
      H4: Offer: "Upgrade to Strategic Partner" with consultation call offer
      H4: Incentive: First month 50% off Expert tier
      H4: Vetting: Application review for Expert tier exclusivity
      H4: Target: 5-10% of Premium members upgrade to Expert within 12 months

    H3: Stage 5: Retention (All Tiers)
      H4: Weekly content newsletter (maintains engagement)
      H4: Monthly "New This Month" digest
      H4: Quarterly member survey (feedback loop)
      H4: Annual usage report ("You accessed X reports this year")
      H4: Churn prevention: Exit survey + retention offer for canceling members
      H4: Target: <5% monthly churn for Premium, <2% for Expert

  H2: Upgrade Trigger Design [^235^][^239^]
    H3: Feature Gates (visible but locked)
      H4: Free user sees "Studies" section with titles and 2-sentence summaries
      H4: "Upgrade to Intelligence Member for full access" — clear CTA
      H4: "See what Premium members accessed this week" — social proof [R-081]
    H3: Usage Limit Gates
      H4: Free: 3 report previews per month (counter shown)
      H4: Basic: 5 briefing views per month (soft limit with upgrade prompt)
    H3: Quality Gates
      H4: Free report: Abstract only, "Intelligence Members see the full analysis"
      H4: vAvatar: 30-sec preview, "Watch the full briefing as a Premium member"
    H3: Time Gates
      H4: Early access: Expert gets it now, others wait 48-72 hours
      H4: Breaking news: Expert gets real-time alert, others get next-day summary

  H2: Email Campaign Sequences
    H3: Free → Basic Sequence
      H4: Day 0: Welcome email + "Here's what you can access" + "See what Basic gets you"
      H4: Day 3: "Most popular report this week" (with abstract + upgrade CTA)
      H4: Day 7: "Your free preview limit reset" + vAvatar preview
      H4: Day 14: "Join 2,000+ Core Members" (social proof) + 50% off first month
      H4: Day 30: Monthly digest + upgrade offer
      H4: Ongoing: Weekly content digest with upgrade CTAs
    H3: Basic → Premium Sequence
      H4: Day 0 (post-upgrade): Welcome to Core Member + orientation guide
      H4: Day 7: "Unlock your first Study" — drive to Premium-gated content
      H4: Day 14: "Watch your first vAvatar briefing" — video content highlight
      H4: Monthly: "This month as a Basic member" usage summary + Premium preview
      H4: Trigger: After 5+ "upgrade to see more" clicks → targeted Premium offer
    H3: Premium → Expert Sequence
      H4: Trigger: High engagement (top 10% of Premium users by session count)
      H4: Personal email from SRC Director: "You've been our most engaged member..."
      H4: Offer: Complimentary Expert consultation call (value demonstration)
      H4: Follow-up: Post-call upgrade offer with first-month discount
```

---

## 3.8 Deliverable 8: Corporate Membership Architecture

### Hierarchical Structure

```
H1: Corporate & Institutional Membership
  H2: Rationale
    H3: Corporate clients represent 60-70% of think tank revenue (CFR, Chatham House model) [^133^][^418^]
    H3: B2B subscription model offers higher LTV and lower churn than individual
    H3: Swiss corporate base (Zug = crypto/tech hub) represents strategic opportunity
    H3: Chatham House corporate members include BP, Apple, McKinsey, UBS [^418^]
    H3: CFR corporate program: 120+ companies across all sectors [^133^]

  H2: Corporate Tier Structure
    H3: Tier 1: "Corporate Standard" — CHF 4,900/year
      H4: Seats: 5 individual user accounts
      H4: Content: Equivalent to Premium tier for all users
      H4: Admin dashboard: User management, usage analytics
      H4: Shared briefings: Company-specific executive summaries (quarterly)
      H4: Event access: 2 seats at SRC in-person events
      H4: Positioning: "Intelligence for your team"

    H3: Tier 2: "Corporate Premium" — CHF 9,900/year
      H4: Seats: 15 individual user accounts
      H4: Content: Equivalent to Expert tier for all users (except 1:1 calls)
      H4: Expert access: 2 quarterly 1:1 analyst consultations (for team leads)
      H4: Bespoke briefings: Monthly company-tailored intelligence brief (1,000 words)
      H4: Event access: 5 seats at SRC in-person events + VIP reception
      H4: Dedicated account manager
      H4: Annual team intelligence workshop (half-day, virtual)
      H4: Positioning: "Strategic intelligence partnership"

    H3: Tier 3: "Corporate Strategic" — CHF 19,900/year
      H4: Seats: Unlimited user accounts
      H4: Content: Full Expert tier access for all users
      H4: Expert access: 6 quarterly 1:1 analyst consultations + annual in-person session
      H4: Bespoke research: Up to 6 custom research projects per year (2,000 words each)
      H4: Bespoke briefings: Weekly company-tailored intelligence brief
      H4: Event access: Unlimited seats + invitation to exclusive CEO/Board briefings
      H4: Co-branding: SRC logo on corporate materials ("In partnership with SRC")
      H4: Research collaboration: Input on SRC research agenda + joint publication opportunities
      H4: Annual Chatham House Rule dinner with SRC leadership (in-person, Zug)
      H4: Positioning: "Your embedded intelligence partner"

  H2: Special Institutional Tiers
    H3: Academic Institution — CHF 2,900/year
      H4: Modelled on Chatham House Academic tier [^33^]
      H4: Seats: Unlimited campus-wide IP authentication
      H4: Content: Premium tier equivalent
      H4: Student discount: All enrolled students get 50% off individual membership
      H4: PhD candidates: Free individual membership (verification required)
      H4: Guest lectures: 2 SRC analyst guest lectures per year (virtual)

    H3: Government/NGO — CHF 3,900/year
      H4: Modelled on Chatham House NGO tier [^33^]
      H4: Seats: 10 user accounts
      H4: Content: Premium tier equivalent
      H4: Event discount: 50% off all SRC conferences and events
      H4: Flexible pass: Any 1 person can attend events + bring guest (space permitting)
      H4: Policy briefings: Quarterly tailored briefings for public sector context

  H2: Corporate Conversion Strategy
    H3: Bottom-up adoption: Individual users join, demonstrate value, then corporate license
    H3: Direct outreach: Targeted sales to C-suite and risk management teams
    H3: Pilot program: 30-day corporate trial with 3 seats
    H3: ROI calculator: "Compare to Oxford Analytica at $10K-$20K/year"
    H3: Case studies: Anonymous use cases from existing corporate clients
```

---

## 3.9 Deliverable 9: Implementation Roadmap

### Hierarchical Structure

```
H1: Implementation Roadmap
  H2: Phase 1: Foundation (Months 1-2)
    H3: Technical Infrastructure
      H4: M1-W1-2: Select and configure membership management platform (WordPress/Auth0/Stripe)
      H4: M1-W2-4: Implement tiered access control system (entitlements engine)
      H4: M1-W3-4: Build content gating logic (abstract vs. full content rules)
      H4: M1-W4: Set up Stripe payment processing with CHF support
      H4: M2-W1-2: Implement subscription management (upgrade/downgrade/cancel flows)
      H4: M2-W2-4: Build pricing page with psychological pricing display
      H4: M2-W3-4: Create member onboarding email sequences
    H3: Content Preparation
      H4: M1-W1-4: Audit existing 19 reports → classify for gating (Base/Expanded/Complete)
      H4: M1-W2-4: Write report abstracts for Base Version (free tier)
      H4: M2-W1-2: Create "upgrade" CTA copy and contextual messaging
      H4: M2-W2-4: Prepare first 2 Studies (Premium-gated content)
    H3: Free Tier Launch
      H4: M2-W4: Launch Free + Basic tiers (MVP)

  H2: Phase 2: Premium Launch (Months 3-4)
    H3: Premium Tier Activation
      H4: M3-W1-2: Launch Premium tier with Studies + Briefings
      H4: M3-W2-3: Activate 10-day free trial mechanism
      H4: M3-W3-4: Launch Premium newsletter
      H4: M4-W1-2: Implement conversion analytics and A/B testing framework
    H3: vAvatar Video Section
      H4: M3-W1-2: Select AI avatar platform (Synthesia/HeyGen/D-ID)
      H4: M3-W2-4: Produce pilot vAvatar Weekly Briefing (test episode)
      H4: M4-W1-2: Launch vAvatar Weekly Briefing (Premium+)
      H4: M4-W2-4: Produce first 2 vAvatar Deep Dives
      H4: M4-W3-4: Launch vAvatar Interview pilot

  H2: Phase 3: Expert & Corporate Tiers (Months 5-6)
    H3: Expert Tier Launch
      H4: M5-W1-2: Build Expert tier application and vetting workflow
      H4: M5-W2-3: Set up video call booking system (Calendly/integration)
      H4: M5-W3-4: Train SRC analysts on Expert consultation protocol
      H4: M5-W4: Launch Expert tier (invitation-only initially)
      H4: M6-W1-2: Implement Breaking News alert system (push + email + SMS)
      H4: M6-W2-4: Launch Early Access content pipeline (48-72h ahead)
    H3: Corporate Membership
      H4: M5-W1-2: Build corporate admin dashboard
      H4: M5-W2-3: Create corporate pricing page and application form
      H4: M6-W1-2: Launch Corporate Standard tier
      H4: M6-W2-4: Outreach to 20 target corporate prospects in Zug/Zurich

  H2: Phase 4: Optimization (Months 7-12)
    H3: Growth & Iteration
      H4: M7-8: A/B test pricing page, email sequences, upgrade triggers
      H4: M7-9: Optimize vAvatar content based on engagement data
      H4: M8-10: Expand Studies library to 12+ deep-dive analyses
      H4: M9-12: Launch referral program for member acquisition
      H4: M10-12: Consider student/young professional tier expansion
    H3: Advanced Features
      H4: M7-9: Build member discussion forums
      H4: M8-10: Launch mobile app (iOS + Android)
      H4: M9-11: Implement AI-powered content recommendations
      H4: M10-12: Add content download/offline access features

  H2: Success Metrics (KPIs)
    H3: Acquisition: 10,000 free registrations by Month 12
    H3: Conversion: 5-8% free-to-paid conversion rate
    H3: Revenue: CHF 500K ARR by Month 12
    H3: Retention: <5% monthly churn (Premium), <2% (Expert)
    H3: Engagement: 60%+ monthly active members
    H3: NPS: 50+ Net Promoter Score among paying members
```

---

## 3.10 Deliverable 10: Competitive Positioning

### Hierarchical Structure

```
H1: Competitive Positioning Analysis
  H2: Competitive Landscape Overview
    H3: Positioning Statement: "The world's most accessible expert-validated security intelligence — Swiss precision at Swiss pricing"
    H3: Differentiation: AI-Augmented Speed + Expert-Validated Rigour + Swiss Neutrality
    H3: Target segments: Individual professionals, corporate risk teams, government agencies, academic institutions

  H2: Competitive Comparison Matrix (Table: src_competitive_positioning)

| Dimension | SRC (Proposed) | Oxford Analytica | Stratfor/RANE | Chatham House | CFR |
|---|---|---|---|---|---|
| Individual Annual Price | CHF 0-2,999 | $10K-$20K | $2K-$5K | GBP 195-345 | $100K (corp) |
| Free Content Tier | YES (extensive) | NO | Limited | NO | NO |
| Breaking News Alerts | Expert tier | YES (enterprise) | YES | NO | NO |
| 1:1 Expert Access | Expert tier | YES (enterprise) | Limited | Events only | Events only |
| Video Content | vAvatar (AI) | NO | YES | Limited | YES |
| Swiss Neutrality | YES | NO | NO | NO | NO |
| AI-Augmented Research | YES | NO | YES | NO | NO |
| Early Access | Expert (48-72h) | YES | YES | NO | NO |
| Corporate Tiers | YES (CHF 4.9K-19.9K) | YES ($10K-$20K) | YES ($5K-$50K) | YES (GBP 5K+) | YES ($50K-$100K) |
| Content Archive | Unlimited (Expert) | YES | YES | YES (eLibrary) | YES |
| Multilingual | EN/DE/FR/IT | EN | EN | EN | EN |
| Focus Areas | 6 pillars | Broad | Broad | Broad | US-centric |

  H2: Key Competitive Advantages
    H3: 1. Price Accessibility
      H4: Entry point at CHF 0 vs. competitors requiring payment
      H4: Full Premium at CHF 799/year vs. Oxford Analytica at $10K-$20K
      H4: Expert tier at CHF 2,999/year — 70-85% below comparable intelligence services
      H4: Positioning: "Democratizing expert intelligence"
    H3: 2. AI-Augmented Differentiation
      H4: vAvatar video section — unique in think tank space
      H4: AI research engine = faster coverage of breaking developments
      H4: "AI drafts are the starting point, never the final word" — trust signal
    H3: 3. Swiss Neutrality Premium
      H4: Non-partisan positioning in polarized information environment
      H4: Swiss base = trust, privacy, security associations
      H4: D-A-CH regional focus fills geographic gap in global think tank landscape
    H3: 4. Content Tiering Innovation
      H4: Reports with 3 access levels (Base/Expanded/Complete) — unique granularity
      H4: Free opinions as acquisition engine without paywall friction
      H4: Hybrid freemium + free trial model optimized for conversion

  H2: Positioning Strategy
    H3: Against Oxford Analytica: "Same expert rigour, 80% less cost, plus AI video"
    H3: Against Stratfor/RANE: "Swiss neutrality, not US-centric; expert access at every tier"
    H3: Against Chatham House/CFR: "No paywall on opinions — intelligence for everyone"
    H3: Against Premium Media (FT/Economist): "Security-specialized intelligence, not general news"
    H3: Against Free Media: "Expert-validated, not algorithm-driven; AI-augmented, not AI-only"

  H2: Risk Mitigation
    H3: Perception risk: Low price could signal low quality
      H4: Mitigation: Emphasize "expert-validated rigour" in all messaging
      H4: Mitigation: Show Oxford Analytica price as anchor ("CHF 2,999 vs. $20,000")
      H4: Mitigation: Expert tier application process maintains exclusivity
    H3: Free rider risk: Too much free content reduces conversion
      H4: Mitigation: Free = abstracts only, never full analysis [R-076][R-080]
      H4: Mitigation: Show what Premium members see ("5,000+ words of analysis behind this")
      H4: Target: 2-5% conversion is healthy for freemium model [R-077]
    H3: Expert tier exclusivity risk: Too many Expert members dilutes value
      H4: Mitigation: Application/vetting process for Expert tier
      H4: Mitigation: Cap Expert Briefings at 25 participants
      H4: Mitigation: Qualitative criteria for Expert acceptance
    H3: Content production risk: Need consistent output across tiers
      H4: Mitigation: AI-augmented production workflow
      H4: Mitigation: vAvatar reduces video production from days to hours
      H4: Mitigation: Quarterly content calendar with buffer
```

---

# Part IV: Technical Requirements

## 4.1 Platform Architecture

| Requirement ID | Requirement | Priority |
|---|---|---|
| T-001 | Tier-based access control (entitlements engine) | Must-Have |
| T-002 | Stripe payment processing with CHF currency support | Must-Have |
| T-003 | Subscription lifecycle management (upgrade/downgrade/cancel/renew) | Must-Have |
| T-004 | Content gating engine (abstract vs. full vs. locked) | Must-Have |
| T-005 | Video streaming infrastructure (HLS adaptive) | Must-Have |
| T-006 | AI avatar video generation integration | Must-Have |
| T-007 | Breaking news alert system (push + email + SMS) | Must-Have |
| T-008 | Member analytics and engagement tracking | Must-Have |
| T-009 | A/B testing framework for pricing and messaging | Should-Have |
| T-010 | Corporate admin dashboard with user management | Should-Have |
| T-011 | Mobile app (iOS + Android) for Premium+ tiers | Should-Have |
| T-012 | Content search with full-text indexing | Must-Have |
| T-013 | Newsletter engine with tier-based segmentation | Must-Have |
| T-014 | Member discussion forums | Should-Have |
| T-015 | Referral tracking system | Nice-to-Have |
| T-016 | CRM integration for Expert tier member management | Should-Have |
| T-017 | Calendly/video booking integration for Expert calls | Must-Have |
| T-018 | Multilingual support (EN/DE/FR/IT) for all member-facing content | Must-Have |

## 4.2 Content Production Requirements

| Requirement ID | Requirement | Frequency | Priority |
|---|---|---|---|
| C-001 | Opinions (free tier content) | 2-3 per week | Must-Have |
| C-002 | Reports — full versions (tiered access) | 2-3 per month | Must-Have |
| C-003 | Studies (deep-dive, Premium+) | 1-2 per month | Must-Have |
| C-004 | Exclusive Briefings (Premium+) | 2-3 per month | Must-Have |
| C-005 | vAvatar Weekly Briefing | Weekly (Monday) | Must-Have |
| C-006 | vAvatar Breaking Alert | As needed (<5/month) | Must-Have |
| C-007 | vAvatar Deep Dive | Bi-weekly | Must-Have |
| C-008 | vAvatar Interview | Monthly | Should-Have |
| C-009 | vAvatar Expert Exclusive (Expert tier) | Monthly | Should-Have |
| C-010 | Weekly newsletter (all tiers, tier-appropriate content) | Weekly | Must-Have |
| C-011 | Premium analysis newsletter | Weekly | Must-Have |
| C-012 | Breaking news alerts (Expert tier) | As needed | Must-Have |
| C-013 | Week Ahead preview (Expert tier) | Weekly (Sunday) | Should-Have |

---

# Part V: Summary of All Requirements

## 5.1 Requirement Count Summary

| Category | Count | Breakdown |
|---|---|---|
| Explicit Requirements | 25 | R-001 through R-025 |
| Implicit — Think Tank Models | 18 | R-026 through R-043 |
| Implicit — Intelligence Services | 6 | R-044 through R-050 |
| Implicit — Premium Media | 17 | R-051 through R-067 |
| Implicit — Pricing Psychology | 8 | R-068 through R-075 |
| Implicit — Freemium Best Practices | 7 | R-076 through R-083 |
| Technical Requirements | 18 | T-001 through T-018 |
| Content Requirements | 13 | C-001 through C-013 |
| **TOTAL** | **112** | |

## 5.2 Deliverables Checklist

| # | Deliverable | Status | Sections |
|---|---|---|---|
| 1 | 4-Tier Membership Model (Free→Basic→Premium→Expert) | Complete | 3.1 |
| 2 | Content Gating Architecture | Complete | 3.2 |
| 3 | Pricing Structure with CHF Pricing | Complete | 3.3 |
| 4 | Feature Matrix per Tier | Complete | 3.4 (Table) |
| 5 | Expert Tier Deep Specification | Complete | 3.5 |
| 6 | vAvatar Video Section Strategy | Complete | 3.6 |
| 7 | Conversion Funnel Design | Complete | 3.7 |
| 8 | Corporate Membership Architecture | Complete | 3.8 |
| 9 | Implementation Roadmap | Complete | 3.9 |
| 10 | Competitive Positioning | Complete | 3.10 |

## 5.3 Critical Success Factors

1. **Free tier must deliver genuine value** — Opinions must be substantive enough to build habit, while leaving clear gap for paid tiers [R-076]
2. **Price anchoring is critical** — Display Expert tier first to make Premium appear as clear value choice [R-072]
3. **Premium is the revenue engine** — 70%+ of revenue will come from Premium tier; conversion optimization is paramount
4. **Expert tier exclusivity must be preserved** — Application/vetting process maintains perceived value [R-026]
5. **vAvatar is the differentiator** — First think tank with AI video intelligence; early mover advantage
6. **Swiss neutrality is the trust signal** — All messaging must reinforce non-partisan positioning
7. **Corporate tiers drive scale revenue** — Individual-to-corporate upgrade path must be frictionless
8. **Content velocity must match tier promises** — Under-delivering on content breaks the model

---

## Sources Referenced

| Source | Type | Key Insight |
|---|---|---|
| SRC Advisory (src-advisory.ch) | Primary | Current website structure, 6 focus areas, existing 10-day trial |
| Council on Foreign Relations (cfr.org) [^133^] | Think Tank | $50K-$100K corporate tiers, ~1,000 events/year, CEO Summit |
| Chatham House (chathamhouse.org) [^29^][^33^] | Think Tank | GBP 195-345 individual, 120+ events, eLibrary, corporate risk briefings |
| Oxford Analytica [^79^][^121^] | Intelligence | $10K-$20K subscriptions, qualitative geopolitical forecasting |
| Financial Times (ft.com) [^48^][^1071^] | Media | $75/month Premium, 50% first-year discount, hard paywall |
| The Economist (economist.com) [^52^] | Media | GBP 279/year, first month free, bundled NYT access, audio features |
| Foreign Affairs [^143^][^226^] | Media | $39.99 digital, 3 free articles, student discounts, group subscriptions |
| Foreign Policy [^1073^] | Media | $149.99 annual, 67% off quarterly trial, FP Insider tier |
| Psychological Pricing (ewm.swiss) [^749^] | Research | CHF charm pricing, anchoring, tiered pricing, 30% conversion lift |
| Psychological Pricing (edana.ch) [^750^] | Research | Swiss UCA/PIO compliance, bilingual display, decoy pricing |
| Freemium Best Practices (adapty.io) [^235^] | Research | Free tier value design, upgrade triggers, 2-5% conversion targets |
| RevenueCat [^1076^][^1079^] | Research | Entitlements, paywall optimization, price anchoring principles |
| IISS Ghana (iissgh.org) [^31^] | Think Tank | Fellowship tier, student membership, professional certification |
| Wikipedia — CFR Members [^25^] | Reference | Corporate membership history, pricing tiers, nomination process |
| INSA Online [^1072^] | Think Tank | $300 individual, $2,500-$6,250 corporate, student tier |
| onthinktanks.org [^175^] | Research | Freemium model for think tanks, subscription strategies |
| Wall Street Prep [^237^] | Research | Freemium conversion funnels, Spotify/LinkedIn case studies |

---

*Document prepared for SRC Advisory membership model implementation. All pricing subject to market validation and A/B testing.*
