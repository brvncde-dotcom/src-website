# SRC Advisory — Backend Architecture
## PostgreSQL + Vercel Serverless | Own CRM & Email Engine

---

## 1. Database Schema (PostgreSQL)

### Core Principle
One database, fully normalized, with row-level security (RLS) policies. The CRM is not a separate system — it IS the membership database. Every user interaction, token lifecycle event, email send, payment, and referral is a row in PostgreSQL.

### Schema Overview
```
├── users                  # All accounts (free, paid, token holders)
├── tiers                  # Membership tier definitions
├── subscriptions          # Stripe-linked paid subscriptions
├── tokens                 # Influencer access tokens
├── token_invitations      # Who was invited, when, status
├── referrals              # Referral tracking (who referred whom)
├── content                # All content (reports, opinions, studies, videos)
├── content_access_rules   # Which tier can access what content type
├── content_views          # Audit log of every content view
├── emails                 # All emails sent (newsletter + transactional)
├── email_subscriptions    # User newsletter preferences
├── alerts                 # Breaking news alerts
├── alert_deliveries       # Who received what alert, when
├── events                 # Virtual and in-person events
├── event_registrations    # Who signed up for what
├── analyst_calls          # Executive tier 1:1 calls
├── vavatar_videos         # AI-generated video metadata
├── crm_activities         # The CRM: every interaction logged
├── crm_tasks              # Follow-up tasks for team
├── crm_segments           # Dynamic user segments
└── audit_log              # Immutable change log
```

---

### Table: users
```sql
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) UNIQUE NOT NULL,
    password_hash   VARCHAR(255),           -- NULL for OAuth/token users
    auth_method     VARCHAR(20) NOT NULL DEFAULT 'password', -- password | oauth_linkedin | token
    
    -- Profile
    first_name      VARCHAR(100),
    last_name       VARCHAR(100),
    title           VARCHAR(100),           -- Job title
    organization    VARCHAR(200),
    country         VARCHAR(2),             -- ISO-3166
    language_pref   VARCHAR(5) DEFAULT 'en', -- en | de | fr | it
    timezone        VARCHAR(50) DEFAULT 'Europe/Zurich',
    
    -- Tier & Access
    current_tier_id UUID REFERENCES tiers(id),
    access_type     VARCHAR(20) NOT NULL DEFAULT 'free', -- free | paid | token | trial
    token_id        UUID REFERENCES tokens(id),
    
    -- Engagement Scoring (CRM)
    engagement_score INT DEFAULT 0,          -- 0-100, auto-calculated
    last_active_at  TIMESTAMPTZ,
    login_count     INT DEFAULT 0,
    content_views_30d INT DEFAULT 0,
    
    -- Status
    status          VARCHAR(20) DEFAULT 'active', -- active | paused | churned | banned
    email_verified  BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    
    -- Stripe
    stripe_customer_id VARCHAR(100),
    stripe_subscription_id VARCHAR(100)
);

CREATE INDEX idx_users_tier ON users(current_tier_id);
CREATE INDEX idx_users_token ON users(token_id);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_engagement ON users(engagement_score DESC);
```

### Table: tiers
```sql
CREATE TABLE tiers (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug            VARCHAR(30) UNIQUE NOT NULL, -- observer | essential | professional | executive
    name            VARCHAR(50) NOT NULL,
    description     TEXT,
    
    -- Pricing (monthly = display, annual = billed)
    price_monthly_chf   DECIMAL(10,2),
    price_annual_chf    DECIMAL(10,2),
    
    -- Content limits
    max_reports_monthly INT,                -- NULL = unlimited
    archive_months      INT,
    
    -- Feature flags
    has_pdf_download        BOOLEAN DEFAULT FALSE,
    has_vavatar_access      BOOLEAN DEFAULT FALSE,
    has_early_access        BOOLEAN DEFAULT FALSE,     -- hours before public
    early_access_hours      INT DEFAULT 0,
    has_live_calls          BOOLEAN DEFAULT FALSE,
    has_breaking_alerts     BOOLEAN DEFAULT FALSE,
    has_bespoke_research    BOOLEAN DEFAULT FALSE,
    bespoke_requests_per_year INT DEFAULT 0,
    has_dedicated_manager   BOOLEAN DEFAULT FALSE,
    team_seats              INT DEFAULT 0,
    
    -- Display
    sort_order          INT NOT NULL,
    is_public           BOOLEAN DEFAULT TRUE,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Seed data
INSERT INTO tiers (slug, name, price_monthly_chf, price_annual_chf, max_reports_monthly, archive_months, has_pdf_download, has_vavatar_access, has_early_access, early_access_hours, has_live_calls, has_breaking_alerts, has_bespoke_research, bespoke_requests_per_year, has_dedicated_manager, team_seats, sort_order) VALUES
('observer',    'Observer',    0,    0,    10,   6,  false, false, false, 0,  false, false, false, 0, false, 0, 1),
('essential',   'Essential',   29,   290,  NULL, 12, true,  true,  false, 0,  false, false, false, 0, false, 0, 2),
('professional','Professional',79,   790,  NULL, NULL, true, true, true, 24, false, false, false, 0, false, 3, 3),
('executive',   'Executive',   149,  1490, NULL, NULL, true, true, true, 0,  true,  true,  true,  4, true,  1, 4);
```

