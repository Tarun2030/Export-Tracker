'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  getOrders,
  getPayments,
  getShipments,
  getCustomers,
  getInquiries,
  getQuotations,
} from '@/lib/data-service';
import {
  formatCurrency,
  calculateOverdueDays,
  exportToExcel,
} from '@/lib/export-excel';
import {
  FileBarChart,
  FileSpreadsheet,
  Download,
  BarChart3,
  PieChart,
  TrendingUp,
  CreditCard,
  Ship,
  Users,
  Package,
} from 'lucide-react';

interface ReportConfig {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  generate: () => Promise<void>;
}

export default function ReportsPage() {
  const { toast } = useToast();
  const [generating, setGenerating] = useState<string | null>(null);

  const generateReport = async (id: string, fn: () => Promise<void>) => {
    setGenerating(id);
    try {
      await fn();
      toast({ title: 'Report Generated', description: 'Your Excel report has been downloaded.' });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate report',
        variant: 'destructive',
      });
    } finally {
      setGenerating(null);
    }
  };

  const reports: ReportConfig[] = [
    {
      id: 'order-summary',
      name: 'Order Summary Report',
      description: 'All orders with customer details, values, and status. Complete export order register.',
      icon: Package,
      color: 'text-blue-600 bg-blue-50',
      generate: async () => {
        const orders = await getOrders();
        exportToExcel(
          orders.map((o) => ({
            'Order #': o.order_number,
            Customer: o.customer?.company_name || '',
            Country: o.customer?.country || '',
            Date: o.order_date,
            Product: o.product_description,
            'HSN Code': o.hsn_code || '',
            Qty: o.quantity,
            Unit: o.unit,
            'Unit Price': o.unit_price,
            Total: o.total_amount,
            Currency: o.currency,
            'INR Value': o.inr_value || '',
            'Delivery Terms': o.delivery_terms,
            'Payment Terms': o.payment_terms,
            Status: o.status,
          })),
          'order-summary-report',
          'Orders'
        );
      },
    },
    {
      id: 'payment-aging',
      name: 'Payment Aging Report',
      description: 'Outstanding payments bucketed by age: 0-30, 30-60, 60-90, and 90+ days.',
      icon: CreditCard,
      color: 'text-red-600 bg-red-50',
      generate: async () => {
        const payments = await getPayments();
        const unpaid = payments.filter((p) => p.status !== 'received');
        exportToExcel(
          unpaid.map((p) => {
            const days = calculateOverdueDays(p.payment_due_date);
            const bucket = days <= 30 ? '0-30' : days <= 60 ? '30-60' : days <= 90 ? '60-90' : '90+';
            return {
              'Payment Ref': p.payment_reference,
              Customer: p.customer?.company_name || '',
              'Invoice #': p.invoice_number || '',
              'Invoice Amount': p.invoice_amount,
              Currency: p.invoice_currency,
              'Due Date': p.payment_due_date,
              'Amount Received': p.amount_received,
              Outstanding: p.invoice_amount - p.amount_received,
              'Overdue Days': days,
              'Aging Bucket': bucket,
              Mode: p.payment_mode,
              Status: p.status,
            };
          }),
          'payment-aging-report',
          'Aging'
        );
      },
    },
    {
      id: 'shipment-tracker',
      name: 'Shipment Tracking Report',
      description: 'All shipments with vessel, container, B/L, port details and delivery status.',
      icon: Ship,
      color: 'text-purple-600 bg-purple-50',
      generate: async () => {
        const shipments = await getShipments();
        exportToExcel(
          shipments.map((s) => ({
            'Shipment #': s.shipment_number,
            Date: s.shipment_date || '',
            Vessel: s.vessel_name || '',
            'Voyage #': s.voyage_number || '',
            'B/L #': s.bl_number || '',
            'B/L Date': s.bl_date || '',
            Container: s.container_number || '',
            Size: s.container_size,
            'Shipping Line': s.shipping_line || '',
            'Origin Port': s.origin_port || '',
            'Dest Port': s.destination_port || '',
            ETD: s.etd || '',
            ETA: s.eta || '',
            Freight: s.freight_amount,
            Insurance: s.insurance_amount,
            CHA: s.cha_name || '',
            Status: s.status,
          })),
          'shipment-tracking-report',
          'Shipments'
        );
      },
    },
    {
      id: 'customer-ledger',
      name: 'Customer Ledger Report',
      description: 'Customer-wise summary with total orders, payments, and outstanding balances.',
      icon: Users,
      color: 'text-emerald-600 bg-emerald-50',
      generate: async () => {
        const [customers, orders, payments] = await Promise.all([
          getCustomers(),
          getOrders(),
          getPayments(),
        ]);
        exportToExcel(
          customers.map((c) => {
            const custOrders = orders.filter((o) => o.customer_id === c.id);
            const custPayments = payments.filter((p) => p.customer_id === c.id);
            const totalOrdered = custOrders.reduce((sum, o) => sum + o.total_amount, 0);
            const totalReceived = custPayments.reduce((sum, p) => sum + p.amount_received, 0);
            const totalInvoiced = custPayments.reduce((sum, p) => sum + p.invoice_amount, 0);
            return {
              Company: c.company_name,
              Country: c.country,
              Contact: c.contact_person || '',
              Email: c.email || '',
              Phone: c.phone || '',
              'GST Number': c.gst_number || '',
              'IEC Code': c.iec_code || '',
              'Total Orders': custOrders.length,
              'Total Ordered (USD)': totalOrdered,
              'Total Invoiced (USD)': totalInvoiced,
              'Total Received (USD)': totalReceived,
              'Outstanding (USD)': totalInvoiced - totalReceived,
              'Credit Limit': c.credit_limit,
              Status: c.status,
            };
          }),
          'customer-ledger-report',
          'Customer Ledger'
        );
      },
    },
    {
      id: 'firc-report',
      name: 'FIRC Report',
      description: 'Foreign Inward Remittance Certificate tracking for RBI compliance.',
      icon: FileSpreadsheet,
      color: 'text-indigo-600 bg-indigo-50',
      generate: async () => {
        const payments = await getPayments();
        const fircPayments = payments.filter((p) => p.firc_number || p.status === 'received');
        exportToExcel(
          fircPayments.map((p) => ({
            'Payment Ref': p.payment_reference,
            'FIRC Number': p.firc_number || 'PENDING',
            'FIRC Date': p.firc_date || '',
            'FIRC Bank': p.firc_bank || '',
            'Invoice #': p.invoice_number || '',
            'Amount (USD)': p.amount_received,
            'Exchange Rate': p.exchange_rate_at_receipt || '',
            'INR Realized': p.inr_realized,
            'Bank Charges': p.bank_charges,
            'Net INR': p.inr_realized - p.bank_charges,
            Mode: p.payment_mode,
          })),
          'firc-report',
          'FIRC'
        );
      },
    },
    {
      id: 'rodtep-drawback',
      name: 'RoDTEP & Drawback Report',
      description: 'Government incentive claims tracking: RoDTEP and Duty Drawback status.',
      icon: TrendingUp,
      color: 'text-orange-600 bg-orange-50',
      generate: async () => {
        const orders = await getOrders();
        exportToExcel(
          orders
            .filter((o) => o.rodtep_claim > 0 || o.drawback_amount > 0)
            .map((o) => ({
              'Order #': o.order_number,
              Customer: o.customer?.company_name || '',
              Product: o.product_description,
              'HSN Code': o.hsn_code || '',
              'Order Value (USD)': o.total_amount,
              'Shipping Bill': o.shipping_bill_number || '',
              'SB Date': o.shipping_bill_date || '',
              'RoDTEP Amount': o.rodtep_claim,
              'RoDTEP Status': o.rodtep_status,
              'Drawback Amount': o.drawback_amount,
              'Drawback Status': o.drawback_status,
              'Total Incentives': o.rodtep_claim + o.drawback_amount,
            })),
          'rodtep-drawback-report',
          'Incentives'
        );
      },
    },
    {
      id: 'monthly-sales',
      name: 'Monthly Sales Report',
      description: 'Month-wise sales analysis with order count, value, and year-on-year comparison.',
      icon: BarChart3,
      color: 'text-cyan-600 bg-cyan-50',
      generate: async () => {
        const orders = await getOrders();
        const monthlyData: Record<string, { count: number; totalUSD: number; totalINR: number }> = {};
        orders.forEach((o) => {
          const d = new Date(o.order_date);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          if (!monthlyData[key]) monthlyData[key] = { count: 0, totalUSD: 0, totalINR: 0 };
          monthlyData[key].count++;
          monthlyData[key].totalUSD += o.total_amount;
          monthlyData[key].totalINR += o.inr_value || 0;
        });
        exportToExcel(
          Object.entries(monthlyData)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([month, data]) => ({
              Month: month,
              'Order Count': data.count,
              'Total USD': data.totalUSD,
              'Total INR': data.totalINR,
              'Avg Order USD': data.count > 0 ? Math.round(data.totalUSD / data.count) : 0,
            })),
          'monthly-sales-report',
          'Monthly Sales'
        );
      },
    },
    {
      id: 'country-wise',
      name: 'Country-wise Export Report',
      description: 'Exports grouped by destination country with total values and order counts.',
      icon: PieChart,
      color: 'text-pink-600 bg-pink-50',
      generate: async () => {
        const orders = await getOrders();
        const countryData: Record<string, { count: number; totalUSD: number; customers: Set<string> }> = {};
        orders.forEach((o) => {
          const country = o.customer?.country || 'Unknown';
          if (!countryData[country]) countryData[country] = { count: 0, totalUSD: 0, customers: new Set() };
          countryData[country].count++;
          countryData[country].totalUSD += o.total_amount;
          if (o.customer_id) countryData[country].customers.add(o.customer_id);
        });
        exportToExcel(
          Object.entries(countryData)
            .sort(([, a], [, b]) => b.totalUSD - a.totalUSD)
            .map(([country, data]) => ({
              Country: country,
              'Total Orders': data.count,
              'Total Value (USD)': data.totalUSD,
              'Unique Customers': data.customers.size,
              'Avg Order Value': data.count > 0 ? Math.round(data.totalUSD / data.count) : 0,
            })),
          'country-wise-export-report',
          'By Country'
        );
      },
    },
    {
      id: 'lc-tracker',
      name: 'LC Tracker Report',
      description: 'Letter of Credit tracking with expiry dates, amounts, and bank details.',
      icon: FileBarChart,
      color: 'text-amber-600 bg-amber-50',
      generate: async () => {
        const orders = await getOrders();
        const lcOrders = orders.filter((o) => o.lc_number);
        exportToExcel(
          lcOrders.map((o) => {
            const now = new Date();
            const expiry = o.lc_expiry_date ? new Date(o.lc_expiry_date) : null;
            const daysToExpiry = expiry ? Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;
            return {
              'Order #': o.order_number,
              Customer: o.customer?.company_name || '',
              'LC Number': o.lc_number || '',
              'LC Date': o.lc_date || '',
              'LC Expiry': o.lc_expiry_date || '',
              'Days to Expiry': daysToExpiry,
              'LC Amount': o.lc_amount || '',
              'LC Bank': o.lc_bank || '',
              'Order Amount': o.total_amount,
              Currency: o.currency,
              'Alert': daysToExpiry !== null && daysToExpiry < 15 ? 'URGENT' : daysToExpiry !== null && daysToExpiry < 30 ? 'Warning' : 'OK',
              Status: o.status,
            };
          }),
          'lc-tracker-report',
          'LC Tracker'
        );
      },
    },
    {
      id: 'inquiry-conversion',
      name: 'Inquiry Conversion Report',
      description: 'Inquiry to order conversion funnel with quotation details and win/loss analysis.',
      icon: TrendingUp,
      color: 'text-violet-600 bg-violet-50',
      generate: async () => {
        const [inquiries, quotations] = await Promise.all([getInquiries(), getQuotations()]);
        exportToExcel(
          inquiries.map((inq) => {
            const quote = quotations.find((q) => q.inquiry_id === inq.id);
            return {
              'Inquiry #': inq.inquiry_number,
              Customer: inq.customer?.company_name || '',
              Date: inq.inquiry_date,
              Product: inq.product_description,
              Quantity: inq.quantity || '',
              'Target Price': inq.target_price || '',
              Currency: inq.currency,
              'Quotation #': quote?.quotation_number || '-',
              'Quoted Price': quote?.unit_price || '-',
              'Quoted Amount': quote?.total_amount || '-',
              'Inquiry Status': inq.status,
              'Quote Status': quote?.status || '-',
              'Follow Up': inq.follow_up_date || '',
            };
          }),
          'inquiry-conversion-report',
          'Conversion'
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
        <p className="text-sm text-slate-500 mt-1">Generate and export business reports</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map((report) => (
          <Card key={report.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className={`p-2.5 rounded-lg ${report.color}`}>
                  <report.icon className="h-5 w-5" />
                </div>
                <Badge variant="outline" className="text-[10px]">
                  Excel
                </Badge>
              </div>
              <CardTitle className="text-base mt-3">{report.name}</CardTitle>
              <CardDescription className="text-xs">{report.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => generateReport(report.id, report.generate)}
                disabled={generating === report.id}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                size="sm"
              >
                {generating === report.id ? (
                  <>
                    <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="h-3.5 w-3.5 mr-2" />
                    Generate Report
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
