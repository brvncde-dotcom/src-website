# SRC Advisory — Membership Model & Platform Architecture
## Board Decision Brief | 5 Pages

---

## 1. The Membership Model: Four Tiers

### Philosophy
Think tanks that charge for content alone fail. The winning model: **opinions and basic reports free for all registered users** (mission + funnel), **paid tiers sell access, speed, and proximity to experts**. Chatham House, CFR, and CSIS all use this playbook. RANE/Stratfor and Oxford Analytica prove it scales in intelligence subscriptions.

### Tier Overview

| | **Observer (Free)** | **Essential** | **Professional** | **Executive** |
|---|---|---|---|---|
| **Price** | CHF 0 | CHF 29/mo (CHF 290/yr) | CHF 79/mo (CHF 790/yr) | CHF 149/mo (CHF 1,490/yr) |
| **Who** | Registered users | Individual professionals | Senior analysts, managers | C-suite, ministers, editors |
| **Core content** | Opinions, briefs (<1,000w), exec summaries, weekly newsletter, podcasts | Unlimited reports (2,000-4,000w), PDFs, daily brief, 12mo archive | Exclusive studies (3,000-8,000w), vAvatar video, early access 24h, quarterly forecast | Live analyst calls, breaking news alerts, annual summit, bespoke research |
| **Video** | 90-sec clips | Daily 2-min vAvatar brief | Weekly 10-min analysis + interviews | Live sessions + on-demand 1:1 |
| **Speed** | Weekly digest | Next-day brief | Same-day analysis | Flash alert <4 hours + SMS |
| **Events** | Public only | Monthly virtual (recorded) | Weekly virtual + quarterly private | Monthly group call + annual Switzerland summit |
| **Analyst access** | None | None | Topic suggestions | 1:1 calls quarterly + 4 bespoke requests/yr |
| **Archive** | 6 months | 12 months | Full | Full + downloadable datasets |
| **Team seats** | — | — | 3 seats | 1 seat (personal) |

**Pricing psychology:** The 2.7x jump from Essential to Professional is deliberate — it creates a "compromise effect" that drives 17%+ of buyers to the middle tier. Annual billing at 17% off ("2 months free") delivers 92% retention vs. 68% for monthly. The Executive tier at CHF 149 anchors the Professional at CHF 79 as "reasonable."

### Student / Young Professional
- Under-30: CHF 190/year (36% off) — following Chatham House's proven model
- Students: CHF 160/year — acquisition play for future decision-makers

### Corporate Tiers (Parallel Track)

| | **Team** | **Department** | **Enterprise** |
|---|---|---|---|
| **Seats** | 5 | 20 | 50+ |
| **Price** | CHF 3,900/yr | CHF 9,900/yr | CHF 24,900/yr |
| **Admin** | Shared login | Admin dashboard, seat mgmt | SSO/SAML, full API |
| **Briefings** | Standard newsletters | Private quarterly briefing | Private monthly + bespoke research |
| **Support** | Email | Account manager | Dedicated account director |

One Enterprise client = ~32 individual Professional memberships in revenue, with significantly lower churn.

---

## 2. The Influencer Access Token System

### The Problem
Launching a paid membership from zero is hard. No social proof, no network effects, no word-of-mouth. Every successful think tank and media subscription used a "seed audience" strategy at launch.

### The Solution: SRC Access Tokens
A controlled system to give **key individuals free one-year access** in exchange for organic reach and referral generation. Not "free accounts" — **tokenized, trackable, time-limited access** that creates FOMO and measurability.

### How It Works

**1. Token Types**

| Token Type | Recipient | Duration | Included Tier | Purpose |
|---|---|---|---|---|
| **Founder** | 50 hand-picked security leaders | 12 months | Executive | Credibility, content co-creation, case studies |
| **Ambassador** | 200 mid-tier influencers (journalists, consultants, NGO leaders) | 12 months | Professional | Organic sharing, referral links |
| **Academic** | University faculty, research fellows | 12 months | Professional | Citation, student pipeline, research partnerships |
| **Partner** | Corporate prospects, government liaisons | 3 months | Executive | Sales pipeline, procurement evaluation |
| **Trial** | Anyone via referral link | 14 days | Professional | Conversion funnel top |