### Table: subscriptions
```sql
CREATE TABLE subscriptions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tier_id         UUID NOT NULL REFERENCES tiers(id),
    
    -- Stripe refs
    stripe_subscription_id  VARCHAR(100) UNIQUE,
    stripe_price_id         VARCHAR(100),
    stripe_status           VARCHAR(20), -- active | canceled | past_due | unpaid
    
    -- Billing
    billing_interval    VARCHAR(10) NOT NULL, -- month | year
    current_period_start TIMESTAMPTZ NOT NULL,
    current_period_end   TIMESTAMPTZ NOT NULL,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    
    -- Amounts
    amount_chf      DECIMAL(10,2) NOT NULL,
    
    -- Status
    status          VARCHAR(20) DEFAULT 'active', -- active | canceled | past_due | paused
    
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_period_end ON subscriptions(current_period_end);
```

### Table: tokens
```sql
CREATE TABLE tokens (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_code      VARCHAR(32) UNIQUE NOT NULL, -- e.g., 'SRC-FNDR-2026-001'
    
    -- Type
    token_type      VARCHAR(20) NOT NULL, -- founder | ambassador | academic | partner | trial
    
    -- What it grants
    granted_tier_id UUID NOT NULL REFERENCES tiers(id),
    duration_months INT NOT NULL DEFAULT 12,
    
    -- Status
    status          VARCHAR(20) DEFAULT 'pending', -- pending | invited | active | expired | revoked
    
    -- Issuance
    issued_by       UUID REFERENCES users(id), -- admin who created it
    issued_at       TIMESTAMPTZ,
    
    -- Recipient (filled when assigned)
    recipient_email VARCHAR(255),
    recipient_name  VARCHAR(200),
    recipient_org   VARCHAR(200),
    recipient_note  TEXT,                    -- Why this person was selected
    
    -- Usage
    activated_at    TIMESTAMPTZ,
    activated_by_user_id UUID REFERENCES users(id),
    expires_at      TIMESTAMPTZ,
    revoked_at      TIMESTAMPTZ,
    revoke_reason   TEXT,
    
    -- Referral tracking (for ambassador/founder tokens)
    referral_link_code VARCHAR(50) UNIQUE,
    referrals_count    INT DEFAULT 0,
    referrals_converted INT DEFAULT 0,
    
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tokens_type ON tokens(token_type);
CREATE INDEX idx_tokens_status ON tokens(status);
CREATE INDEX idx_tokens_code ON tokens(token_code);
CREATE INDEX idx_tokens_referral ON tokens(referral_link_code);
```

### Table: referrals
```sql
CREATE TABLE referrals (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Who referred
    referrer_token_id UUID REFERENCES tokens(id),
    referrer_user_id  UUID REFERENCES users(id),
    
    -- Who signed up
    referred_user_id  UUID NOT NULL REFERENCES users(id),
    
    -- Tracking
    referral_code   VARCHAR(50) NOT NULL,
    source_url      TEXT,
    
    -- Conversion
    clicked_at      TIMESTAMPTZ,
    signed_up_at    TIMESTAMPTZ DEFAULT NOW(),
    converted_at    TIMESTAMPTZ,              -- When they became paying
    subscription_id UUID REFERENCES subscriptions(id),
    commission_type VARCHAR(20),              -- free_month | tier_upgrade | cash
    commission_value VARCHAR(50),
    
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_referrals_code ON referrals(referral_code);
CREATE INDEX idx_referrals_referrer ON referrals(referrer_user_id);
```

