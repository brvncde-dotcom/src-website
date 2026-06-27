# SRC Advisory — Membership & Content Management System (MCMS)
## Complete Specification | v2.0

---

## 0. Philosophy: The "Swiss Vault" Model

Every user is a **record** in one system. Not "members" and "non-members" — one continuous spectrum from anonymous visitor → registered user → token holder → paying subscriber → enterprise client. The admin sees everyone, controls everything, and can grant or revoke access with one click.

Content is **SRC intellectual property** at all times. Every share, every forward, every download carries the SRC brand, copyright notice, and a link back. Think Financial Times "ft.com" on every paragraph. Think The Economist's share links that always route through their domain.

---

## 1. Enhanced Database Schema

### New & Updated Tables

```
users                    # ← enhanced: roles, admin flags, free_access_override
user_roles               # ← NEW: role-based access control
subscription_events      # ← NEW: audit log of every subscription change
subscription_schedules   # ← NEW: planned upgrades/downgrades at period end
access_grants            # ← NEW: admin-granted free access overrides
customer_notes           # ← NEW: CRM notes on customers
customer_tags            # ← NEW: tagging system for customer segmentation
saved_content            # ← NEW: bookmarks
content_shares           # ← NEW: every share tracked with IP attribution
share_templates          # ← NEW: email/social share templates with SRC branding
user_sessions            # ← NEW: login session tracking
impersonation_logs       # ← NEW: admin "login as user" audit trail
```

### Table: users (enhanced)

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS
    -- Roles & Admin
    role VARCHAR(20) DEFAULT 'member',       -- superadmin | admin | editor | analyst | member
    is_admin BOOLEAN DEFAULT FALSE,
    
    -- Free Access Override (NEW)
    free_access_granted_by UUID REFERENCES users(id),
    free_access_granted_at TIMESTAMPTZ,
    free_access_expires_at TIMESTAMPTZ,
    free_access_reason TEXT,                  -- "Board member" | "Strategic partner" | "Government liaison"
    free_access_tier_override UUID REFERENCES tiers(id), -- Which tier they get for free
    
    -- Manual tier assignment (NEW)
    tier_assigned_by UUID REFERENCES users(id),
    tier_assigned_at TIMESTAMPTZ,
    tier_assignment_reason TEXT,
    
    -- Content sharing (NEW)
    can_share BOOLEAN DEFAULT TRUE,
    share_count_total INT DEFAULT 0,
    
    -- Status expanded
    status VARCHAR(20) DEFAULT 'active',     -- active | paused | churned | banned | pending_verification
    
    -- Lifecycle
    churned_at TIMESTAMPTZ,
    churn_reason TEXT,
    first_payment_at TIMESTAMPTZ,
    lifetime_value_chf DECIMAL(10,2) DEFAULT 0,
    
    -- Communication
    preferred_contact_method VARCHAR(20) DEFAULT 'email', -- email | phone | sms
    phone VARCHAR(50),
    
    -- GDPR
    marketing_consent BOOLEAN DEFAULT FALSE,
    consent_recorded_at TIMESTAMPTZ,
    data_processing_consent BOOLEAN DEFAULT FALSE;

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_free_access ON users(free_access_granted_by) WHERE free_access_granted_by IS NOT NULL;
CREATE INDEX idx_users_admin ON users(is_admin) WHERE is_admin = TRUE;
```

### Table: user_roles (NEW)

```sql
CREATE TABLE user_roles (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role        VARCHAR(30) NOT NULL,
    -- superadmin: full system access
    -- admin: user management, content management, CRM
    -- editor: content creation and publishing
    -- analyst: content creation + alert management
    -- billing_admin: subscriptions and refunds
    -- token_manager: token issuance and tracking
    -- event_manager: event creation and registrations
    granted_by  UUID NOT NULL REFERENCES users(id),
    granted_at  TIMESTAMPTZ DEFAULT NOW(),
    revoked_at  TIMESTAMPTZ,
    UNIQUE(user_id, role)
);

