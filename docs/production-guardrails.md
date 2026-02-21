# Production Guardrails

> Controls, policies, and safeguards for operating Export Tracker in production.

---

## 1  Access Control

### Application Level
- **Demo mode** (`NEXT_PUBLIC_APP_MODE=demo`): No real data exposed; safe for demos and investor walkthroughs.
- **Live mode** (`NEXT_PUBLIC_APP_MODE=live`): Requires Supabase credentials; all data operations against the live database.

### Database Level (Supabase RLS)
- All six tables have Row Level Security **enabled**.
- Migration `002_rls_hardening.sql` replaces the original open policies with `auth.role() = 'authenticated'` checks on every operation (SELECT, INSERT, UPDATE, DELETE).
- Anonymous API calls are **rejected** by default.
- To further restrict by user, extend policies with `auth.uid()` checks.

### Vercel / Hosting
- Only the `main` branch auto-deploys to production.
- Preview deployments on feature branches use the same env vars unless overridden per-environment in Vercel settings.
- Recommended: Set `NEXT_PUBLIC_APP_MODE=demo` for preview deployments to avoid exposing production data.

---

## 2  Environment Isolation

| Environment | Branch | `APP_MODE` | Supabase Project | URL |
|-------------|--------|------------|-------------------|-----|
| Production | `main` | `live` | prod project | `export-tracker.vercel.app` |
| Staging | `staging` (if used) | `live` | staging project | preview URL |
| Preview | feature branches | `demo` | — | Vercel preview URL |
| Local Dev | any | `demo` | — | `localhost:3000` |

**Rule:** Never point preview or local environments at the production Supabase project.

---

## 3  Data Protection

### Sensitive Fields
The following fields may contain PII or financially sensitive data:

| Table | Fields |
|-------|--------|
| `customers` | `email`, `phone`, `gst_number`, `pan_number`, `iec_code`, `address` |
| `orders` | `lc_number`, `shipping_bill_number`, `gst_invoice_number` |
| `payments` | `firc_number`, `bank_ref_number`, `invoice_number` |

### Recommendations
1. **Do not log** Supabase query results in browser console in production builds.
2. **Rotate** the Supabase anon key if it is ever committed to a public repo.
3. **Back up** the Supabase database on a weekly schedule (Supabase Dashboard → Database → Backups).
4. Enable Supabase **Point-in-Time Recovery (PITR)** on the Pro plan for sub-second recovery.

---

## 4  Build Integrity

| Check | Implementation |
|-------|---------------|
| Deterministic build | System font stack (`font-sans`); no external font downloads at build time |
| Type safety | `strict: true` in `tsconfig.json`; all pages pass `npm run build` type checks |
| Linting | ESLint with Next.js config; `npm run lint` must pass before merge |
| No secrets in repo | `.env.local` is gitignored; only `.env.local.example` is committed |

---

## 5  Monitoring Checklist

| What | How | Frequency |
|------|-----|-----------|
| Uptime | Vercel Analytics or external monitor (UptimeRobot, Better Stack) | Every 5 min |
| Error rate | Vercel → Analytics → Web Vitals + Errors tab | Daily review |
| Supabase health | Supabase Dashboard → Reports | Weekly |
| Database size | Supabase Dashboard → Database → Usage | Monthly |
| RLS audit | Review policies after any migration | Per release |

---

## 6  Incident Response

### Severity Levels

| Level | Definition | Response Time | Example |
|-------|-----------|---------------|---------|
| P0 — Critical | App fully down or data corruption | < 15 min | Vercel deploy crashed, Supabase outage |
| P1 — High | Major feature broken | < 1 hour | Orders list blank, payments not loading |
| P2 — Medium | Minor feature broken | < 4 hours | Excel export missing a column |
| P3 — Low | Cosmetic / non-blocking | Next sprint | Font rendering slightly off |

### Response Steps
1. **Verify** — Reproduce in production; check Vercel deployment status.
2. **Rollback** — If latest deploy caused it: `vercel rollback` or revert commit.
3. **Fix** — Branch, fix, PR, merge, auto-deploy.
4. **Post-mortem** — Document root cause and prevention steps.

---

## 7  Change Management

- All production changes go through Pull Requests.
- PRs require a passing `npm run build` before merge.
- Direct pushes to `main` are discouraged; enable branch protection when team grows.
- Database migrations are versioned sequentially (`001_`, `002_`, …) and applied manually via Supabase SQL Editor.

---

## 8  Secrets Management

| Secret | Storage | Rotation |
|--------|---------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Vercel env vars | Rarely (tied to project) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Vercel env vars | If compromised |
| Supabase service role key | **Never in frontend** | If compromised |
| Vercel token | Local CLI auth | 90-day rotation recommended |

> **Critical:** The Supabase **service role key** must NEVER be used in client-side code. The anon key is safe for the frontend because RLS policies restrict access.