### Table: content
```sql
CREATE TABLE content (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug            VARCHAR(200) UNIQUE NOT NULL,
    
    -- Type
    content_type    VARCHAR(20) NOT NULL, -- opinion | report | study | briefing | video | interview | podcast
    
    -- Metadata
    title           VARCHAR(300) NOT NULL,
    subtitle        VARCHAR(500),
    excerpt         TEXT,                    -- 200-char summary for listings
    body            TEXT,                    -- Full HTML/markdown content
    body_truncated  TEXT,                    -- Free preview version
    
    -- Media
    cover_image_url TEXT,
    vavatar_video_id UUID REFERENCES vavatar_videos(id),
    
    -- Taxonomy
    focus_area      VARCHAR(50),             -- digital_power | geopolitics | hard_security | resilience
    tags            TEXT[],                  -- PostgreSQL array
    
    -- Access & Timing (Reverse Timewall)
    min_tier_id     UUID REFERENCES tiers(id), -- NULL = free for all
    published_at    TIMESTAMPTZ,             -- When it becomes public/free
    embargo_until   TIMESTAMPTZ,             -- NULL = no embargo
    
    -- For breaking news / alerts
    alert_priority  VARCHAR(10),             -- flash | high | medium | low
    alert_sent_at   TIMESTAMPTZ,
    
    -- Authoring
    author_id       UUID REFERENCES users(id),
    ai_assisted     BOOLEAN DEFAULT FALSE,
    expert_reviewed BOOLEAN DEFAULT FALSE,
    
    -- SEO
    meta_title      VARCHAR(70),
    meta_description TEXT,
    
    -- Status
    status          VARCHAR(20) DEFAULT 'draft', -- draft | review | scheduled | published | archived
    
    view_count      INT DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_content_type ON content(content_type);
CREATE INDEX idx_content_status ON content(status);
CREATE INDEX idx_content_tier ON content(min_tier_id);
CREATE INDEX idx_content_published ON content(published_at);
CREATE INDEX idx_content_focus ON content(focus_area);
CREATE INDEX idx_content_tags ON content USING GIN(tags);
```

### Table: content_views
```sql
CREATE TABLE content_views (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id),
    content_id      UUID NOT NULL REFERENCES content(id),
    view_type       VARCHAR(20) NOT NULL, -- summary | full | download | video_play
    accessed_at     TIMESTAMPTZ DEFAULT NOW(),
    source          VARCHAR(50),           -- newsletter | direct | search | alert
    ip_address      INET,
    user_agent      TEXT
);

CREATE INDEX idx_views_user ON content_views(user_id);
CREATE INDEX idx_views_content ON content_views(content_id);
CREATE INDEX idx_views_time ON content_views(accessed_at);
```

### Table: emails
```sql
CREATE TABLE emails (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- What
    email_type      VARCHAR(30) NOT NULL, -- daily_brief | weekly_deepdive | forecast | alert_flash | alert_newsbreak | transactional | onboarding | winback
    subject         VARCHAR(300) NOT NULL,
    body_html       TEXT NOT NULL,
    body_text       TEXT NOT NULL,
    
    -- Who
    recipient_count INT DEFAULT 0,
    segment_criteria JSONB,               -- { tiers: ['essential','professional'], engagement_min: 20 }
    
    -- Status
    status          VARCHAR(20) DEFAULT 'draft', -- draft | scheduled | sending | sent | failed
    scheduled_at    TIMESTAMPTZ,
    sent_at         TIMESTAMPTZ,
    
    -- Metrics
    open_count      INT DEFAULT 0,
    click_count     INT DEFAULT 0,
    bounce_count    INT DEFAULT 0,
    unsubscribe_count INT DEFAULT 0,
    
    -- Content link (for newsletters containing content)
    linked_content_ids UUID[],
    
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### Table: email_deliveries
```sql
CREATE TABLE email_deliveries (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email_id        UUID NOT NULL REFERENCES emails(id),
    user_id         UUID NOT NULL REFERENCES users(id),
    
    -- Delivery
    status          VARCHAR(20) DEFAULT 'pending', -- pending | sent | delivered | opened | clicked | bounced | failed
    provider_msg_id VARCHAR(100),                  -- SendGrid/Postmark message ID
    
    -- Tracking
    sent_at         TIMESTAMPTZ,
    opened_at       TIMESTAMPTZ,
    clicked_at      TIMESTAMPTZ,
    ip_address      INET,
    user_agent      TEXT,
    
    UNIQUE(email_id, user_id)
);

