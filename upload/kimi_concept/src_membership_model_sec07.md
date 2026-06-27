## 7. Technical Platform & Implementation Roadmap

The membership model designed in preceding chapters delivers value only if the underlying technology gates content reliably, processes payments seamlessly, and scales from launch through enterprise tiers. The wrong platform choice traps SRC in vendor lock-in with escalating fees; the right choice creates a Swiss-hosted foundation costing under CHF 550 per month at 1,000 members rather than the CHF 3,000 or more demanded by all-in-one platforms [^948^][^952^]. This chapter specifies the recommended stack, maps the compliance landscape, and lays out a 12-month roadmap from registration wall to operational corporate memberships.

### 7.1 Recommended Technology Stack

SRC's architecture follows a modular, best-of-breed approach: each component is replaceable independently, data remains under Swiss jurisdiction, and monthly operating costs at 1,000 members stay under CHF 550 — roughly one-sixth the cost of a Piano or Zuora/Zephr deployment [^948^][^1018^].

#### 7.1.1 Swiss-Hosted Core: Strapi, Next.js, Stripe Switzerland, and Ghost

The content backbone should be **Strapi** self-hosted on a Swiss cloud provider (Exoscale or Infomaniak). Strapi offers unlimited API calls on its free open-source tier, role-based access control for tiered gating, and full data residency — a prerequisite for FADP compliance that SaaS-only alternatives such as Contentful cannot match without EU-hosted instances [^1013^][^1021^]. The frontend uses **Next.js** with server-side rendering for SEO and client-side authentication for member content [^1011^].

Payment processing runs through **Stripe Switzerland** at 2.9% plus CHF 0.30 per transaction, with TWINT support since 2023 [^957^][^1033^]. TWINT commands 55-65% of Swiss mobile checkout share among 5 million-plus users, and its 1.1-1.4% fees are 30-50% cheaper than cards [^1033^]. TWINT should be the default Swiss payment method, supplemented by SEPA Direct Debit for EU members. Social login via LinkedIn and Google through Auth0 or NextAuth.js lifts registration conversion by 20-50% [^1020^]. Newsletter delivery uses **Ghost Publisher** at $29 per month with 0% transaction fees — versus Substack's 10% cut — and built-in tiered gating [^1017^][^1020^].

#### 7.1.2 Paywall: Custom Implementation Over Enterprise SaaS

Enterprise paywall platforms such as Piano (CHF 3,000-5,000-plus per month) and Zuora/Zephr (CHF 6,000-plus per month) deliver sophisticated dynamic rules, but their pricing is tightly coupled to their billing ecosystems and requires professional services [^948^][^1045^]. A custom paywall built with **ThumbmarkJS** for browser fingerprinting and **Redis** for meter tracking achieves 5-10 free articles before gating with a 5-7% stop-rate target at a fraction of the cost [^985^][^1008^]. This also keeps behavioral data inside SRC's Swiss-hosted environment rather than inside a US vendor's ecosystem — meaningful given the FDPIC's removal of the US from its data-protection whitelist post-Schrems II [^1016^]. Piano can be introduced later if SRC scales beyond 5,000 members.

#### 7.1.3 Video: Vimeo Pro and AI Avatar Infrastructure

Video content with active viewing sees roughly half the churn of text-only memberships [^954^]. **Vimeo Premium** at $65 per month offers domain restriction, with an upgrade path to Vimeo OTT or tokenized HLS protection as volumes grow [^954^]. For AI avatar generation, **Synthesia** is the primary platform: its European language lip-sync scores 4.1 out of 5 for French and German, superior to HeyGen's 3.7 out of 5, and it holds SOC 2 Type II and ISO/IEC 42001:2023 certifications [^591^][^633^]. The Creator tier at $89 per month provides 30 minutes and API access [^998^]. For social clips, **HeyGen Creator** at $29 per month delivers ~30 minutes of Avatar IV output in 175 languages with vertical 9:16 format [^578^].

#### 7.1.4 AI Avatar Integration: The Automated Pipeline

The automation pipeline runs six steps: RSS monitoring captures developments; an AI script generator (GPT-4 or Claude) drafts briefings capped at 90-120 seconds for the 70% viewer-retention threshold [^580^]; a human expert reviews and approves; the Synthesia API generates the video (a 90-second video renders in 3-7 minutes) [^636^]; output undergoes human validation; and automated distribution routes to the appropriate tier [^636^]. At $1.80-$2.90 per minute, 20 five-minute briefings monthly cost roughly CHF 180-290 — a 90% reduction versus human production [^617^].