-- Admin-only role: can impersonate users
CREATE TABLE impersonation_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id   UUID NOT NULL REFERENCES users(id),
    target_user_id  UUID NOT NULL REFERENCES users(id),
    started_at      TIMESTAMPTZ DEFAULT NOW(),
    ended_at        TIMESTAMPTZ,
    actions_taken   TEXT[],  -- what the admin did while impersonating
    ip_address      INET
);
```

### Table: subscription_events (NEW)

```sql
CREATE TABLE subscription_events (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID NOT NULL REFERENCES subscriptions(id),
    user_id         UUID NOT NULL REFERENCES users(id),
    
    event_type      VARCHAR(30) NOT NULL,
    -- created | activated | upgraded | downgraded | paused | resumed 
    -- canceled | expired | renewed | refunded | charged_back | modified
    
    -- Before/after for tracking changes
    from_tier_id    UUID REFERENCES tiers(id),
    to_tier_id      UUID REFERENCES tiers(id),
    from_amount     DECIMAL(10,2),
    to_amount       DECIMAL(10,2),
    from_interval   VARCHAR(10),
    to_interval     VARCHAR(10),
    
    -- Who made the change
    initiated_by    VARCHAR(20) NOT NULL DEFAULT 'user', -- user | admin | system | stripe_webhook
    admin_user_id   UUID REFERENCES users(id),           -- if initiated by admin
    
    -- Stripe
    stripe_event_id VARCHAR(100),
    
    reason          TEXT,                                  -- "User requested upgrade" | "Admin granted free access"
    metadata        JSONB,
    
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sub_events_sub ON subscription_events(subscription_id);
CREATE INDEX idx_sub_events_user ON subscription_events(user_id);
CREATE INDEX idx_sub_events_type ON subscription_events(event_type);
CREATE INDEX idx_sub_events_admin ON subscription_events(admin_user_id);
```

### Table: subscription_schedules (NEW)

```sql
CREATE TABLE subscription_schedules (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID NOT NULL REFERENCES subscriptions(id),
    
    -- What will happen
    action          VARCHAR(20) NOT NULL, -- upgrade | downgrade | cancel | pause | resume
    target_tier_id  UUID REFERENCES tiers(id),
    
    -- When
    scheduled_at    TIMESTAMPTZ NOT NULL,
    executed_at     TIMESTAMPTZ,
    
    -- Who scheduled it
    scheduled_by    UUID NOT NULL REFERENCES users(id),
    
    status          VARCHAR(20) DEFAULT 'pending', -- pending | executed | cancelled
    
    UNIQUE(subscription_id, status) WHERE status = 'pending'
);
```

### Table: access_grants (NEW)

```sql
CREATE TABLE access_grants (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Who received
    user_id         UUID NOT NULL REFERENCES users(id),
    
    -- What they get
    grant_type      VARCHAR(20) NOT NULL, -- free_tier | complimentary_period | content_unlock | feature_unlock
    granted_tier_id UUID REFERENCES tiers(id),
    
    -- Duration
    starts_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at      TIMESTAMPTZ,
    is_permanent    BOOLEAN DEFAULT FALSE,
    
    -- Content-specific (for content_unlock)
    content_id      UUID REFERENCES content(id),
    
    -- Who granted and why
    granted_by      UUID NOT NULL REFERENCES users(id),
    granted_at      TIMESTAMPTZ DEFAULT NOW(),
    reason          TEXT NOT NULL,          -- mandatory justification
    
    -- Status
    status          VARCHAR(20) DEFAULT 'active', -- active | expired | revoked
    revoked_by      UUID REFERENCES users(id),
    revoked_at      TIMESTAMPTZ,
    revoke_reason   TEXT,
    
    -- Stripe: if complimentary, create $0 subscription
    stripe_subscription_id VARCHAR(100)
);

CREATE INDEX idx_access_grants_user ON access_grants(user_id);
CREATE INDEX idx_access_grants_status ON access_grants(status);
CREATE INDEX idx_access_grants_granted_by ON access_grants(granted_by);
```

### Table: customer_notes (NEW)

```sql
CREATE TABLE customer_notes (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id),
    
    -- The note
    note_type       VARCHAR(20) DEFAULT 'general', -- general | call | meeting | complaint | milestone | task
    content         TEXT NOT NULL,
    
    -- Author
    created_by      UUID NOT NULL REFERENCES users(id),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    
    -- Follow-up
    follow_up_at    TIMESTAMPTZ,
    follow_up_completed BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_notes_user ON customer_notes(user_id);
CREATE INDEX idx_notes_followup ON customer_notes(follow_up_at) WHERE follow_up_at IS NOT NULL;
```

### Table: customer_tags (NEW)

```sql
CREATE TABLE customer_tags (
    id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    tag     VARCHAR(50) NOT NULL,
    added_by UUID NOT NULL REFERENCES users(id),
    added_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, tag)
);