CREATE INDEX idx_deliveries_email ON email_deliveries(email_id);
CREATE INDEX idx_deliveries_user ON email_deliveries(user_id);
CREATE INDEX idx_deliveries_status ON email_deliveries(status);
```

### Table: email_subscriptions
```sql
CREATE TABLE email_subscriptions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Preferences
    daily_brief     BOOLEAN DEFAULT TRUE,
    weekly_deepdive BOOLEAN DEFAULT TRUE,
    forecast        BOOLEAN DEFAULT FALSE,       -- professional+
    breaking_alerts BOOLEAN DEFAULT FALSE,        -- executive
    content_type_prefs TEXT[] DEFAULT '{opinion,report,study}', -- which content types
    focus_area_prefs   TEXT[],                     -- which focus areas
    language_pref      VARCHAR(5) DEFAULT 'en',
    frequency          VARCHAR(20) DEFAULT 'immediate', -- immediate | daily_digest | weekly_digest
    
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id)
);
```

### Table: alerts
```sql
CREATE TABLE alerts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id      UUID REFERENCES content(id),   -- Linked content, if any
    
    -- Alert content
    priority        VARCHAR(10) NOT NULL,          -- flash | high | medium | low
    headline        VARCHAR(300) NOT NULL,
    summary         TEXT NOT NULL,                  -- 150-800 words depending on priority
    
    -- Geographic/topic tags for targeting
    regions         TEXT[],
    topics          TEXT[],
    
    -- Timing
    triggered_at    TIMESTAMPTZ DEFAULT NOW(),     -- AI detection
    validated_at    TIMESTAMPTZ,                   -- Analyst approval
    sent_at         TIMESTAMPTZ,
    
    -- Status
    status          VARCHAR(20) DEFAULT 'pending', -- pending | validating | approved | sent | archived
    
    -- AI + Analyst metadata
    ai_confidence   DECIMAL(3,2),                  -- 0.00 - 1.00
    validated_by    UUID REFERENCES users(id),      -- Analyst who approved
    
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### Table: alert_deliveries
```sql
CREATE TABLE alert_deliveries (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_id        UUID NOT NULL REFERENCES alerts(id),
    user_id         UUID NOT NULL REFERENCES users(id),
    
    -- How delivered
    channel         VARCHAR(10) NOT NULL,          -- push | sms | email | in_app
    delivered_at    TIMESTAMPTZ,
    read_at         TIMESTAMPTZ,
    
    UNIQUE(alert_id, user_id, channel)
);
```

### Table: crm_activities
```sql
CREATE TABLE crm_activities (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id),
    
    -- The CRM core: every interaction
    activity_type   VARCHAR(30) NOT NULL,
    -- content_view | content_download | email_open | email_click | alert_read
    -- login | upgrade | downgrade | churn | referral | call_attended
    -- event_registered | event_attended | token_activated | payment_failed
    -- onboarding_step | support_request | feedback
    
    -- Details
    description     TEXT,
    metadata        JSONB,                         -- Flexible: { content_id: "...", email_id: "..." }
    
    -- Source
    source          VARCHAR(30) DEFAULT 'web',     -- web | email | mobile | api | stripe_webhook
    
    -- When
    occurred_at     TIMESTAMPTZ DEFAULT NOW(),
    
    -- Calculated score impact
    score_impact    INT DEFAULT 0                  -- +1 view, +5 download, +10 call, etc.
);

CREATE INDEX idx_activities_user ON crm_activities(user_id);
CREATE INDEX idx_activities_type ON crm_activities(activity_type);
CREATE INDEX idx_activities_time ON crm_activities(occurred_at);
CREATE INDEX idx_activities_metadata ON crm_activities USING GIN(metadata);
```

### Table: crm_tasks
```sql
CREATE TABLE crm_tasks (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assigned_to     UUID REFERENCES users(id),     -- Admin/team member
    related_user_id UUID REFERENCES users(id),     -- The member this task is about
    
    task_type       VARCHAR(30) NOT NULL,
    -- follow_up | renewal_call | win_back | token_nudge | onboarding | support | research
    
    title           VARCHAR(200) NOT NULL,
    description     TEXT,
    
    due_at          TIMESTAMPTZ NOT NULL,
    completed_at    TIMESTAMPTZ,
    status          VARCHAR(20) DEFAULT 'open',    -- open | in_progress | completed | cancelled
    
    -- Priority scoring
    priority        INT DEFAULT 3,                 -- 1=urgent, 5=low
    auto_generated  BOOLEAN DEFAULT FALSE,          -- System-created vs manual
    
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tasks_assigned ON crm_tasks(assigned_to);
CREATE INDEX idx_tasks_user ON crm_tasks(related_user_id);
CREATE INDEX idx_tasks_status ON crm_tasks(status);
CREATE INDEX idx_tasks_due ON crm_tasks(due_at);
```

