# Export Tracking System

A complete export business management system built with Next.js 14, Supabase, TailwindCSS, and shadcn/ui. Designed for Indian exporters with India-specific features like GST, FIRC tracking, and RoDTEP.

## Features

### Pages
- **Dashboard** — Summary cards (total orders, pending payments with RED for >30 days overdue, shipments in transit, monthly revenue), LC expiry alerts, recent orders, overdue payments
- **Add New Order** — Comprehensive form with product details, pricing, LC details, shipping, GST & government incentives (RoDTEP, Drawback)
- **Order List** — Searchable/filterable table with status and currency filters, Excel export, LC alerts
- **Payment Tracker** — Aging analysis (0-30, 30-60, 60-90, 90+ days), FIRC tracking, all payments view
- **Shipments** — Vessel/container tracking, route visualization, status filters
- **Reports** — 10 one-click Excel reports (Order Summary, Payment Aging, Shipment Tracking, Customer Ledger, FIRC, RoDTEP/Drawback, Monthly Sales, Country-wise, LC Tracker, Inquiry Conversion)
- **Customer Database** — Buyer management with order history, outstanding balances, add/view details
- **Inquiries & Quotations** — RFQ tracking with quotation linkage

### Key Features
- Color coding: Green/Yellow/Red based on status and overdue days
- Auto-calculate payment overdue days
- Export to Excel on every data page
- LC (Letter of Credit) expiry alerts with notification bell
- Mobile responsive with collapsible sidebar
- India-specific: GST number, FIRC tracking, RoDTEP claims, IEC code, Duty Drawback
- Demo mode: Works without Supabase using built-in demo data

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** Supabase (PostgreSQL)
- **Styling:** TailwindCSS
- **Components:** shadcn/ui
- **Language:** TypeScript
- **Excel Export:** SheetJS (xlsx)
- **Icons:** Lucide React

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account (optional — demo mode works without it)

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.local.example .env.local

# Edit .env.local with your Supabase credentials (optional)
# NEXT_PUBLIC_APP_MODE=demo
# NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Run development server
npm run dev
```

### Setting Up Supabase (Optional)

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the migration file: `supabase/migrations/001_initial_schema.sql`
3. Copy your project URL and anon key from Settings > API
4. Add them to `.env.local` and set `NEXT_PUBLIC_APP_MODE=live`

Without Supabase configured, the app runs in **Demo Mode** with sample data for all features.

### Database Schema

| Table | Description |
|-------|-------------|
| `customers` | Buyer database with GST, PAN, IEC details |
| `inquiries` | RFQ tracking |
| `quotations` | Price offers linked to inquiries |
| `orders` | Confirmed orders with LC, GST, RoDTEP fields |
| `shipments` | Dispatch tracking with vessel/container details |
| `payments` | Payment realization with FIRC tracking |

### Available Reports

1. Order Summary Report
2. Payment Aging Report
3. Shipment Tracking Report
4. Customer Ledger Report
5. FIRC Report
6. RoDTEP & Drawback Report
7. Monthly Sales Report
8. Country-wise Export Report
9. LC Tracker Report
10. Inquiry Conversion Report

## Project Structure

```
src/
├── app/
│   ├── dashboard/       # Dashboard page
│   ├── orders/
│   │   ├── new/         # Add new order form
│   │   ├── [id]/edit/   # Edit existing order
│   │   └── list/        # Order list with filters
│   ├── payments/        # Payment tracker with aging
│   ├── shipments/       # Shipment tracking
│   ├── reports/         # 10 report generators
│   ├── customers/       # Customer database
│   └── inquiries/       # Inquiries & quotations
├── components/
│   ├── layout/          # Sidebar, Header
│   ├── orders/          # Shared OrderForm component
│   └── ui/              # shadcn/ui components
├── lib/
│   ├── supabase.ts      # Supabase client + mode resolution
│   ├── data-service.ts  # Data access layer (demo/live)
│   ├── demo-data.ts     # Demo/sample data
│   ├── export-excel.ts  # Excel export & utilities
│   └── utils.ts         # Tailwind utilities
├── types/
│   └── database.ts      # TypeScript interfaces
└── hooks/
    └── use-toast.ts     # Toast notifications

docs/
├── deployment-runbook.md      # Build, deploy & operate
├── validation-checklist.md    # E2E test checklist
├── production-guardrails.md   # Security & access controls
└── investor-release.md        # Investor-ready summary

supabase/migrations/
├── 001_initial_schema.sql     # Tables, indexes, triggers
└── 002_rls_hardening.sql      # Auth-gated RLS policies
```

## License

MIT