**Table 1: Recommended Technology Stack — Component Comparison**

| Component | Primary Choice | Alternative | Monthly Cost at 1,000 Members | Key Rationale |
|-----------|--------------|-------------|------------------------------|---------------|
| Headless CMS | Strapi (self-hosted, Switzerland) | Ghost CMS | CHF 50-100 [^1021^] | Unlimited API calls, full data residency, FADP-compliant |
| Frontend framework | Next.js (SSR) | Nuxt.js | $20-50 (Vercel) | SEO-optimized, React ecosystem, server-side auth |
| Payment processor | Stripe Switzerland + TWINT | Payrexx | ~CHF 250 ( Stripe fees on ~200 transactions) [^957^] | TWINT support, best API, CHF settlement |
| Paywall / metering | Custom (ThumbmarkJS + Redis) | Piano | $0 (self-built) | Fingerprint-based tracking, data stays in Switzerland |
| Newsletter delivery | Ghost Publisher | ConvertKit | $29 [^1017^] | 0% transaction fees, built-in tiered gating |
| Video hosting | Vimeo Premium | Wistia | $65 [^1018^] | Domain restriction, ad-free player |
| AI avatar generation | Synthesia Creator API | HeyGen | $89 [^998^] | Superior European language lip-sync (4.1/5) [^633^] |
| Social video clips | HeyGen Creator | Synthesia Starter | $29 [^578^] | 175 languages, vertical format, lower cost |
| Authentication | Auth0 / NextAuth.js | Firebase Auth | $0 (up to 7,500 users) [^1025^] | Social login + SSO-ready for corporate tiers |
| Analytics | Mixpanel + ProfitWell | Amplitude | $0 (free tiers) | 20M events free, subscription benchmarks |
| **Total estimated** | | | **~CHF 450-550** | **vs. CHF 3,000+ for Piano or Zuora [^948^][^1018^]** |

At 1,000 members, Piano or Zuora would consume 40-50% of the Essential tier's monthly revenue in platform fees alone. The custom stack redirects that capital into content and analyst capacity. The trade-off is approximately 4-6 weeks of developer time for the initial build — an investment that pays for itself within the first quarter through avoided platform fees.

### 7.2 Compliance & Security

Three domains demand attention before launch: data protection, AI content governance, and VAT.

#### 7.2.1 Swiss FADP and GDPR: The Dual Regime

The revised Swiss Federal Act on Data Protection (FADP), effective September 2023, aligns with the EU's GDPR but uses opt-out as the default rule for general data processing, whereas GDPR requires opt-in consent [^1016^][^1014^]. Swiss members can be enrolled in core processing without explicit consent provided they are informed and can object. However, opt-in consent *is* required for three scenarios relevant to SRC: transfers to countries without adequate protection (notably the United States, removed from the FDPIC whitelist post-Schrems II); processing of sensitive personal data; and automated profiling for personalized services [^1016^].

The binding architecture constraint is clear: host all member data in Switzerland or the EU, implement Standard Contractual Clauses for any US vendor relationships, and require explicit opt-in for newsletters and AI personalization. Penalties under FADP reach CHF 250,000, with managing directors held personally liable [^1016^].

#### 7.2.2 EU AI Act Article 50: Disclosure and the Editorial Exemption

The EU AI Act's Article 50, effective August 2026, requires disclosure of AI-generated deepfakes [^609^][^610^]. However, Article 50(4) contains an editorial exemption: content on matters of public interest is exempt if it has undergone "human review or editorial control" [^610^][^608^]. SRC's expert-reviewed pipeline likely qualifies. The strategic question is not whether SRC *must* disclose, but whether it *should*. Research in *Organizational Behavior and Human Decision Processes* demonstrates that AI disclosure erodes trust across 13 experiments [^636^]. Yet the "AI Disclosure Trust Premium" suggests that voluntary "AI-delivered, expert-curated" labeling can differentiate SRC from opaque competitors. The recommended approach: pursue the editorial exemption as legal foundation, but implement voluntary labeling to signal methodological rigor.

#### 7.2.3 VAT: Swiss and EU Obligations

Swiss VAT at 8.1% applies to digital services for Swiss-resident members. For EU subscribers, the One-Stop Shop (OSS) scheme allows registration in a single member state with remittance at each destination country's rate. Stripe Tax automates OSS calculation as a paid add-on.

### 7.3 12-Month Implementation Roadmap

The build sequence prioritizes revenue generation from Month 1, deferring premium features until the foundation is validated.

#### 7.3.1 Phase 1 (Months 1-3): Foundation