### Table: vavatar_videos
```sql
CREATE TABLE vavatar_videos (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id      UUID REFERENCES content(id),
    
    -- Metadata
    title           VARCHAR(300) NOT NULL,
    video_type      VARCHAR(20) NOT NULL,        -- daily_brief | weekly_analysis | interview | alert | summit
    language        VARCHAR(5) NOT NULL,         -- en | de | fr | it
    duration_seconds INT,
    
    -- URLs
    video_url       TEXT NOT NULL,               -- CDN URL
    thumbnail_url   TEXT,
    transcript      TEXT,                        -- Full transcript for SEO/accessibility
    
    -- Generation
    synthesia_project_id VARCHAR(100),           -- For re-generation
    ai_script       TEXT,                        -- The AI-generated script
    expert_approved   BOOLEAN DEFAULT FALSE,
    approved_by     UUID REFERENCES users(id),
    
    -- Access
    min_tier_id     UUID REFERENCES tiers(id),
    
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### Table: audit_log
```sql
CREATE TABLE audit_log (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name      VARCHAR(50) NOT NULL,
    record_id       UUID NOT NULL,
    action          VARCHAR(10) NOT NULL,         -- INSERT | UPDATE | DELETE
    old_data        JSONB,
    new_data        JSONB,
    changed_by      UUID REFERENCES users(id),
    changed_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_table ON audit_log(table_name, record_id);
CREATE INDEX idx_audit_time ON audit_log(changed_at);
```

---

## 2. API Architecture (Vercel Serverless)

### Project Structure
```
src-advisory-platform/
├── app/                          # Next.js App Router
│   ├── api/                      # Serverless API routes
│   │   ├── auth/
│   │   │   ├── register/route.ts
│   │   │   ├── login/route.ts
│   │   │   ├── oauth/linkedin/route.ts
│   │   │   └── refresh/route.ts
│   │   ├── users/
│   │   │   ├── route.ts          # CRUD + search + segments
│   │   │   └── [id]/
│   │   │       ├── route.ts      # Get/Update/Patch user
│   │   │       ├── activity/route.ts    # CRM activity feed
│   │   │       └── tasks/route.ts       # CRM tasks for this user
│   │   ├── content/
│   │   │   ├── route.ts          # List (with tier-based filtering)
│   │   │   ├── [slug]/route.ts   # Get (with access check)
│   │   │   └── [slug]/view/route.ts     # Record view
│   │   ├── subscriptions/
│   │   │   ├── route.ts
│   │   │   ├── create/route.ts   # Stripe checkout session
│   │   │   ├── webhook/route.ts  # Stripe webhook handler
│   │   │   └── portal/route.ts   # Stripe Customer Portal
│   │   ├── tokens/
│   │   │   ├── route.ts          # Admin: list/create tokens
│   │   │   ├── [code]/activate/route.ts # User activates token
│   │   │   └── [code]/revoke/route.ts   # Admin revokes
│   │   ├── referrals/
│   │   │   ├── route.ts          # Track referral
│   │   │   └── [code]/stats/route.ts    # Referrer dashboard stats
│   │   ├── emails/
│   │   │   ├── route.ts          # Admin: list/create emails
│   │   │   ├── [id]/send/route.ts       # Trigger send
│   │   │   ├── [id]/stats/route.ts      # Delivery stats
│   │   │   └── subscribe/route.ts       # Update preferences
│   │   ├── alerts/
│   │   │   ├── route.ts          # Create alert (admin)
│   │   │   ├── [id]/approve/route.ts    # Analyst approval
│   │   │   └── [id]/send/route.ts       # Trigger cascade
│   │   ├── crm/
│   │   │   ├── dashboard/route.ts       # KPIs + charts
│   │   │   ├── segments/route.ts        # Dynamic segments
│   │   │   ├── tasks/route.ts           # Task management
│   │   │   └── score/route.ts           # Engagement scoring
│   │   ├── analytics/
│   │   │   ├── views/route.ts
│   │   │   ├── engagement/route.ts
│   │   │   └── revenue/route.ts
│   │   └── webhooks/
│   │       └── stripe/route.ts
│   ├── (public)/                 # Public pages
│   ├── (member)/                 # Authenticated member pages
│   └── admin/                    # CRM Dashboard
├── lib/
│   ├── db.ts                     # PostgreSQL connection (Vercel Postgres)
│   ├── stripe.ts                 # Stripe client
│   ├── email.ts                  # Email service (SendGrid/Postmark API)
│   ├── auth.ts                   # JWT + session management
│   ├── access.ts                 # Content access control engine
│   ├── scoring.ts                # Engagement scoring algorithm
│   └── alerts.ts                 # Alert cascade engine
├── jobs/                         # Background jobs (Vercel Cron)
│   ├── daily-brief.ts
│   ├── engagement-score.ts
│   ├── token-expiry.ts
│   ├── renewal-reminders.ts
│   └── winback-campaign.ts
└── middleware.ts                 # Route protection + tier checks
```

### Middleware: Tier-Based Access Control
```typescript
// middleware.ts — runs on every request
export function middleware(request: NextRequest) {
  const token = request.cookies.get('session')?.value;
  const user = verifyJWT(token);
  
  // Check content access
  if (request.nextUrl.pathname.startsWith('/content/')) {
    const contentSlug = request.nextUrl.pathname.split('/')[2];
    const hasAccess = checkContentAccess(user, contentSlug);
    if (!hasAccess) {
      // Show preview + upgrade prompt
      return rewriteToPreview(request, contentSlug);
    }
  }
  
  // Check admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user?.isAdmin) return redirect('/');
  }
}
```

### Key API Patterns

**Content Access Check** (runs on every content request):
```typescript
// lib/access.ts
async function checkContentAccess(userId: string, contentSlug: string) {
  const content = await db.query(
    `SELECT c.*, t.early_access_hours 
     FROM content c 
     JOIN tiers t ON c.min_tier_id = t.id 
     WHERE c.slug = $1`, [contentSlug]
  );
  
  const user = await db.query(
    `SELECT u.*, t.early_access_hours as user_early_access
     FROM users u 
     JOIN tiers t ON u.current_tier_id = t.id 
     WHERE u.id = $1`, [userId]
  );
  
  // Reverse timewall logic
  if (!content.min_tier_id) return { access: 'full' }; // Free content
  
  const userTierLevel = getTierLevel(user.current_tier_id);
  const contentTierLevel = getTierLevel(content.min_tier_id);
  
  if (userTierLevel > contentTierLevel) {
    return { access: 'full', earlyAccess: true }; // Higher tier = full + early
  }
  
  if (userTierLevel === contentTierLevel) {
    // Check if content has aged into this tier
    const hoursSincePublish = (now - content.published_at) / 3600000;
    if (hoursSincePublish >= content.early_access_hours) {
      return { access: 'full' };
    }
    return { access: 'preview', reason: 'early_access' };
  }
  
  return { access: 'preview', reason: 'tier_upgrade_needed' };
}
```

**Engagement Scoring** (runs daily via cron):
```typescript
// lib/scoring.ts
async function calculateEngagementScore(userId: string): Promise<number> {
  const last30d = await db.query(`
    SELECT 
      COUNT(DISTINCT cv.content_id) * 5 as content_score,
      COUNT(CASE WHEN cv.view_type = 'download' THEN 1 END) * 10 as download_score,
      COUNT(CASE WHEN a.activity_type = 'email_open' THEN 1 END) * 1 as email_score,
      COUNT(CASE WHEN a.activity_type = 'email_click' THEN 1 END) * 3 as click_score,
      COUNT(CASE WHEN a.activity_type = 'login' THEN 1 END) * 2 as login_score,
      COUNT(CASE WHEN a.activity_type = 'call_attended' THEN 1 END) * 25 as call_score,
      MAX(a.occurred_at) as last_active
    FROM users u
    LEFT JOIN content_views cv ON cv.user_id = u.id AND cv.accessed_at > NOW() - INTERVAL '30 days'
    LEFT JOIN crm_activities a ON a.user_id = u.id AND a.occurred_at > NOW() - INTERVAL '30 days'
    WHERE u.id = $1
    GROUP BY u.id
  `, [userId]);
  
  const score = Math.min(100, (
    (last30d.content_score || 0) +
    (last30d.download_score || 0) +
    (last30d.email_score || 0) +
    (last30d.click_score || 0) +
    (last30d.login_score || 0) +
    (last30d.call_score || 0)
  ));
  
  // Decay for inactivity: -10 points per week of no login
  const daysSinceActive = Math.floor((now - last30d.last_active) / 86400000);
  const decay = Math.floor(daysSinceActive / 7) * 10;
  
  await db.query(`UPDATE users SET engagement_score = $1 WHERE id = $2`,
    [Math.max(0, score - decay), userId]
  );
  
  return Math.max(0, score - decay);
}
```

---

## 3. Email Engine (No 3rd Party Newsletter Tool)

### Architecture
```
Your Platform                          Email Delivery API
┌─────────────────┐                   ┌─────────────────┐
│ PostgreSQL      │──email content──→│ SendGrid API    │──→ Recipient inbox
│ (emails table)  │   + recipient     │ or Postmark API │
│                 │   list            │                 │
│ (email_subs     │                   └─────────────────┘
│  table)         │
│                 │←──delivery       ┌─────────────────┐
│ (email_deliv    │    webhook       │ OneSignal API   │──→ Push notification
│  eries table)   │←─────────────────│ (for alerts)    │
└─────────────────┘                   └─────────────────┘
```

### Email Types Engineered In-House

| Email Type | Trigger | Recipients | Content Source |
|---|---|---|---|
| **SRC Daily Brief** | Cron: 7am CET | All registered | Curated content from last 24h |
| **Weekly Deep-Dive** | Cron: Monday 8am | Essential+ | Original long-form analysis |
| **SRC Forecast** | Cron: 1st of month | Professional+ | Scenario analysis from studies |
| **Breaking Alert (Flash)** | Analyst approval | Executive + Partners | Alert table summary field |
| **Breaking Alert (Newsbreak)** | Analyst approval | Professional+ | Alert table summary field |
| **Onboarding** | Account creation | New user | 7-email series over 14 days |
| **Renewal Reminder** | 30 days before expiry | Annual subscribers | Personalized usage stats |
| **Win-Back** | 7 days post-churn | Churned users | "What you missed" highlights |
| **Token Invite** | Admin action | Selected recipient | Personalized invitation + activation link |
| **Referral Reward** | Threshold reached | Token holder | Reward confirmation + new referral link |
| **Payment Failed** | Stripe webhook | Subscriber | Retry link + support contact |

### Delivery API Choice
```typescript
// lib/email.ts
// Primary: Postmark (transactional email leader, Swiss-friendly)
// Fallback: SendGrid

