# SOP Agent Pro v6 — Deployment Guide

## Demo Mode (No Setup Required)
The app works immediately without any backend. 
**Demo login key:** `RK-ADMIN-2026-X9`

Share this with prospects before they pay. They'll see the full interface.

---

## Deploy to Vercel (3 Minutes, Free)

### Step 1 — Push to GitHub
```bash
git init
git add .
git commit -m "SOP Agent Pro v6"
# Create a repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/sop-agent.git
git push -u origin main
```

### Step 2 — Deploy on Vercel
1. Go to [vercel.com](https://vercel.com) → Log in with GitHub
2. Click **Add New Project**
3. Select your `sop-agent` repo
4. Framework: **Vite** (auto-detected)
5. Click **Deploy** — done ✅

Your URL will be: `https://sop-agent-xxx.vercel.app`

**For demo mode** (no Supabase yet): leave environment variables empty. Works instantly.

---

## Connect Supabase (When You Have a Paying Client)

### Step 1 — Create Supabase Project
1. Go to [supabase.com](https://supabase.com) → New Project
2. Copy your **Project URL** and **Anon Key** from Settings → API

### Step 2 — Run the Schema
1. Supabase Dashboard → SQL Editor
2. Paste contents of `supabase/schema.sql`
3. Click Run

### Step 3 — Deploy Edge Function
```bash
npm install -g supabase
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase functions deploy anthropic-chat
supabase secrets set ANTHROPIC_API_KEY=sk-ant-api03-YOUR_KEY
```

### Step 4 — Add Env Vars to Vercel
Vercel Dashboard → Your Project → Settings → Environment Variables:
- `VITE_SUPABASE_URL` = your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` = your Supabase anon key

Redeploy — done ✅

---

## Per-Client Setup
Each brokerage = one Supabase project (or one set of keys in the same project):

1. Run schema.sql for their project
2. Give them their Owner key (e.g., `RK-ADMIN-2026-X9`)
3. They create Editor/Team keys via License Control tab

---

## Model & Cost
- **Default model:** `claude-haiku-4-5-20251001` (~$0.003/query)
- **3,000 queries/month ≈ $9 AUD in API costs**
- Rate limit: 20 queries/minute per key
- Owner can use Sonnet by passing `model: "sonnet"` (configurable)

---

## Key Formats
| Role | Format | Example |
|------|--------|---------|
| Owner | `RK-ADMIN-2026-XXXX` | `RK-ADMIN-2026-X9` |
| Editor | `SOP-EDIT-BROKERAGE-XXXX` | `SOP-EDIT-MORGAN-A3B7` |
| Team | `SOP-TEAM-BROKERAGE-XXXX` | `SOP-TEAM-MORGAN-K9P2` |
