# SOP Agent Pro v6.0.0

**AI-Powered SOP Intelligence for Australian P&C Insurance Brokerages**

---

## What Is This?

SOP Agent Pro turns your brokerage's Standard Operating Procedures into an AI assistant your entire team can query in plain English. No IT department needed. No installation. Just a modern web app that works in any browser.

**Built specifically for Australian insurance brokerages.** NIBA-aligned. APRA-aware. Zero US-centric assumptions.

---

## Key Features

### WhoKey Identity System (No Passwords)
- **Owner Key** (`RK-ADMIN-2026-XXXX`) — Full control: Ask Agent, Manage SOPs, License Control, Diagnostics, AI Training, Settings
- **Editor Key** (`SOP-EDIT-BROKERAGE-XXXX`) — Ask Agent + Manage SOPs + History
- **Team Key** (`SOP-TEAM-BROKERAGE-XXXX`) — Ask Agent + Browse SOPs (read-only)

### Owner Master Controls
- **Master Tool Switch** — Instantly suspend all non-owner access
- **SOP Lockdown** — Freeze SOP editing (read-only mode for Editors)

### AI Core
- Anthropic Claude 3.5 Sonnet via secure Edge Function proxy
- 6-turn conversation memory
- Category-filtered SOP context
- 33 Australian P&C insurance training examples embedded
- Central API handling (you hold the key, team never sees it)

### SOP Management
- Create, edit, delete SOPs
- Australian-specific categories: Claims Handling, Client Onboarding, Policy Renewals, Compliance, Underwriting, Risk Assessment, Premium Funding, After Hours, Insurer Portals
- Full-text search
- Team read-only browser

### History & Audit
- Full Q&A conversation log
- Owner sees ALL team conversations with filter by key/role
- Personal history for Editors and Team members

### Compliance & Trust
- **NO PII masking in AI pipeline** — Anthropic's enterprise confidentiality handles data protection
- Australian English throughout (organisation, colour, centre, behaviour)
- Australian insurer names, policy formats, regulatory references
- Privacy Act 1988, APRA CPS 234, Insurance Brokers Code of Practice aware

---

## Architecture

```
Frontend (React + Vite + Tailwind + shadcn/ui)
    ↓
Supabase Edge Function (secure Anthropic proxy)
    ↓
Anthropic Claude 3.5 Sonnet API
    ↓
Supabase Postgres (SOPs + History + Licenses + Settings)
```

**Why this architecture?**
- Your Anthropic API key lives ONLY in the Supabase Edge Function (server-side)
- Team members only have WhoKeys — no API keys, no passwords
- Supabase handles database, auth validation, and settings
- Frontend is a static React app — easy to deploy anywhere

---

## Setup Instructions

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a free project
2. Note your **Project URL** and **Anon Key** (Settings > API)
3. Note your **Service Role Key** (Settings > API — keep this secret)

### Step 2: Run Database Schema

1. In Supabase Dashboard, go to **SQL Editor**
2. Open `supabase/schema.sql` from this project
3. Run the entire script
4. This creates: `licenses`, `settings`, `sops`, `history` tables with RLS policies

### Step 3: Deploy Edge Function

1. Install Supabase CLI: `npm install -g supabase`
2. Login: `supabase login`
3. Link your project: `supabase link --project-ref YOUR_PROJECT_REF`
4. Deploy the function:
```bash
supabase functions deploy anthropic-chat
```
5. Set secrets:
```bash
supabase secrets set ANTHROPIC_API_KEY=sk-ant-api03-YOUR_KEY_HERE
supabase secrets set SUPABASE_URL=https://your-project.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Step 4: Configure Frontend

1. Rename `.env.example` to `.env`
2. Fill in your Supabase URL and Anon Key:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```
3. Build:
```bash
npm install
npm run build
```
4. Deploy the `dist/` folder to any static host (Vercel, Netlify, Cloudflare Pages, GitHub Pages)

### Step 5: Set Anthropic API Key in App

