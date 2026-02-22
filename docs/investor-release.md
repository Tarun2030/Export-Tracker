# Export Tracker — Investor Release Package

> **Version:** 1.0.0  
> **Date:** February 21, 2026  
> **Status:** Production-ready  
> **Live URL:** [https://export-tracker.vercel.app](https://export-tracker.vercel.app)

---

## Executive Summary

Export Tracker is a full-stack SaaS application purpose-built for Indian export businesses. It digitises the entire export lifecycle — from initial buyer inquiry through order management, shipment tracking, payment realisation, and government incentive recovery (RoDTEP, Duty Drawback). The system replaces fragmented Excel spreadsheets with a unified, real-time web application.

---

## Product Highlights

### Core Modules (10 screens, fully functional)

| Module | Key Capabilities |
|--------|-----------------|
| **Dashboard** | Revenue summary, LC expiry alerts, overdue payment flags (red > 30 days) |
| **Orders** | Create / Edit / List with search, status & currency filters |
| **Payments** | Aging analysis (0–30, 30–60, 60–90, 90+ days), FIRC tracking |
| **Shipments** | Vessel, container, BL tracking; status lifecycle |
| **Reports** | 10 one-click Excel downloads (Order Summary, Payment Aging, FIRC, RoDTEP, etc.) |
| **Customers** | Buyer database with GST, PAN, IEC, credit limits |
| **Inquiries** | RFQ → Quotation → Order conversion pipeline |

### India-Specific Features
- GST invoice & IGST tracking
- FIRC (Foreign Inward Remittance Certificate) management
- RoDTEP claim tracking with status workflow
- Duty Drawback management
- IEC (Import Export Code) per customer
- Shipping Bill tracking
- LC (Letter of Credit) lifecycle with expiry alerts

### Technical Differentiators
- **Zero-config demo mode** — works without any backend, using built-in sample data
- **Deterministic builds** — no external font fetches; builds succeed air-gapped
- **Row Level Security** — Supabase RLS policies gate every database operation to authenticated users
- **Excel-native reporting** — every data view exports to `.xlsx` with proper formatting

---

## Technology Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Frontend | Next.js 14 (App Router) | Server components, file-based routing, Vercel-native |
| Database | Supabase (PostgreSQL) | Open-source Firebase alternative; RLS, realtime, auth |
| Styling | TailwindCSS + shadcn/ui | Rapid UI development; consistent design system |
| Language | TypeScript (strict) | Type safety across the full codebase |
| Hosting | Vercel | Zero-config deploys, edge CDN, analytics |
| Excel | SheetJS | Client-side Excel generation; no server dependency |

---

## Architecture

```
┌─────────────────────────────────────────────┐
│                  Vercel CDN                  │
│          (Edge Network, HTTPS, CI/CD)        │
├─────────────────────────────────────────────┤
│              Next.js 14 App                  │
│  ┌──────────┐  ┌───────────┐  ┌──────────┐  │
│  │ Dashboard │  │  Orders   │  │ Reports  │  │
│  │  Page     │  │ CRUD+Edit │  │ 10 Excel │  │
│  └──────────┘  └───────────┘  └──────────┘  │
│  ┌──────────┐  ┌───────────┐  ┌──────────┐  │
│  │ Payments │  │ Shipments │  │Customers │  │
│  │  Aging   │  │ Tracking  │  │ Database │  │
│  └──────────┘  └───────────┘  └──────────┘  │
├─────────────────────────────────────────────┤
│           Data Service Layer                 │
│    demo mode ←→ shouldUseDemoData() ←→ live  │
├─────────────────────────────────────────────┤
│          Supabase (PostgreSQL)               │
│   RLS: auth.role() = 'authenticated'         │
│   6 tables, 12 indexes, auto-timestamps      │
└─────────────────────────────────────────────┘
```

---

## Quality & Security

| Dimension | Status | Evidence |
|-----------|--------|----------|
| TypeScript strict mode | ✅ | `tsconfig.json` `strict: true` |
| ESLint clean | ✅ | `npm run lint` passes with 0 warnings |
| Production build | ✅ | `npm run build` succeeds deterministically |
| RLS hardened | ✅ | `002_rls_hardening.sql` — auth-gated policies |
| No secrets in repo | ✅ | `.env.local` gitignored; example file committed |
| Demo/Live isolation | ✅ | `NEXT_PUBLIC_APP_MODE` env var; graceful fallback |
| Mobile responsive | ✅ | Collapsible sidebar, responsive grid |
| HTTPS | ✅ | Vercel enforces TLS on all deployments |

---

## Deployment & Operations

- **CI/CD:** GitHub → Vercel auto-deploy on merge to `main`
- **Preview:** Every PR gets a unique preview URL
- **Rollback:** One-command via `vercel rollback`
- **Monitoring:** Vercel Analytics (Web Vitals, errors), Supabase Dashboard (query logs, auth logs)
- **Documentation:** Full deployment runbook, validation checklist, and production guardrails in `/docs`

---

## Repository Structure

```
Export-Tracker/
├── src/app/           # 10 route pages (dashboard, orders, payments, etc.)
├── src/components/    # Reusable UI components (sidebar, header, forms)
├── src/lib/           # Business logic (data service, Supabase client, Excel export)
├── src/types/         # TypeScript interfaces
├── supabase/          # Database migrations (001 schema + 002 RLS)
├── docs/              # Runbook, validation checklist, guardrails, this file
└── README.md          # Getting started guide
```

---

## Roadmap (Next Phase)

| Priority | Feature | Impact |
|----------|---------|--------|
| P1 | Supabase Auth integration (login/signup) | Multi-user support |
| P1 | Dashboard charts (Chart.js / Recharts) | Visual analytics |
| P2 | PDF invoice generation | Client-facing documents |
| P2 | Email notifications (overdue payments, LC expiry) | Proactive alerts |
| P3 | Multi-currency dashboard with live FX rates | Real-time P&L |
| P3 | Audit trail / activity log | Compliance |

---

## How to Demo

1. Visit [https://export-tracker.vercel.app](https://export-tracker.vercel.app)
2. The app runs in **Demo Mode** with pre-loaded sample data
3. Navigate through Dashboard → Orders → Payments → Reports to see the full workflow
4. Create a new order, edit it, export to Excel
5. Check LC expiry alerts in the header bell icon
6. Generate any of the 10 Excel reports from the Reports page

No login required. No setup needed.

---

*Prepared by the Export Tracker engineering team.*
