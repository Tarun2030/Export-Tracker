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
import { getOrders } from '@/lib/data-service';
import { Order } from '@/types/database';
import { formatCurrency, formatDate, getStatusColor, getLCExpiryAlert, exportToExcel } from '@/lib/export-excel';
import { Search, Download, PlusCircle, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function OrderListPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currencyFilter, setCurrencyFilter] = useState('all');

  useEffect(() => {
    async function fetchOrders() {
      try {
        const data = await getOrders();
        setOrders(data);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        !search ||
        order.order_number.toLowerCase().includes(search.toLowerCase()) ||
        order.product_description.toLowerCase().includes(search.toLowerCase()) ||
        order.customer?.company_name?.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      const matchesCurrency = currencyFilter === 'all' || order.currency === currencyFilter;

      return matchesSearch && matchesStatus && matchesCurrency;
    });
  }, [orders, search, statusFilter, currencyFilter]);

  const handleExport = () => {
    const exportData = filteredOrders.map((o) => ({
      'Order Number': o.order_number,
      Customer: o.customer?.company_name || '',
      'Order Date': o.order_date,
      Product: o.product_description,
      'HSN Code': o.hsn_code || '',
      Quantity: o.quantity,
      Unit: o.unit,
      'Unit Price': o.unit_price,
      'Total Amount': o.total_amount,
      Currency: o.currency,
      'Exchange Rate': o.exchange_rate,
      'INR Value': o.inr_value || '',
      'Delivery Terms': o.delivery_terms,
      'Payment Terms': o.payment_terms,
      'LC Number': o.lc_number || '',
      'LC Expiry': o.lc_expiry_date || '',
      'Shipping Bill': o.shipping_bill_number || '',
      'GST Invoice': o.gst_invoice_number || '',
      'RoDTEP Claim': o.rodtep_claim,
      'RoDTEP Status': o.rodtep_status,
      'Drawback Amount': o.drawback_amount,
      Status: o.status,
    }));
    exportToExcel(exportData, `orders-${new Date().toISOString().split('T')[0]}`, 'Orders');
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
          <h1 className="text-2xl font-bold text-slate-900">Order List</h1>
          <p className="text-sm text-slate-500 mt-1">
            {filteredOrders.length} of {orders.length} orders
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
          <Link href="/orders/new">
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <PlusCircle className="h-4 w-4 mr-2" />
              New Order
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search orders, products, customers..."
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
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="in_production">In Production</SelectItem>
                <SelectItem value="ready_to_ship">Ready to Ship</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={currencyFilter} onValueChange={setCurrencyFilter}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="Currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="GBP">GBP</SelectItem>
                <SelectItem value="INR">INR</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[120px]">Order #</TableHead>
                  <TableHead className="min-w-[150px]">Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="min-w-[200px]">Product</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Terms</TableHead>
                  <TableHead>LC Alert</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => {
                  const lcAlert = getLCExpiryAlert(order.lc_expiry_date);
                  return (
                    <TableRow key={order.id} className="hover:bg-slate-50">
                      <TableCell className="font-medium text-emerald-700">{order.order_number}</TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{order.customer?.company_name || 'N/A'}</p>
                          <p className="text-xs text-slate-500">{order.customer?.country}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{formatDate(order.order_date)}</TableCell>
                      <TableCell>
                        <p className="text-sm">{order.product_description}</p>
                        {order.hsn_code && (
                          <p className="text-xs text-slate-400">HSN: {order.hsn_code}</p>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {order.quantity.toLocaleString()} {order.unit}
                      </TableCell>
                      <TableCell className="text-right">
                        <p className="text-sm font-medium">
                          {formatCurrency(order.total_amount, order.currency)}
                        </p>
                        {order.inr_value && (
                          <p className="text-xs text-slate-400">
                            {formatCurrency(order.inr_value, 'INR')}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">{order.delivery_terms}</TableCell>
                      <TableCell>
                        {lcAlert ? (
                          <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${lcAlert.color}`}>
                            <AlertTriangle className="h-3 w-3" />
                            <span>{lcAlert.message}</span>
                          </div>
                        ) : order.lc_number ? (
                          <span className="text-xs text-green-600">LC Active</span>
                        ) : (
                          <span className="text-xs text-slate-400">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-[10px] ${getStatusColor(order.status)}`} variant="secondary">
                          {order.status.replace(/_/g, ' ')}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredOrders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-slate-500">
                      No orders found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-600">Total Orders Value</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">
              {formatCurrency(filteredOrders.reduce((sum, o) => sum + o.total_amount, 0))}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-600">Total INR Value</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">
              {formatCurrency(filteredOrders.reduce((sum, o) => sum + (o.inr_value || 0), 0), 'INR')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-600">Total RoDTEP Claims</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">
              {formatCurrency(filteredOrders.reduce((sum, o) => sum + (o.rodtep_claim || 0), 0), 'INR')}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
