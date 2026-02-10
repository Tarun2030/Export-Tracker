'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import { getInquiries, getQuotations } from '@/lib/data-service';
import { Inquiry, Quotation } from '@/types/database';
import { formatCurrency, formatDate, getStatusColor, exportToExcel } from '@/lib/export-excel';
import { Download, Search, FileText } from 'lucide-react';

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    async function fetchData() {
      try {
        const [inqData, quotData] = await Promise.all([getInquiries(), getQuotations()]);
        setInquiries(inqData);
        setQuotations(quotData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredInquiries = useMemo(() => {
    return inquiries.filter((inq) => {
      const matchesSearch =
        !search ||
        inq.inquiry_number.toLowerCase().includes(search.toLowerCase()) ||
        inq.product_description.toLowerCase().includes(search.toLowerCase()) ||
        inq.customer?.company_name?.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || inq.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [inquiries, search, statusFilter]);

  const handleExport = () => {
    exportToExcel(
      filteredInquiries.map((inq) => ({
        'Inquiry #': inq.inquiry_number,
        Customer: inq.customer?.company_name || '',
        Date: inq.inquiry_date,
        Product: inq.product_description,
        Quantity: inq.quantity || '',
        Unit: inq.unit,
        'Target Price': inq.target_price || '',
        Currency: inq.currency,
        'Delivery Terms': inq.delivery_terms,
        'Destination Port': inq.destination_port || '',
        'Follow Up': inq.follow_up_date || '',
        Status: inq.status,
      })),
      `inquiries-${new Date().toISOString().split('T')[0]}`,
      'Inquiries'
    );
  };

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
          <h1 className="text-2xl font-bold text-slate-900">Inquiries & Quotations</h1>
          <p className="text-sm text-slate-500 mt-1">Track RFQs and price offers</p>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Export Excel
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {['pending', 'quoted', 'converted', 'lost', 'cancelled'].map((status) => {
          const count = inquiries.filter((i) => i.status === status).length;
          return (
            <Card key={status} className="cursor-pointer" onClick={() => setStatusFilter(statusFilter === status ? 'all' : status)}>
              <CardContent className="pt-4 pb-3 text-center">
                <p className={`text-xl font-bold ${status === statusFilter ? 'text-emerald-600' : ''}`}>{count}</p>
                <Badge className={`text-[10px] ${getStatusColor(status)}`} variant="secondary">
                  {status}
                </Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search inquiries..."
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
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="quoted">Quoted</SelectItem>
                <SelectItem value="converted">Converted</SelectItem>
                <SelectItem value="lost">Lost</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Inquiry #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="min-w-[200px]">Product</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Target Price</TableHead>
                  <TableHead>Quotation</TableHead>
                  <TableHead>Follow Up</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInquiries.map((inq) => {
                  const quote = quotations.find((q) => q.inquiry_id === inq.id);
                  return (
                    <TableRow key={inq.id}>
                      <TableCell className="font-medium">{inq.inquiry_number}</TableCell>
                      <TableCell>{inq.customer?.company_name || '-'}</TableCell>
                      <TableCell className="text-sm">{formatDate(inq.inquiry_date)}</TableCell>
                      <TableCell className="text-sm">{inq.product_description}</TableCell>
                      <TableCell className="text-right text-sm">
                        {inq.quantity?.toLocaleString()} {inq.unit}
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {inq.target_price ? formatCurrency(inq.target_price, inq.currency) : '-'}
                      </TableCell>
                      <TableCell>
                        {quote ? (
                          <div>
                            <p className="text-sm text-emerald-700">{quote.quotation_number}</p>
                            <p className="text-xs text-slate-400">
                              {formatCurrency(quote.unit_price, quote.currency)}/{inq.unit}
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">Not quoted</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {inq.follow_up_date ? (
                          <span className={`text-sm ${new Date(inq.follow_up_date) < new Date() ? 'text-red-600 font-medium' : ''}`}>
                            {formatDate(inq.follow_up_date)}
                          </span>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-[10px] ${getStatusColor(inq.status)}`} variant="secondary">
                          {inq.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredInquiries.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-slate-500">
                      No inquiries found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Quotations Section */}
      {quotations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Recent Quotations
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Quotation #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Valid Until</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quotations.map((q) => (
                    <TableRow key={q.id}>
                      <TableCell className="font-medium">{q.quotation_number}</TableCell>
                      <TableCell>{q.customer?.company_name || '-'}</TableCell>
                      <TableCell className="text-sm">{q.product_description}</TableCell>
                      <TableCell className="text-right text-sm">{formatCurrency(q.unit_price, q.currency)}</TableCell>
                      <TableCell className="text-right text-sm">{formatCurrency(q.total_amount, q.currency)}</TableCell>
                      <TableCell>
                        {q.valid_until ? (
                          <span className={new Date(q.valid_until) < new Date() ? 'text-red-600' : ''}>
                            {formatDate(q.valid_until)}
                          </span>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-[10px] ${getStatusColor(q.status)}`} variant="secondary">
                          {q.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