**2. Selection Criteria for Key Person Tokens**
- **Reach**: LinkedIn/Twitter following >5,000 in security/policy space
- **Authority**: Published in Foreign Policy, IISS, CSIS, or equivalent
- **Network**: Connected to organizations that would buy corporate memberships
- **Activity**: Speaks at conferences, runs newsletters, teaches at universities
- **Geography**: Priority on under-represented regions (Asia-Pacific, Middle East, Africa)

**3. Referral Mechanics**
- Each token holder gets a **personal referral link** with UTM tracking
- Refer 3 paying members → second year free at same tier
- Refer 5 paying members → permanent free Professional membership
- Refer 10 paying members → permanent free Executive + annual summit invite
- **Leaderboard**: Quarterly public ranking of top referrers (gamification)

**4. Token Lifecycle**
```
Invite (SRC selects) → Accept (creates account, token auto-applied) → Onboard (7-day email series) → Engage (track activity) → Refer (personal link active) → Evaluate (at month 9) → Renew (if referrals ≥3) or Downgrade (to free) → Exit (feedback call)
```

**5. Governance Rules**
- Maximum 300 active key-person tokens at any time (scarcity = value)
- 6-month activity check: accounts with zero logins for 90 days get a "nudge or revoke" email
- No public application — all tokens are **invitation-only** from SRC leadership
- Tokens are **non-transferable** and tied to verified identity (LinkedIn OAuth + email domain check)
- Transparency: token holders disclosed on a public "SRC Advisors" page (optional opt-in)

### Why This Works
- **The Economist** gave Espresso free to students — 42% conversion to paid over time
- **Chatham House** Under-30 membership at 36% off builds lifelong members
- **RANE** grew via Stratfor's existing subscriber base; SRC has no legacy base — tokens create one
- **Cost**: 300 free Executive tokens = ~CHF 450K forgone revenue. If those 300 refer an average of 2.5 paying members each = 750 paid members = CHF 450K+ annual revenue (Essential tier alone). Break-even on referrals; massive upside on lifetime value.

---

## 3. The Backend: Architecture & Workflows

### Core Principles
1. **Swiss-hosted**: All data in Switzerland. Swiss FADP + GDPR compliant. No US cloud for member data.
2. **Token-aware**: The system must distinguish 5 token types + 4 paid tiers + free tier, each with different content entitlements, speeds, and access rules.
3. **Workflow-first**: Membership is not a product catalog — it's a lifecycle engine with onboarding, engagement tracking, renewal, win-back, and referral loops.

### Technology Stack

| Layer | Tool | Why | Monthly Cost |
|---|---|---|---|
| **CMS** | Strapi (self-hosted, Swiss server) | Flexible content types, role-based access, API-first | CHF 150 |
| **Frontend** | Next.js (Vercel or Swiss host) | SSR for SEO, fast paywall rendering | CHF 100 |
| **Payments** | Stripe Switzerland + TWINT | CHF-native, TWINT essential for Swiss market (55-65% share) | 2.9% + CHF 0.30/txn |
| **Paywall engine** | Piano.io or Zephr | Tiered metering, token validation, content gating rules | CHF 400 |
| **Newsletters** | Ghost (self-hosted) or Beehiiv | Member-only newsletters, segmentation by tier/token | CHF 100 |
| **Video hosting** | Vimeo Pro + Synthesia API | Secure member-only video + AI avatar generation | CHF 200 |
| **Auth** | Auth0 or Keycloak | Token validation, SSO for corporate, LinkedIn OAuth for tokens | CHF 100 |
| **CRM** | HubSpot (EU datacenter) or Pipedrive | Token lifecycle, referral tracking, engagement scoring | CHF 150 |
| **Analytics** | Mixpanel + ProfitWell | Funnel analytics, churn prediction, tier performance | CHF 200 |
| **Alerts** | Custom (Node.js + OneSignal) | Real-time breaking news push/SMS to Executive tier | CHF 100 |
| **Total** | | | **~CHF 1,500/mo at 1,000 members** |