import postmark from 'postmark';

const client = new postmark.ServerClient(process.env.POSTMARK_API_KEY);

export async function sendEmail(params: {
  to: string;
  template: string;      // 'daily_brief' | 'alert_flash' | 'onboarding_1' ...
  data: Record<string, any>;
  emailType: string;
}) {
  // 1. Render template server-side
  const html = await renderTemplate(params.template, params.data);
  
  // 2. Send via Postmark
  const result = await client.sendEmail({
    From: 'brief@src-advisory.ch',
    To: params.to,
    Subject: params.data.subject,
    HtmlBody: html,
    TextBody: htmlToText(html),
    MessageStream: params.emailType,  // Separate streams per type
  });
  
  // 3. Record delivery in PostgreSQL
  await db.query(`INSERT INTO email_deliveries ...`, [emailId, userId, result.MessageID]);
  
  // 4. Webhook will update status when delivered/opened/clicked
}
```

---

## 4. Background Jobs (Vercel Cron)

```typescript
// vercel.json
{
  "crons": [
    { "path": "/api/jobs/daily-brief", "schedule": "0 6 * * *" },      // 6am CET
    { "path": "/api/jobs/engagement-score", "schedule": "0 2 * * *" },  // 2am CET
    { "path": "/api/jobs/token-expiry", "schedule": "0 3 * * *" },     // 3am CET
    { "path": "/api/jobs/renewal-reminders", "schedule": "0 4 * * *" }, // 4am CET
    { "path": "/api/jobs/winback", "schedule": "0 5 * * 1" }          // Monday 5am
  ]
}
```

---

## 5. CRM Dashboard (Built In)

### Built directly into the Next.js app at `/admin`

**Views:**

| View | Purpose | Data Source |
|---|---|---|
| **Member Directory** | All users, filterable by tier, engagement score, status | users table |
| **Member Profile** | Single user: activity timeline, subscription, referrals | crm_activities + subscriptions + referrals |
| **Token Management** | Issue, track, revoke tokens; see referral performance | tokens + referrals |
| **Task Board** | Kanban: open → in progress → done for CRM tasks | crm_tasks |
| **Segments** | Dynamic groups: "High engagement + churn risk", "Token holders, no referrals" | crm_activities + users (SQL-based) |
| **Email Center** | Compose, schedule, view stats for all emails | emails + email_deliveries |
| **Alert Center** | Create alert, analyst approval queue, delivery status | alerts + alert_deliveries |
| **Analytics** | MRR, churn, LTV, content performance, funnel conversion | All tables aggregated |

### Key CRM Query Examples

```sql
-- Segment: High-value churn risk (engagement < 20, paid tier, renewal in 30 days)
SELECT u.*, s.current_period_end
FROM users u
JOIN subscriptions s ON s.user_id = u.id
WHERE u.engagement_score < 20
  AND u.access_type = 'paid'
  AND s.current_period_end BETWEEN NOW() AND NOW() + INTERVAL '30 days'
  AND s.status = 'active';