Deliverables: registration wall after 2-3 free articles (converting at 10 times the rate of passive signup [^1020^]); Essential tier at CHF 14.90 per month with Stripe + TWINT; metered paywall at 5 articles for non-registered users; social login; and weekly newsletter via Ghost. Engineering scope: Strapi + Next.js on Swiss hosting, Stripe checkout, and ThumbmarkJS metering. Target: 200-500 registrations and 50-100 paying Essential members.

#### 7.3.2 Phase 2 (Months 4-6): Premium Launch

Phase 2 introduces the Professional tier at CHF 49 per month, the vAvatar pilot (10-15 Synthesia briefings monthly), the "reverse timewall" content cascade (+24h for Professional, +72h for Essential), and premium audio newsletters. The first vAvatar briefing should be publicly distributed by Month 5. Target: 300-500 total paying members.

#### 7.3.3 Phase 3 (Months 7-9): Expert and Corporate Tiers

Phase 3 opens the Executive tier at CHF 149 per month with live analyst calls and a 4-hour response guarantee for breaking developments; corporate memberships in Team (5 seats), Department (25 seats), and Enterprise (50-plus seats) with admin dashboard and SAML SSO; and annual summit planning for the inaugural SRC Global Security Summit in Zug. Corporate subscriptions follow the Chatham House nominee model: named individual accounts, each with its own profile [^113^]. Target: 50-75 Executive members and 5-10 corporate accounts.

#### 7.3.4 Phase 4 (Months 10-12): Optimization and Scale

The final phase delivers: AI-powered real-time risk alerts completing the "breaking news speed ladder"; a Progressive Web App with push notifications (native app development at $40,000-$150,000-plus is deferred past 5,000 members) [^1002^]; API access for enterprise content integration; win-back campaigns targeting at-risk members (scores 0-39 on the engagement scale have only 30% renewal rates) [^1034^]; and pricing optimization based on 9 months of conversion and retention data. Target: 1,000-plus total members, 15-20 corporate accounts, and positive net revenue retention.

**Table 2: 12-Month Implementation Roadmap**

| Phase | Timeline | Primary Deliverables | Engineering Focus | Success Metrics |
|-------|----------|---------------------|-------------------|-----------------|
| **Phase 1: Foundation** | Months 1-3 | Registration wall after 2-3 articles; Essential tier (CHF 14.90/mo) launch; Stripe + TWINT payments; metered paywall (5 articles); social login; Ghost newsletter | Strapi + Next.js deployment on Swiss hosting; Stripe checkout; ThumbmarkJS metering | 200-500 registrations; 50-100 paying Essential members |
| **Phase 2: Premium Launch** | Months 4-6 | Professional tier (CHF 49/mo); vAvatar pilot (Synthesia, 10-15 briefings/mo); early-access timewall (+24h/+72h); premium audio newsletters; LinkedIn content distribution | Synthesia API integration; tiered content gating; audio pipeline | 300-500 total paying members; first vAvatar briefing live |
| **Phase 3: Expert & Corporate** | Months 7-9 | Executive tier (CHF 149/mo) with live analyst calls; corporate tiers (Team/Dept/Enterprise) with admin dashboard and SAML SSO; annual summit planning; engagement scoring dashboard | Corporate admin portal; SSO/SAML; Mixpanel engagement model | 50-75 Executive members; 5-10 corporate accounts; summit venue secured |
| **Phase 4: Optimization** | Months 10-12 | AI alert system (real-time risk notifications); mobile PWA with push notifications; API access for enterprise; win-back campaigns; pricing optimization based on 9 months of data | PWA development; API endpoint design; automated retention workflows | 1,000-plus total members; 15-20 corporate accounts; positive NRR |

This roadmap compresses what enterprise SaaS vendors quote as 12-18 month implementations into four disciplined quarters by deferring non-essential features and front-loading conversion infrastructure. The sequencing reflects a core strategic judgment: SRC's first-mover advantage in AI avatar-powered think tank briefings is perishable. Competitors will replicate the vAvatar model within 12-18 months of SRC's public launch [^614^]. The priority is therefore to get the Essential tier live within 90 days, the Professional tier with vAvatar content within 180 days, and the corporate track before any competitor can match the "Swiss AI Neutrality" positioning that combines Swiss-hosted data, expert-curated AI delivery, and multilingual briefings in a single membership offer. Speed to market is itself the moat — and the technology stack outlined here is chosen precisely for the speed it enables without sacrificing the compliance posture and data sovereignty that differentiate SRC from US- and UK-based alternatives.
