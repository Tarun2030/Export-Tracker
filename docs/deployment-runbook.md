# Deployment Runbook

> Canonical guide for building, deploying, and operating Export Tracker.

---

## 1  Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_APP_MODE` | No | `demo` | `demo` = built-in sample data; `live` = Supabase backend |
| `NEXT_PUBLIC_SUPABASE_URL` | If `live` | — | Supabase project API URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | If `live` | — | Supabase project anon/public key |

### Mode Resolution Logic

```
requestedMode = NEXT_PUBLIC_APP_MODE === 'live' ? 'live' : 'demo'
hasCredentials = SUPABASE_URL && ANON_KEY both present and non-empty
effectiveMode  = requestedMode === 'live' && hasCredentials ? 'live' : 'demo'
```

If `NEXT_PUBLIC_APP_MODE=live` but credentials are missing, the app **falls back to demo mode silently** — it will never crash.

### Failure-Behaviour Matrix

| `APP_MODE` | Credentials Present | Result |
|------------|---------------------|--------|
| `demo` | No | Demo data — works offline |
| `demo` | Yes | Demo data (credentials ignored) |
| `live` | Yes | Live Supabase data |
| `live` | No | **Fallback → Demo data** |

---

## 2  Local Development

```bash
# 1. Clone & install
git clone https://github.com/Tarun2030/Export-Tracker.git
cd Export-Tracker
npm install          # deterministic — no network font downloads

# 2. Configure (optional)
cp .env.local.example .env.local
# edit .env.local to set mode and credentials

# 3. Run
npm run dev          # http://localhost:3000
```

---

## 3  Build & Verify

```bash
npm run lint         # ESLint
npm run build        # Next.js production build (deterministic — no Google Fonts fetched)
npm start            # serve locally on port 3000
```

**Deterministic build guarantee:** The app uses Tailwind's system font stack (`font-sans`) with no external font downloads. Builds succeed in air-gapped / restricted-network environments.

---

## 4  Vercel Deployment

The repository is connected to Vercel via GitHub integration.

### Automatic Deploys
- Push to `main` → production deploy at `export-tracker.vercel.app`
- Push to any other branch → preview deploy with unique URL

### Manual CLI Deploy
```bash
npx vercel --prod
```

### Setting Env Vars in Vercel
Dashboard → Project → Settings → Environment Variables:
- `NEXT_PUBLIC_APP_MODE` = `live` (for production with real data) or `demo` (for demos)
- `NEXT_PUBLIC_SUPABASE_URL` = your Supabase URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase anon key

---

## 5  Supabase Setup

### Initial Schema
```bash
# Run in Supabase SQL Editor
supabase/migrations/001_initial_schema.sql
```

### RLS Hardening
```bash
# Run AFTER 001 to replace open policies with auth-gated ones
supabase/migrations/002_rls_hardening.sql
```

### RLS Policy Summary

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| customers | `auth.role() = 'authenticated'` | ✅ | ✅ | ✅ |
| inquiries | `auth.role() = 'authenticated'` | ✅ | ✅ | ✅ |
| quotations | `auth.role() = 'authenticated'` | ✅ | ✅ | ✅ |
| orders | `auth.role() = 'authenticated'` | ✅ | ✅ | ✅ |
| shipments | `auth.role() = 'authenticated'` | ✅ | ✅ | ✅ |
| payments | `auth.role() = 'authenticated'` | ✅ | ✅ | ✅ |

Anonymous and service-role-only callers are rejected. To add role-based restrictions (e.g., read-only for certain users), extend the policies with `auth.uid()` checks.

---

## 6  Branching & Release Flow

```
feature branch  →  PR to main  →  CI checks (lint + build)  →  merge  →  auto-deploy
```

1. Create branch: `git checkout -b feature/my-change`
2. Commit & push: `git push -u origin feature/my-change`
3. Open PR: `gh pr create --base main`
4. Verify CI passes (lint + build)
5. Merge PR → Vercel auto-deploys to production

---

## 7  Monitoring & Incident Response

| Layer | Tool | Notes |
|-------|------|-------|
| Frontend errors | Vercel Analytics (built-in) | Enable in Vercel dashboard |
| API / DB | Supabase Dashboard > Logs | Real-time query & auth logs |
| Uptime | Vercel Status / UptimeRobot | Set 5-minute checks on production URL |
| Alerting | Vercel Notifications | Slack/email on deploy failures |

### Common Issues

| Symptom | Cause | Fix |
|---------|-------|-----|
| App shows demo data in production | `NEXT_PUBLIC_APP_MODE` not set to `live` | Set env var in Vercel dashboard, redeploy |
| Supabase queries return empty | RLS blocking unauthenticated calls | Ensure user is authenticated; check Supabase auth logs |
| Build fails on font | Old code using `next/font/google` | Ensure layout.tsx uses `font-sans` system stack |
| LC alerts not showing | No orders with `lc_expiry_date` within 30 days | Add test data with upcoming LC dates |

---

## 8  Rollback

```bash
# Revert to last successful deployment
vercel rollback

# Or, revert the commit and push
git revert HEAD
git push origin main
```