-- Segment: Ambassador tokens with 0 referrals (nudge candidates)
SELECT t.*, u.last_active_at
FROM tokens t
JOIN users u ON u.token_id = t.id
WHERE t.token_type = 'ambassador'
  AND t.status = 'active'
  AND t.referrals_count = 0
  AND t.activated_at < NOW() - INTERVAL '30 days';

-- Revenue dashboard: MRR by tier
SELECT t.name, COUNT(s.id) as subs, SUM(s.amount_chf) as mrr
FROM subscriptions s
JOIN tiers t ON t.id = s.tier_id
WHERE s.status = 'active'
GROUP BY t.name;
```

---

## 6. Updated Tech Stack (No 3rd Party CRM/Newsletter)

| Layer | Tool | Monthly Cost |
|---|---|---|
| **Hosting** | Vercel Pro | $20 |
| **Database** | Vercel Postgres (or Supabase Swiss) | $30 |
| **Payments** | Stripe Switzerland + TWINT | 2.9% + CHF 0.30 |
| **Email Delivery** | Postmark (10K emails/mo) | $15 |
| **Push/SMS** | OneSignal (free tier) | $0 |
| **Video Hosting** | Vimeo Pro | $20 |
| **AI Avatar** | Synthesia API | ~$200 (pay per minute) |
| **Auth** | NextAuth.js (own database) | $0 |
| **CRM** | **Built in PostgreSQL** | $0 |
| **Newsletter** | **Built in PostgreSQL + Postmark** | $0 |
| **Analytics** | Built-in dashboard + Vercel Analytics | $0 |
| **Total fixed** | | **~$285/month** |

---

## 7. Implementation Phases

### Phase 1: Foundation (Weeks 1-6)
- [ ] Deploy Vercel + PostgreSQL
- [ ] Schema migration (all tables above)
- [ ] Auth system (registration wall, login, LinkedIn OAuth)
- [ ] Stripe integration (Essential tier only)
- [ ] Email engine (Daily Brief + transactional)
- [ ] Content publishing + gating (observer + essential)
- [ ] **CRM dashboard v1** (member directory, activity feed)
- [ ] **Token system v1** (generate, activate, track)
- [ ] Issue first 50 Founder tokens

### Phase 2: Premium + vAvatar (Weeks 7-10)
- [ ] Professional tier (Stripe price + gating rules)
- [ ] vAvatar pipeline (Synthesia integration)
- [ ] Early access / reverse timewall engine
- [ ] Premium newsletters (weekly deep-dive, forecast)
- [ ] **CRM: Segments + Tasks**
- [ ] Issue 200 Ambassador + 50 Academic tokens

### Phase 3: Expert + Corporate (Weeks 11-14)
- [ ] Executive tier + live call scheduling
- [ ] Breaking news alert system
- [ ] Corporate tiers (Team/Department/Enterprise)
- [ ] Admin dashboard + seat management
- [ ] First SRC Summit planning
- [ ] Referral tracking + gamification

### Phase 4: Polish (Weeks 15-16)
- [ ] Mobile PWA + push notifications
- [ ] API access for Enterprise
- [ ] Win-back campaigns
- [ ] Analytics dashboard
- [ ] Performance optimization