### Key Workflows the Backend Must Handle

**Workflow 1: Token Invitation & Activation**
```
SRC admin selects recipient (CRM) → System generates unique token URL → Email sent (Ghost) → Recipient clicks, LinkedIn OAuth verifies identity → Account created with token tier pre-applied → Welcome email series triggers → Personal referral link generated → Activity tracking begins
```

**Workflow 2: Content Gating Engine**
```
User requests article → Paywall engine checks: (1) Is user authenticated? (2) What tier/token? (3) What content type? (4) Reverse timewall: has content aged into this tier? → Serve full content OR exec summary OR "upgrade" prompt with preview → Log engagement for CRM scoring
```

**Workflow 3: Referral Tracking & Reward**
```
Token holder shares personal link → New user signs up via link → Stripe processes payment → CRM attributes sale to referrer → Count increments toward reward threshold → At threshold (3/5/10), auto-apply reward (system extends token or upgrades tier) → Notification email to referrer
```

**Workflow 4: Breaking News Alert Cascade**
```
AI engine detects breaking event (25min) → Analyst validates (4hr target) → Content written → System pushes: Flash Alert (Executive, SMS+push) → 1hr later: Newsbreak (Professional, email) → 4hr later: Update (Essential, email) → Next day: Brief (Free, newsletter) → Archive searchable by all tiers
```

**Workflow 5: Renewal & Churn Prevention**
```
Month 10 of annual subscription → Engagement score calculated (content reads, video views, event attendance) → High engagement: auto-renew with "thank you" bonus (1 month free) → Medium engagement: personal email from account manager + offer → Low engagement: "pause" option (keep data, 3-month hold) or downgrade suggestion → Churned: 7-day trigger for win-back campaign with 20% discount
```

**Workflow 6: vAvatar Production Pipeline**
```
Expert writes briefing script → Reviews with AI research assistant → Submits to Synthesia API (DE/FR/IT/EN) → Renders 4 language versions (~5 min each) → Human reviewer approves → Published to tier-appropriate video library → Newsletter auto-includes relevant briefing → Analytics track watch-time by tier
```

### Token Management Dashboard (Admin)

The backend needs a single admin view showing:
- **Token inventory**: 300 max, how many issued, by type, expiry dates
- **Referral leaderboard**: Top 20 referrers, conversion rates by token type
- **Engagement heatmap**: Which token holders are active vs. dormant
- **ROI calculator**: Cost of free tokens vs. attributed revenue from referrals
- **Nudge tool**: One-click "re-engage" email to dormant token holders
- **Revoke workflow**: 3-step process (warning → nudge → revoke) with audit log

---

## 4. Financial Model: Year 1 Projections

### Assumptions
- Launch Month 1 with Essential tier only
- Professional and Executive launch Month 4
- Corporate tiers launch Month 7
- 300 key-person tokens active from Month 1
- Marketing budget: CHF 60,000/year (content + events + digital)

### Revenue Projections

| | Month 3 | Month 6 | Month 12 | Month 24 |
|---|---|---|---|---|
| **Free registered** | 2,000 | 5,000 | 12,000 | 25,000 |
| **Essential** | 100 | 250 | 500 | 800 |
| **Professional** | — | 80 | 200 | 400 |
| **Executive** | — | 20 | 60 | 120 |
| **Corporate (avg)** | — | 2 | 8 | 20 |
| **Monthly recurring** | CHF 2,900 | CHF 16,170 | CHF 48,100 | CHF 96,400 |
| **Annual recurring** | CHF 34,800 | CHF 194,040 | CHF 577,200 | CHF 1,156,800 |

### Cost Structure (Monthly)