-- Common tags: high_value, churn_risk, token_holder, enterprise_contact, 
--              journalist, government, academic, summit_invitee, referrer
```

### Table: saved_content (NEW)

```sql
CREATE TABLE saved_content (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content_id      UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
    
    -- Metadata
    saved_at        TIMESTAMPTZ DEFAULT NOW(),
    note            TEXT,                       -- user's personal note
    folder          VARCHAR(100) DEFAULT 'default', -- for future folder organization
    
    -- Share tracking
    shared_count    INT DEFAULT 0,
    last_shared_at  TIMESTAMPTZ,
    
    UNIQUE(user_id, content_id)
);

CREATE INDEX idx_saved_user ON saved_content(user_id);
CREATE INDEX idx_saved_content ON saved_content(content_id);
```

### Table: content_shares (NEW)

```sql
CREATE TABLE content_shares (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Who shared
    user_id         UUID NOT NULL REFERENCES users(id),
    content_id      UUID NOT NULL REFERENCES content(id),
    
    -- How shared
    share_channel   VARCHAR(20) NOT NULL, -- email | twitter | linkedin | whatsapp | copy_link | embed
    
    -- IP Protection: every share gets a unique tracked URL
    share_url       TEXT NOT NULL,          -- e.g., https://src-advisory.ch/s/a1b2c3d4
    share_token     VARCHAR(32) UNIQUE NOT NULL, -- unique token for tracking
    
    -- For email shares
    recipient_email VARCHAR(255),
    recipient_count INT DEFAULT 1,           -- for group emails
    
    -- Attribution (always included)
    attribution_text TEXT NOT NULL DEFAULT 'Shared via SRC Advisory — Security & Resilience Counsel. Read the full article at src-advisory.ch',
    copyright_notice TEXT NOT NULL DEFAULT '© SRC Advisory AG. All rights reserved. This content may not be reproduced without permission.',
    
    -- Recipients who clicked (for email shares)
    clicks          INT DEFAULT 0,
    
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_shares_user ON content_shares(user_id);
CREATE INDEX idx_shares_content ON content_shares(content_id);
CREATE INDEX idx_shares_token ON content_shares(share_token);
```

### Table: share_templates (NEW)

```sql
CREATE TABLE share_templates (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    template_type   VARCHAR(20) NOT NULL, -- email | twitter | linkedin | whatsapp
    name            VARCHAR(100) NOT NULL,
    
    -- Template with placeholders: {{title}}, {{excerpt}}, {{author}}, {{url}}, {{attribution}}
    subject_template VARCHAR(300),
    body_template   TEXT NOT NULL,
    
    -- Always appended (cannot be edited by user)
    footer_template TEXT NOT NULL DEFAULT 
        '---\n© SRC Advisory AG | Global Security Intelligence. Swiss Independence.\nFull article: {{url}} | Subscribe: src-advisory.ch',
    
    is_active       BOOLEAN DEFAULT TRUE,
    is_default      BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Seed templates
INSERT INTO share_templates (template_type, name, body_template, is_default) VALUES
('email', 'Default Email', 
 'Hi,\n\nI thought you''d find this interesting:\n\n**{{title}}** by {{author}}\n\n{{excerpt}}\n\nRead more: {{url}}\n\n{{attribution}}', 
 true),
('twitter', 'Twitter/X',
 '{{title}} by {{author}} — worth a read. {{url}} via @SRC_Advisory #security #geopolitics'),
('linkedin', 'LinkedIn',
 'Recommended reading from SRC Advisory:\n\n{{title}}\n{{excerpt}}\n\n{{url}}'),
('whatsapp', 'WhatsApp',
 '{{title}}\n\n{{excerpt}}\n\nRead: {{url}}\n\n— Shared from SRC Advisory');
```

---

## 2. Admin Screens: User & Subscription Management

### Screen A: User Management (Admin)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  SRC Advisory    Dashboard  Content  Users  Subscriptions  Tokens  CRM  ⚙️  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  👥 User Management                              [+ Grant Free Access]      │
│  ━━━━━━━━━━━━━━━━━━                              [+ Invite User]            │
│                                                                             │
│  Filters:  [All Tiers ▼]  [All Status ▼]  [All Roles ▼]  [All Tags ▼]     │
│           ┌─────────────┐  ┌─────────────┐  ┌─────────────┐               │
│           │🔍 Search... │  │ Engagement  │  │ Date range  │  [Export CSV] │
│           └─────────────┘  └─────────────┘  └─────────────┘               │
│                                                                             │
│  ┌────────┬──────────────┬─────────┬────────┬──────────┬────────┬────────┐│
│  │ Select │ Member       │ Tier    │ Status │ Access   │ Eng.   │ Actions││
│  ├────────┼──────────────┼─────────┼────────┼──────────┼────────┼────────┤│
│  │   ☐    │ Sarah M.     │🔵 Exec │ active │ paid     │  85 🟢 │ 👁 ✏ 🚫 ││
│  │        │ sarah@c...   │        │        │ Stripe   │        │        ││
│  ├────────┼──────────────┼─────────┼────────┼──────────┼────────┼────────┤│
│  │   ☐    │ Hans K.      │🔵 Pro  │ active │ paid     │  45 🟡 │ 👁 ✏ 🚫 ││
│  │        │ hans@dgap    │        │        │ Stripe   │        │        ││
│  ├────────┼──────────────┼─────────┼────────┼──────────┼────────┼────────┤│
│  │   ☐    │ Aisha B.     │🟡 Tokn │ active │ founder  │  18 🔴 │ 👁 ✏ 🔁 ││
│  │        │ aisha@rai    │        │        │ token    │        │  Nudge ││
│  ├────────┼──────────────┼─────────┼────────┼──────────┼────────┼────────┤│
│  │   ☐    │ Marcus T.    │⚪ Obs  │churned │ free     │   5 🔴 │ 👁 ✏ 🔄 ││
│  │        │ marcus@blm   │        │        │          │        │ WinBck ││
│  ├────────┼──────────────┼─────────┼────────┼──────────┼────────┼────────┤│
│  │   ☐    │ Pierre L.    │🔵 Exec │ active │ FREE     │  62 🟢 │ 👁 ✏ 🚫 ││
│  │        │ pierre@gov   │        │        │ Admin    │        │        ││
│  │        │              │        │        │ granted  │        │        ││
│  ├────────┼──────────────┼─────────┼────────┼──────────┼────────┼────────┤│
│  │   ☐    │ Elena R.     │🔵 Pro  │ active │ paid     │  92 🟢 │ 👁 ✏ 🚫 ││
│  │        │ elena@uni    │        │        │ Stripe   │        │        ││
│  └────────┴──────────────┴─────────┴────────┴──────────┴────────┴────────┘│
│                                                                             │
│  Showing 1-25 of 1,247 users      [← Prev]  [1] [2] [3] ... [50] [Next →] │
│                                                                             │
│  Bulk actions: [Change Tier ▼]  [Add Tag ▼]  [Export Selected]            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Key features:**
- **Access column** shows the SOURCE of their access: `paid` (Stripe), `token` (which type), `free` (admin granted), `comp` (complimentary)
- **Actions per row**: View profile 👁, Edit ✏, Revoke/Ban 🚫, Nudge 🔁 (for dormant), Win-back 🔄 (for churned)
- **Bulk actions**: Select multiple users → change tier, add tags, export
- **Green/yellow/red engagement bars** for at-a-glance health scoring

---

### Screen B: Grant Free Access (Admin Modal)

```
┌──────────────────────────────────────────────────────────────┐
│  ⚡ Grant Free Access                              [× Close] │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Member: Pierre L. (pierre@government.ch)                    │
│  Current: Observer (free)                                    │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐    │
│  │ Access Type:                                         │    │
│  │  (•) Free Tier Access     ( ) Complimentary Period   │    │
│  │  ( ) Content Unlock       ( ) Feature Only           │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                               │
│  Select Tier:  [🔵 Executive  ▼]                              │
│                                                               │
│  Duration:     [Indefinite ▼]  or  [12 months ▼]             │
│                                                               │
│  Reason (required):                                           │
│  ┌──────────────────────────────────────────────────────┐    │
│  │ Government liaison — Swiss Federal Department of     │    │
│  │ Defence. Attending summit as speaker.                │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                               │
│  Notify user by email:  [✓] Yes                              │
│  Include referral link: [✓] Yes (as Ambassador token)        │
│                                                               │
│  [ Cancel ]              [ ✓ Grant Access ]                   │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

**What happens on grant:**
1. Row inserted into `access_grants` table with full audit trail
2. User's `current_tier_id` updated to selected tier
3. `free_access_granted_by`, `free_access_granted_at`, `free_access_reason` populated
4. If "Include referral link" checked → token created automatically (Ambassador type)
5. Email sent to user with welcome message + login link
6. Stripe: $0 subscription created (for tracking, not billing)
7. `subscription_events` row inserted: `event_type='modified'`, `initiated_by='admin'`

---

### Screen C: Customer Detail / Subscription Management

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  SRC Advisory    Dashboard  Content  Users  Subscriptions  Tokens  CRM  ⚙️  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ← Back to Users                                                            │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  ┌────┐  Sarah Mitchell                                              │   │
│  │  │ SM │  sarah@consilium.eu  •  +41 79 123 4567                     │   │
│  │  └────┘  🇬🇧 London, UK  •  LinkedIn  •  Joined Jun 15, 2026        │   │
│  │                                                                       │   │
│  │  Tags:  [high_value] [summit_invitee] [referrer]                     │   │
│  │  Engagement:  85/100 🟢  |  Last active: 2 hours ago                 │   │
│  │                                                                       │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────┐ │   │
│  │  │ 👁 Impersonate│  │ ✏ Edit User  │  │ 🚫 Ban/Suspend│  │ 📝 Add Note│ │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  └──────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌────────────────────────────┐  ┌──────────────────────────────────────┐  │
│  │  💳 Subscription            │  │  📋 Activity Timeline                 │  │
│  │  ━━━━━━━━━━━━━━━            │  │  ━━━━━━━━━━━━━━━━━━                  │  │
│  │                             │  │                                       │  │
│  │  Current:  🔵 Executive     │  │  Jun 26  14:30  📧 Opened Daily Brief │  │
│  │  Status:   ✅ Active        │  │  Jun 26  11:00  📑 Downloaded report  │  │
│  │  Since:    Jan 15, 2026     │  │  Jun 25  18:00  🎥 Watched vAvatar    │  │
│  │  Renews:   Jan 15, 2027     │  │  Jun 25  09:00  💬 Attended live call │  │
│  │  Amount:   CHF 1,490/year   │  │  Jun 20  ———    💳 Payment succeeded  │  │
│  │  Stripe:   sub_abc123       │  │  Jun 15  ———    🔔 Alert: Europe      │  │
│  │                             │  │  Jun 01  ———    📧 Weekly Deep-Dive   │  │
│  │  ┌──────────────────────┐   │  │  May 28  ———    📑 Saved 3 articles   │  │
│  │  │ ▶ Payment History    │   │  │  May 15  ———    🔗 Shared via LinkedIn│  │
│  │  │   Jan 15: CHF 1,490 ✅│   │  │                                       │  │
│  │  └──────────────────────┘   │  │                                       │  │
│  │                             │  └──────────────────────────────────────┘  │
│  │  [ Change Tier ]  [ Pause ]  [ Cancel ]  [ Refund ]                      │
│  │  (admin override)                                                                 │
│  │                             │                                            │
│  │  ── Scheduled Changes ──    │  ┌──────────────────────────────────────┐  │
│  │  None                       │  │  🔗 Referrals                         │  │
│  │                             │  │  ━━━━━━━━━━━━                        │  │
│  │  [ + Schedule Change ]      │  │  Personal link: src-advisory.ch/r/.. │  │
│  │                             │  │  Referrals: 4 | Converted: 2         │  │
│  └────────────────────────────┘  │  Revenue attributed: CHF 1,580       │  │
│                                   └──────────────────────────────────────┘  │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  📝 Customer Notes                                                    │  │
│  │  ━━━━━━━━━━━━━━━━━                                                   │  │
│  │                                                                       │  │
│  │  Jun 20  —  Admin: "Called about summit attendance. Confirmed."       │  │
│  │  Jun 10  —  Admin: "Offered upgrade to Corporate. Declined for now."  │  │
│  │  May 15  —  System: "Engagement spike: 3 shares in one week."         │  │
│  │                                                                       │  │
│  │  [ + Add Note ]                                                       │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Admin actions on subscription:**
- **Change Tier**: Immediate or scheduled at period end. Logs `subscription_events` row.
- **Pause**: Temporarily deactivate (e.g., customer traveling). Content access frozen.
- **Cancel**: Immediate or at period end. Churn survey shown to user.
- **Refund**: Partial or full via Stripe. `subscription_events` row with `event_type='refunded'`.
- **Impersonate**: Login as user to see exactly what they see. Every action logged in `impersonation_logs`.
- **Schedule Change**: Plan upgrade/downgrade/cancel for future date (e.g., "downgrade to Professional at next renewal")

---

### Screen D: Subscription Management (Admin Overview)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  SRC Advisory    Dashboard  Content  Users  Subscriptions  Tokens  CRM  ⚙️  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  💳 Subscription Management                                                   │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━                                                    │
│                                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│  │   Active    │  │   Paused    │  │  Past Due   │  │  Churned    │       │
│  │    742      │  │     12      │  │     8       │  │    156      │       │
│  │  CHF 48K/mo │  │             │  │  CHF 640/mo │  │             │       │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘       │
│                                                                             │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ MRR Trend (6 months)                                                   │ │
│  │  CHF 60K │                                      ╭──────               │ │
│  │  CHF 50K │                              ╭──────╯                      │ │
│  │  CHF 40K │                        ╭────╯                             │ │
│  │  CHF 30K │                  ╭────╯                                    │ │
│  │  CHF 20K │            ╭────╯                                         │ │
│  │  CHF 10K │      ╭────╯                                                │ │
│  │        0 └─────╯   Jan   Feb   Mar   Apr   May   Jun                 │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  Filters:  [All Tiers ▼]  [Active ▼]  [Billing Cycle ▼]  [🔍 Search]      │
│                                                                             │
│  ┌──────────┬──────────┬────────┬──────────┬────────┬────────┬──────────┐ │
│  │ User     │ Tier     │ Amount │ Cycle    │ Status │ Renews │ Actions  │ │
│  ├──────────┼──────────┼────────┼──────────┼────────┼────────┼──────────┤ │
│  │ Sarah M. │ Executive│ CHF149 │ Annual   │ Active │ Jan 27 │ 👁 ✏ ⏸ 🔁 │
│  │ Hans K.  │ Pro      │ CHF 79 │ Monthly  │ Active │ Jul 15 │ 👁 ✏ ⏸ 🔁 │
│  │ Pierre L │ Executive│ CHF  0 │ Annual   │ Free   │ Jun 27 │ 👁 ✏ ⏸ ✕ │ │
│  │          │          │        │          │ Admin  │        │ (admin)  │ │
│  │ Elena R. │ Pro      │ CHF 79 │ Annual   │ Active │ Mar 12 │ 👁 ✏ ⏸ 🔁 │
│  │ Acme Inc │ Entrepr. │ CHF2,49│ Annual   │ Active │ Sep 01 │ 👁 ✏ ⏸ 📄 │
│  └──────────┴──────────┴────────┴──────────┴────────┴────────┴──────────┘ │
│                                                                             │
│  [Export All]  [Bulk: Pause Selected]  [Bulk: Tag as Churn Risk]          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Save & Share System (IP-Protected)

### How Saving Works

```
User clicks 🔖 Save on article
  → Row inserted into saved_content (user_id + content_id + timestamp)
  → Button changes to "✓ Saved"
  → Article appears in user's "Saved" folder in sidebar
  → Can add personal note: "Use for Q3 report" 
  → Organize into folders (future: "Energy Research", "AI Governance")
```

### How Sharing Works (IP-Protected)

```
User clicks 🔗 Share
  → Share modal opens with 4 tabs: Email | Social | Copy Link | Embed
  →
  ┌────────────────────────────────────────────────────────────┐
  │  Share: "Energy Security in the Baltics"         [× Close] │
  ├────────────────────────────────────────────────────────────┤
  │  [ Email ]  [ Social ]  [ Copy Link ]  [ Embed ]          │
  │                                                             │
  │  ┌────────────────────────────────────────────────────┐    │
  │  │ To: [ colleague@company.com, ... ]                  │    │
  │  │ Subject: Energy Security in the Baltics — SRC      │    │
  │  │                                                     │    │
  │  │ Hi,                                                 │    │
  │  │                                                     │    │
  │  │ I thought you'd find this interesting:              │    │
  │  │                                                     │    │
  │  │ **Energy Security in the Baltics** by Dr. Klaus M. │    │
  │  │                                                     │    │
  │  │ This report examines the implications of...         │    │
  │  │                                                     │    │
  │  │ Read more: https://src-advisory.ch/s/a1b2c3d4       │    │
  │  │                                                     │    │
  │  │ — Shared via SRC Advisory — Security & Resilience   │    │
  │  │   Counsel. Swiss Independence.                      │    │
  │  │   © SRC Advisory AG. All rights reserved.           │    │
  │  │   Full article: src-advisory.ch | Subscribe         │    │
  │  └────────────────────────────────────────────────────┘    │
  │                                                             │
  │  [✓] Include executive summary (200 words)                  │
  │  [✓] Include author bio                                     │
  │  [ ] Request read receipt                                   │
  │                                                             │
  │  [ Cancel ]              [ ✓ Send Email ]                    │
  │                                                             │
  │  ── IP Protection ──                                         │
  │  Every share includes: © notice, tracked URL, SRC branding. │
  │  Recipients without SRC accounts see a preview + subscribe CTA│
└────────────────────────────────────────────────────────────┘
```

### Share URL System (IP Protection Engine)

```
Original URL: https://src-advisory.ch/reports/energy-security-baltics
Share URL:    https://src-advisory.ch/s/a1b2c3d4

How it works:
1. Unique token `a1b2c3d4` created in content_shares table
2. Token maps to: content_id + sharer_user_id + share_channel + timestamp
3. When recipient visits /s/a1b2c3d4:
   - Content shown with FULL branding (SRC logo, header, footer)
   - "Shared by Sarah Mitchell" attribution badge
   - Excerpt displayed (not full article unless recipient has account)
   - "Read the full article — subscribe or log in" CTA
   - Click tracked in content_shares.clicks
   - If new user signs up: attributed to Sarah as a referral
```

### Social Share (IP-Protected)

| Platform | What Gets Shared | IP Protection |
|---|---|---|
| **Twitter/X** | Auto-composed tweet with title, excerpt, tracked URL, `@SRC_Advisory` tag, hashtags | URL routes through src-advisory.ch, preview card shows SRC branding |
| **LinkedIn** | Post with title, excerpt, tracked URL, SRC logo in preview | LinkedIn preview card always shows SRC header image |
| **WhatsApp** | Formatted message with excerpt, tracked URL, "— via SRC Advisory" footer | URL is tracked; recipient sees branded preview |
| **Copy Link** | Tracked URL copied to clipboard | URL includes share token; every click logged |
| **Embed** | `<iframe>` code for websites | Frame includes SRC header/footer; content truncated without account |

### The Share Footer (Always Present)

```
─────────────────────────────────────────────
© SRC Advisory AG | Global Security Intelligence. Swiss Independence.
Based in Zug, Switzerland | www.src-advisory.ch

This content is the intellectual property of SRC Advisory AG.
Unauthorized reproduction or distribution is prohibited.

Read the full article: https://src-advisory.ch/s/a1b2c3d4
Subscribe: https://src-advisory.ch/join
Shared by: Sarah Mitchell (sarah@consilium.eu)
─────────────────────────────────────────────
```

---

## 4. API Endpoints (New & Updated)

### User Management (Admin-only)

```
GET    /api/admin/users                    # List all users (paginated, filterable)
GET    /api/admin/users/:id                # Get full user profile
PATCH  /api/admin/users/:id                # Update user fields, tier, status
PATCH  /api/admin/users/:id/tier           # Change tier (immediate or scheduled)
POST   /api/admin/users/:id/grant-access   # Grant free access (access_grants table)
DELETE /api/admin/users/:id/grant-access   # Revoke free access
POST   /api/admin/users/:id/impersonate    # Start impersonation session
DELETE /api/admin/users/:id/impersonate    # End impersonation session
POST   /api/admin/users/:id/notes          # Add customer note
GET    /api/admin/users/:id/subscriptions  # Get subscription history
GET    /api/admin/users/:id/activities     # Get CRM activity feed
GET    /api/admin/users/:id/shares         # Get content shares by this user
GET    /api/admin/users/:id/saved          # Get saved content by this user
```

### Subscription Management (Admin + User)

```
GET    /api/admin/subscriptions            # List all subscriptions
GET    /api/admin/subscriptions/:id        # Get subscription detail
GET    /api/admin/subscriptions/:id/events # Get event history
POST   /api/admin/subscriptions/:id/change-tier   # Change tier
POST   /api/admin/subscriptions/:id/pause         # Pause
POST   /api/admin/subscriptions/:id/resume        # Resume
POST   /api/admin/subscriptions/:id/cancel        # Cancel (now or at period end)
POST   /api/admin/subscriptions/:id/refund        # Process refund
POST   /api/admin/subscriptions/:id/schedule      # Schedule future change
GET    /api/admin/subscriptions/stats             # MRR, churn, etc.
```

### Save & Share (Authenticated Users)

```
POST   /api/content/:id/save               # Bookmark content
DELETE /api/content/:id/save               # Remove bookmark
GET    /api/me/saved                       # List saved content
PATCH  /api/me/saved/:id/note              # Update personal note

POST   /api/content/:id/share              # Create share
       Body: { channel: "email", recipients: [...], message: "..." }
GET    /api/me/shares                      # List my shares
GET    /api/shares/:token                  # Public: view shared content
POST   /api/shares/:token/track            # Public: record click
```

---

## 5. The Complete System Map

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SRC ADVISORY — MCMS v2.0                            │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         DATA LAYER                                   │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │   │
│  │  │  users   │ │subscriptions│ │ tokens  │ │ content │ │ access_  │  │   │
│  │  │ +roles   │ │  +events   │ │         │ │ +shares │ │ grants   │  │   │
│  │  │ +admin   │ │ +schedules │ │         │ │ +saves  │ │          │  │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘  │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │   │
│  │  │  emails  │ │  alerts  │ │ crm_acts │ │crm_tasks │ │  notes   │  │   │
│  │  │+deliveries│ │+deliveries│ │+scores   │ │          │ │  +tags   │  │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                              │                                              │
│  ┌───────────────────────────┼───────────────────────────────────────┐   │
│  │                    API LAYER (Next.js + Vercel)                    │   │
│  │                         │                                          │   │
│  │    ┌────────────────────┼────────────────────┐                   │   │
│  │    │  PUBLIC            │  AUTHENTICATED     │  ADMIN ONLY       │   │
│  │    │                    │                    │                   │   │
│  │    │  /content (public) │  /dashboard        │  /admin/users     │   │
│  │    │  /content/:id      │  /content/:id      │  /admin/subs      │   │
│  │    │  /pricing          │  /saved            │  /admin/crm       │   │
│  │    │  /s/:token         │  /settings         │  /admin/tokens    │   │
│  │    │  /register         │  /billing          │  /admin/alerts    │   │
│  │    │  /login            │  /referrals        │  /admin/analytics │   │
│  │    │  /activate/:code   │  /share/:id        │  /admin/content   │   │
│  │    └────────────────────┴────────────────────┘                   │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                              │                                              │
│  ┌───────────────────────────┼───────────────────────────────────────┐   │
│  │                    INTEGRATION LAYER                                 │   │
│  │                                                                      │   │
│  │   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐       │   │
│  │   │  Stripe  │   │ Postmark │   │Synthesia │   │ OneSignal│       │   │
│  │   │ Payments │   │  Email   │   │ vAvatar  │   │  Push    │       │   │
│  │   └──────────┘   └──────────┘   └──────────┘   └──────────┘       │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Implementation Priority

### Week 1-2: Core User Management
- [ ] Enhanced `users` table with roles, admin flags, free access columns
- [ ] `user_roles` table + middleware for route protection
- [ ] `/admin/users` screen: list, filter, search, bulk actions
- [ ] User detail screen: view profile, edit, impersonate, add notes

### Week 3-4: Subscription Management
- [ ] `subscription_events` + `subscription_schedules` tables
- [ ] Admin tier change (immediate + scheduled), pause, cancel, refund
- [ ] `/admin/subscriptions` screen with MRR dashboard
- [ ] Customer detail screen with subscription history + activity timeline

### Week 5: Free Access Granting
- [ ] `access_grants` table + UI modal for admin
- [ ] "Grant Free Access" button on user list and detail screens
- [ ] Automatic email notification to granted user
- [ ] Stripe $0 subscription creation for tracking

### Week 6: Save & Share
- [ ] `saved_content` table + bookmark button on all content
- [ ] "My Saved" page in member sidebar
- [ ] `content_shares` + `share_templates` tables
- [ ] Share modal: Email / Social / Copy Link / Embed tabs
- [ ] Tracked share URLs (`/s/:token`) with branded preview page
- [ ] Mandatory SRC copyright footer on all shares

### Week 7-8: CRM Polish
- [ ] `customer_notes` + `customer_tags` tables
- [ ] Engagement score calculation (daily cron)
- [ ] CRM task auto-generation ("Follow up with churn risk user X")
- [ ] Analytics dashboard: MRR, churn rate, LTV, content performance
- [ ] Referral leaderboard in admin
