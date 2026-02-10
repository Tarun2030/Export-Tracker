'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getPayments, getAgingAnalysis } from '@/lib/data-service';
import { Payment, AgingBucket } from '@/types/database';
import {
  formatCurrency,
  formatDate,
  getStatusColor,
  getOverdueColor,
  calculateOverdueDays,
  exportToExcel,
} from '@/lib/export-excel';
import { Download, Search, AlertCircle, Clock, CheckCircle2, DollarSign } from 'lucide-react';

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [agingBuckets, setAgingBuckets] = useState<AgingBucket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modeFilter, setModeFilter] = useState('all');

  useEffect(() => {
    async function fetchData() {
      try {
        const [paymentData, aging] = await Promise.all([getPayments(), getAgingAnalysis()]);
        setPayments(paymentData);
        setAgingBuckets(aging);
      } catch (error) {
        console.error('Failed to fetch payments:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const matchesSearch =
        !search ||
        p.payment_reference.toLowerCase().includes(search.toLowerCase()) ||
        p.invoice_number?.toLowerCase().includes(search.toLowerCase()) ||
        p.customer?.company_name?.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      const matchesMode = modeFilter === 'all' || p.payment_mode === modeFilter;

      return matchesSearch && matchesStatus && matchesMode;
    });
  }, [payments, search, statusFilter, modeFilter]);

  const summaryStats = useMemo(() => {
    const totalInvoiced = payments.reduce((sum, p) => sum + p.invoice_amount, 0);
    const totalReceived = payments.reduce((sum, p) => sum + p.amount_received, 0);
    const totalOutstanding = totalInvoiced - totalReceived;
    const totalOverdue = payments
      .filter((p) => p.status !== 'received' && calculateOverdueDays(p.payment_due_date) > 0)
      .reduce((sum, p) => sum + (p.invoice_amount - p.amount_received), 0);

    return { totalInvoiced, totalReceived, totalOutstanding, totalOverdue };
  }, [payments]);

  const handleExport = () => {
    const exportData = filteredPayments.map((p) => ({
      'Payment Ref': p.payment_reference,
      'Invoice #': p.invoice_number || '',
      'Invoice Date': p.invoice_date || '',
      'Invoice Amount': p.invoice_amount,
      Currency: p.invoice_currency,
      'Due Date': p.payment_due_date,
      'Received Date': p.payment_received_date || '',
      'Amount Received': p.amount_received,
      'Outstanding': p.invoice_amount - p.amount_received,
      'Overdue Days': calculateOverdueDays(p.payment_due_date),
      'Payment Mode': p.payment_mode,
      'FIRC Number': p.firc_number || '',
      'FIRC Date': p.firc_date || '',
      'FIRC Bank': p.firc_bank || '',
      'INR Realized': p.inr_realized,
      'Bank Charges': p.bank_charges,
      Status: p.status,
    }));
    exportToExcel(exportData, `payments-${new Date().toISOString().split('T')[0]}`, 'Payments');
  };

  const agingColors = ['bg-green-500', 'bg-yellow-500', 'bg-orange-500', 'bg-red-500'];
  const agingBgColors = ['bg-green-50 border-green-200', 'bg-yellow-50 border-yellow-200', 'bg-orange-50 border-orange-200', 'bg-red-50 border-red-200'];
  const agingTextColors = ['text-green-700', 'text-yellow-700', 'text-orange-700', 'text-red-700'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Payment Tracker</h1>
          <p className="text-sm text-slate-500 mt-1">Monitor receivables and aging analysis</p>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Export Excel
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Invoiced</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(summaryStats.totalInvoiced)}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Received</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-700">{formatCurrency(summaryStats.totalReceived)}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Outstanding</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-700">{formatCurrency(summaryStats.totalOutstanding)}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Overdue Amount</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-700">{formatCurrency(summaryStats.totalOverdue)}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="aging" className="space-y-4">
        <TabsList>
          <TabsTrigger value="aging">Aging Analysis</TabsTrigger>
          <TabsTrigger value="all">All Payments</TabsTrigger>
          <TabsTrigger value="firc">FIRC Tracking</TabsTrigger>
        </TabsList>

        {/* Aging Analysis Tab */}
        <TabsContent value="aging" className="space-y-6">
          {/* Aging Buckets Visual */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {agingBuckets.map((bucket, idx) => (
              <Card key={bucket.range} className={`border ${agingBgColors[idx]}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full ${agingColors[idx]}`} />
                    <CardTitle className={`text-sm font-semibold ${agingTextColors[idx]}`}>
                      {bucket.range}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{formatCurrency(bucket.totalAmount)}</p>
                  <p className="text-xs text-slate-500 mt-1">{bucket.count} payment(s)</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Aging Bar */}
          {(() => {
            const total = agingBuckets.reduce((sum, b) => sum + b.totalAmount, 0);
            if (total === 0) return null;
            return (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Aging Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex h-8 rounded-lg overflow-hidden">
                    {agingBuckets.map((bucket, idx) => {
                      const pct = (bucket.totalAmount / total) * 100;
                      if (pct === 0) return null;
                      return (
                        <div
                          key={bucket.range}
                          className={`${agingColors[idx]} flex items-center justify-center text-white text-xs font-medium`}
                          style={{ width: `${pct}%` }}
                          title={`${bucket.range}: ${formatCurrency(bucket.totalAmount)} (${pct.toFixed(1)}%)`}
                        >
                          {pct > 10 ? `${pct.toFixed(0)}%` : ''}
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex gap-4 mt-3 flex-wrap">
                    {agingBuckets.map((bucket, idx) => (
                      <div key={bucket.range} className="flex items-center gap-1.5 text-xs">
                        <div className={`h-2.5 w-2.5 rounded-full ${agingColors[idx]}`} />
                        <span className="text-slate-600">{bucket.range}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })()}

          {/* Aging Details */}
          {agingBuckets.map((bucket, idx) =>
            bucket.payments.length > 0 ? (
              <Card key={bucket.range} className={`border ${agingBgColors[idx]}`}>
                <CardHeader>
                  <CardTitle className={`text-sm ${agingTextColors[idx]}`}>
                    {bucket.range} — {bucket.count} payment(s)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Reference</TableHead>
                          <TableHead>Invoice</TableHead>
                          <TableHead>Due Date</TableHead>
                          <TableHead className="text-right">Invoice Amt</TableHead>
                          <TableHead className="text-right">Received</TableHead>
                          <TableHead className="text-right">Outstanding</TableHead>
                          <TableHead>Overdue</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bucket.payments.map((p) => {
                          const days = calculateOverdueDays(p.payment_due_date);
                          const outstanding = p.invoice_amount - p.amount_received;
                          return (
                            <TableRow key={p.id}>
                              <TableCell className="font-medium">{p.payment_reference}</TableCell>
                              <TableCell>{p.invoice_number || '-'}</TableCell>
                              <TableCell>{formatDate(p.payment_due_date)}</TableCell>
                              <TableCell className="text-right">{formatCurrency(p.invoice_amount, p.invoice_currency)}</TableCell>
                              <TableCell className="text-right">{formatCurrency(p.amount_received, p.invoice_currency)}</TableCell>
                              <TableCell className="text-right font-medium">{formatCurrency(outstanding, p.invoice_currency)}</TableCell>
                              <TableCell>
                                <span className={`font-bold ${getOverdueColor(days)}`}>
                                  {days} days
                                </span>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            ) : null
          )}
        </TabsContent>

        {/* All Payments Tab */}
        <TabsContent value="all" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search by reference, invoice, customer..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-44">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                    <SelectItem value="received">Received</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="write_off">Write Off</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={modeFilter} onValueChange={setModeFilter}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Modes</SelectItem>
                    <SelectItem value="LC">LC</SelectItem>
                    <SelectItem value="TT">TT</SelectItem>
                    <SelectItem value="DP">DP</SelectItem>
                    <SelectItem value="DA">DA</SelectItem>
                    <SelectItem value="advance">Advance</SelectItem>
                    <SelectItem value="open_credit">Open Credit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reference</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Received</TableHead>
                      <TableHead>Mode</TableHead>
                      <TableHead>Overdue</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayments.map((p) => {
                      const days = calculateOverdueDays(p.payment_due_date);
                      return (
                        <TableRow key={p.id}>
                          <TableCell className="font-medium">{p.payment_reference}</TableCell>
                          <TableCell>{p.customer?.company_name || '-'}</TableCell>
                          <TableCell>
                            <p className="text-sm">{p.invoice_number || '-'}</p>
                            <p className="text-xs text-slate-400">{formatDate(p.invoice_date)}</p>
                          </TableCell>
                          <TableCell>{formatDate(p.payment_due_date)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(p.invoice_amount, p.invoice_currency)}</TableCell>
                          <TableCell className="text-right">
                            {p.amount_received > 0 ? (
                              <span className="text-green-600">
                                {formatCurrency(p.amount_received, p.received_currency)}
                              </span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-[10px]">
                              {p.payment_mode}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {p.status !== 'received' && days > 0 ? (
                              <span className={`text-sm font-bold ${getOverdueColor(days)}`}>
                                {days}d
                              </span>
                            ) : (
                              <span className="text-green-600 text-sm">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge className={`text-[10px] ${getStatusColor(p.status)}`} variant="secondary">
                              {p.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FIRC Tracking Tab */}
        <TabsContent value="firc" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">FIRC (Foreign Inward Remittance Certificate) Tracking</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Payment Ref</TableHead>
                      <TableHead>FIRC Number</TableHead>
                      <TableHead>FIRC Date</TableHead>
                      <TableHead>FIRC Bank</TableHead>
                      <TableHead className="text-right">Amount Received</TableHead>
                      <TableHead className="text-right">Exchange Rate</TableHead>
                      <TableHead className="text-right">INR Realized</TableHead>
                      <TableHead className="text-right">Bank Charges</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments
                      .filter((p) => p.firc_number || p.status === 'received')
                      .map((p) => (
                        <TableRow key={p.id}>
                          <TableCell className="font-medium">{p.payment_reference}</TableCell>
                          <TableCell>
                            {p.firc_number ? (
                              <span className="text-emerald-700 font-medium">{p.firc_number}</span>
                            ) : (
                              <Badge variant="outline" className="text-orange-600 border-orange-300 text-[10px]">
                                Pending
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>{formatDate(p.firc_date)}</TableCell>
                          <TableCell>{p.firc_bank || '-'}</TableCell>
                          <TableCell className="text-right">{formatCurrency(p.amount_received, p.received_currency)}</TableCell>
                          <TableCell className="text-right">{p.exchange_rate_at_receipt || '-'}</TableCell>
                          <TableCell className="text-right">{formatCurrency(p.inr_realized, 'INR')}</TableCell>
                          <TableCell className="text-right">{formatCurrency(p.bank_charges, 'USD')}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