| | Month 1-3 | Month 4-6 | Month 7-12 |
|---|---|---|---|
| Platform (stack above) | CHF 1,500 | CHF 1,500 | CHF 2,000 |
| vAvatar production | — | CHF 500 | CHF 1,000 |
| Team (0.5 FTE platform, 0.5 FTE content) | CHF 8,000 | CHF 8,000 | CHF 10,000 |
| Marketing | CHF 5,000 | CHF 5,000 | CHF 5,000 |
| Token forgone revenue | CHF 37,250 | CHF 37,250 | CHF 18,625* |
| **Total monthly cost** | **CHF 51,750** | **CHF 52,250** | **CHF 36,625** |
| **Monthly burn** | **CHF 51,750** | **CHF 36,080** | **CHF -11,475** |

\* Token holders converting to paying or referring members reduces forgone revenue. Assumes 50% of tokens renew via referrals by month 7.

### Break-Even
- **Operational break-even**: Month 10 (revenue covers platform + team + marketing)
- **Full break-even (including token costs)**: Month 14
- **Cash-flow positive**: Month 12

---

## 5. Implementation Roadmap

### Phase 1: Foundation (Months 1-3) — CHF 155K investment
- [ ] Deploy Swiss-hosted Strapi + Next.js + Stripe + TWINT
- [ ] Implement registration wall (2 articles free, then register)
- [ ] Launch **Observer (free)** + **Essential (CHF 29)** tiers
- [ ] Build token system: generate 300 tokens (50 Founder + 200 Ambassador + 50 Academic)
- [ ] Issue tokens to hand-picked key individuals
- [ ] Launch "SRC Daily Brief" newsletter (free)
- [ ] KPI target: 2,000 registered free users, 100 paying Essential members

### Phase 2: Premium Launch (Months 4-6) — CHF 157K investment
- [ ] Launch **Professional (CHF 79)** tier with vAvatar pilot
- [ ] Deploy Synthesia for daily 2-minute AI avatar briefings (DE/EN initially)
- [ ] Activate reverse timewall content cascade
- [ ] Launch premium newsletters ("Weekly Deep-Dive", "SRC Forecast")
- [ ] Implement referral tracking system for token holders
- [ ] KPI target: 5,000 free users, 330 total paying, 20 Professional, 5 Executive

### Phase 3: Expert & Corporate (Months 7-9) — CHF 110K investment
- [ ] Launch **Executive (CHF 149)** with live analyst calls
- [ ] Launch corporate tiers (Team / Department / Enterprise)
- [ ] First "SRC Global Security Summit" (invitation-only, Zug, 2 days)
- [ ] Breaking news alert system (AI + analyst hybrid, <4hr flash alerts)
- [ ] Partner tokens for corporate prospects (3-month trials)
- [ ] KPI target: 8,000 free users, 500 paying, 50 Executive, 5 corporate clients

### Phase 4: Scale (Months 10-12) — self-funded from revenue
- [ ] vAvatar multilingual expansion (FR/IT)
- [ ] Mobile PWA app for push notifications
- [ ] API access for Enterprise clients
- [ ] Win-back campaigns for churned members
- [ ] Pricing optimization based on conversion data
- [ ] KPI target: 12,000 free users, 760 paying, 60 Executive, 8 corporate, **CHF 577K ARR**

---

## The Ask

**Board decision required on:**

1. **Approve the 4-tier model** (Observer/Essential/Professional/Executive) with CHF pricing as specified
2. **Approve the 300-token key-person program** (50 Founder + 200 Ambassador + 50 Academic) for Year 1
3. **Approve CHF 422K total Year-1 investment** (platform + team + marketing + token forgone revenue)
4. **Mandate Swiss-hosted infrastructure** (no US cloud for member data)
5. **Green-light Phase 1** to begin Month 1 with Essential tier + token distribution

**The bet:** CHF 422K invested in Year 1 to build a membership engine that reaches CHF 577K ARR by Month 12 and CHF 1.15M by Month 24, with a defendable moat built on Swiss neutrality + AI video innovation + expert-validated rigor that no competitor can replicate.
