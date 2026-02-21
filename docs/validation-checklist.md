# E2E Validation Checklist

> Run through this checklist after every production deployment to confirm all routes and features are operational. Mark each item ✅ or ❌ with the date tested.

---

## Route Smoke Tests

| # | Route | Expected Behaviour | Status | Date |
|---|-------|--------------------|--------|------|
| 1 | `/` | Redirects or renders landing / dashboard | ☐ | |
| 2 | `/dashboard` | Summary cards (orders, payments, shipments, revenue), LC alerts, recent orders, overdue payments | ☐ | |
| 3 | `/orders/new` | Empty order form renders; all dropdowns populated; submit creates order | ☐ | |
| 4 | `/orders/list` | Table renders with Actions column; search, status filter, currency filter work; Excel export downloads | ☐ | |
| 5 | `/orders/<id>/edit` | Form pre-filled with order data; submit updates order; toast confirms | ☐ | |
| 6 | `/payments` | Aging cards (0-30, 30-60, 60-90, 90+); payment table with filters | ☐ | |
| 7 | `/shipments` | Shipment cards and table render; status filter works | ☐ | |
| 8 | `/reports` | All 10 report buttons render; each generates and downloads Excel | ☐ | |
| 9 | `/customers` | Customer table; Add Customer dialog opens and submits | ☐ | |
| 10 | `/inquiries` | Inquiry table; quotation linkage visible | ☐ | |

---

## Feature Tests

| # | Feature | Steps | Expected | Status | Date |
|---|---------|-------|----------|--------|------|
| 11 | Create Order | `/orders/new` → fill form → Submit | Toast "Order created"; redirects to `/orders/list`; new order visible | ☐ | |
| 12 | Edit Order | `/orders/list` → click Edit on any row | Form loads with existing data; change a field; Submit → toast "Order updated" | ☐ | |
| 13 | Export Excel | `/orders/list` → click Export | `.xlsx` file downloads with correct columns and data | ☐ | |
| 14 | LC Expiry Alerts | Header bell icon | Badge count matches orders with LC expiring within 30 days | ☐ | |
| 15 | Demo/Live Badge | Header right side | "Demo Mode" badge visible when `APP_MODE=demo`; hidden when `live` | ☐ | |
| 16 | Mobile Sidebar | Resize to < 1024px | Sidebar collapses; hamburger menu appears; sidebar opens on click | ☐ | |
| 17 | Payment Aging | `/payments` | Aging cards show correct counts; colour-coded (green/yellow/red) | ☐ | |
| 18 | Report Generation | `/reports` → each of 10 buttons | Each downloads a valid `.xlsx` file | ☐ | |
| 19 | Add Customer | `/customers` → Add Customer → fill → Submit | Customer appears in table | ☐ | |
| 20 | Search & Filter | `/orders/list` → type in search; change status dropdown | Table filters in real time | ☐ | |

---

## Infrastructure Checks

| # | Check | Method | Expected | Status | Date |
|---|-------|--------|----------|--------|------|
| 21 | HTTPS | Browser address bar | Lock icon; valid certificate | ☐ | |
| 22 | Response time | `curl -o /dev/null -s -w '%{time_total}' <url>` | < 3 seconds | ☐ | |
| 23 | Correct commit SHA | Vercel dashboard → Deployments | Matches latest merged commit | ☐ | |
| 24 | Env vars set | Vercel → Settings → Env vars | `NEXT_PUBLIC_APP_MODE` present | ☐ | |
| 25 | No console errors | Browser DevTools → Console | No red errors on any page | ☐ | |

---

## Automated Verification Commands

```bash
# Quick curl smoke test (run from any terminal)
BASE=https://export-tracker.vercel.app

echo "=== Route Smoke ==="
for path in "/" "/dashboard" "/orders/new" "/orders/list" "/payments" "/shipments" "/reports" "/customers" "/inquiries"; do
  status=$(curl -s -o /dev/null -w "%{http_code}" "$BASE$path")
  echo "$path → $status"
done

echo "=== Deployment SHA ==="
curl -s "https://api.vercel.com/v13/deployments?app=export-tracker&limit=1" \
  -H "Authorization: Bearer $VERCEL_TOKEN" | jq '.deployments[0].meta.githubCommitSha'
```

---

## Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Developer | | | |
| QA / Reviewer | | | |
| Product Owner | | | |