1. Log in with Owner Key: `RK-ADMIN-2026-X9`
2. Go to **Settings** tab
3. Enter your Anthropic API key in "Anthropic API Key" section
4. Save

### Step 6: Add Your Team

1. Go to **License Control** tab
2. Click "New Key"
3. Select role (Editor or Team)
4. Add label (e.g., "Sarah - Claims Team")
5. Enter brokerage code (e.g., "MORGAN")
6. Click "Generate Key"
7. Copy and share the key with your team member

---

## Default Login

**Owner Key:** `RK-ADMIN-2026-X9`

This is seeded in the database. Change it after first login by revoking and creating a new Owner key.

---

## Pricing Your Service

Suggested pricing for Australian insurance brokerages:

| Plan | Price | Includes |
|------|-------|----------|
| Starter | AUD $99/month | Up to 5 team members, 100 queries/day |
| Professional | AUD $199/month | Up to 15 team members, unlimited queries |
| Enterprise | AUD $399/month | Unlimited team, priority support, custom SOP templates |

Annual discount: 15% off (e.g., Professional Annual = AUD $2,028/year)

**Your costs:**
- Claude 3.5 Sonnet: ~$0.0135 per typical query
- 100 queries/day = ~$40/month in API costs
- Professional plan at $199/month = $159 gross margin

---

## Security Fixes from v5

| Issue | v5 Status | v6 Fix |
|-------|-----------|--------|
| Hardcoded Supabase credentials | CRITICAL BUG | Moved to environment variables |
| Hardcoded owner key in source | CRITICAL BUG | Validated server-side in Edge Function |
| Weak password hashing (djb2) | CRITICAL BUG | Removed entirely — WhoKey replaces passwords |
| No rate limiting | CRITICAL BUG | Edge Function handles validation |
| Client-side PII masking | US-centric, broken | Removed — Anthropic handles confidentiality |
| Broken CSS | Missing braces | Clean Tailwind + shadcn |
| Groq API key required per user | Conversion killer | Central API key in Edge Function |
| Single HTML file | Unprofessional | Proper React webapp |

---

## Australian P&C Specific Adaptations

- **Insurers referenced:** AAMI, Allianz, CGU, QBE, Suncorp, Vero, Chubb, Zurich, Hollard, WFI, GIO, NRMA, RACQ
- **Networks:** Steadfast, CBN, AIB, Oracle Group, Ausure, NIBA
- **Regulations:** APRA, ASIC, AUSTRAC, OAIC, Privacy Act 1988, Insurance Brokers Code of Practice
- **State coverage:** NSW, VIC, QLD, WA, SA, TAS, ACT, NT
- **Timezone:** AEST/AEDT aware
- **Language:** Australian English throughout

---

## File Structure

```
src/
  components/
    LoginScreen.tsx      # WhoKey entry
    Sidebar.tsx          # Role-based navigation
  pages/
    AskAgent.tsx         # Chat with Claude
    ManageSOPs.tsx       # SOP CRUD
    BrowseSOPs.tsx       # Read-only SOP browser
    History.tsx          # Q&A log with owner audit
    Diagnostics.tsx      # Health check
    AITraining.tsx       # 33 training examples
    LicenseControl.tsx   # Key management
    Settings.tsx         # Owner toggles + API key
  hooks/
    useAuth.ts           # Auth state (zustand)
    useSOPs.ts           # SOP data
    useHistory.ts        # History data
    useSettings.ts       # Settings data
  lib/
    supabase.ts          # Supabase client
    auth.ts              # WhoKey logic
    constants.ts         # Australian insurance constants + 33 training examples
  types/
    index.ts             # TypeScript types + permissions
  App.tsx                # Root component
  main.tsx               # Entry point

supabase/
  functions/
    anthropic-chat/
      index.ts           # Secure Edge Function proxy
  schema.sql             # Database setup
```

---

## Support

Built by Raushan Singh, Delhi, India.
Target market: Australian P&C Insurance Brokerages.

For issues: Check Diagnostics tab first. Verify Supabase connection and Anthropic API key.

---

**Good luck closing those Tier 1 leads!**
