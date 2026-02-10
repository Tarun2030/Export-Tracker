'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { getCustomers, createCustomer, getOrders, getPayments } from '@/lib/data-service';
import { Customer, Order, Payment } from '@/types/database';
import { formatCurrency, getStatusColor, exportToExcel } from '@/lib/export-excel';
import { useToast } from '@/hooks/use-toast';
import { Download, Search, PlusCircle, Users, Eye } from 'lucide-react';

export default function CustomersPage() {
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [countryFilter, setCountryFilter] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [saving, setSaving] = useState(false);

  const [newCustomer, setNewCustomer] = useState({
    company_name: '',
    contact_person: '',
    email: '',
    phone: '',
    country: '',
    city: '',
    address: '',
    gst_number: '',
    pan_number: '',
    iec_code: '',
    payment_terms: '30 days',
    credit_limit: '0',
    notes: '',
    status: 'active',
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const [custData, ordData, payData] = await Promise.all([
          getCustomers(),
          getOrders(),
          getPayments(),
        ]);
        setCustomers(custData);
        setOrders(ordData);
        setPayments(payData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const countries = useMemo(() => {
    const set = new Set(customers.map((c) => c.country));
    return Array.from(set).sort();
  }, [customers]);

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const matchesSearch =
        !search ||
        c.company_name.toLowerCase().includes(search.toLowerCase()) ||
        c.contact_person?.toLowerCase().includes(search.toLowerCase()) ||
        c.email?.toLowerCase().includes(search.toLowerCase()) ||
        c.country.toLowerCase().includes(search.toLowerCase());
      const matchesCountry = countryFilter === 'all' || c.country === countryFilter;
      return matchesSearch && matchesCountry;
    });
  }, [customers, search, countryFilter]);

  const getCustomerStats = (customerId: string) => {
    const custOrders = orders.filter((o) => o.customer_id === customerId);
    const custPayments = payments.filter((p) => p.customer_id === customerId);
    const totalOrdered = custOrders.reduce((sum, o) => sum + o.total_amount, 0);
    const totalReceived = custPayments.reduce((sum, p) => sum + p.amount_received, 0);
    const totalInvoiced = custPayments.reduce((sum, p) => sum + p.invoice_amount, 0);
    const outstanding = totalInvoiced - totalReceived;
    return { orderCount: custOrders.length, totalOrdered, totalReceived, outstanding };
  };

  const handleAddCustomer = async () => {
    setSaving(true);
    try {
      if (!newCustomer.company_name || !newCustomer.country) {
        toast({ title: 'Validation Error', description: 'Company name and country are required', variant: 'destructive' });
        setSaving(false);
        return;
      }
      const created = await createCustomer({
        company_name: newCustomer.company_name,
        contact_person: newCustomer.contact_person || null,
        email: newCustomer.email || null,
        phone: newCustomer.phone || null,
        country: newCustomer.country,
        city: newCustomer.city || null,
        address: newCustomer.address || null,
        gst_number: newCustomer.gst_number || null,
        pan_number: newCustomer.pan_number || null,
        iec_code: newCustomer.iec_code || null,
        payment_terms: newCustomer.payment_terms,
        credit_limit: parseFloat(newCustomer.credit_limit) || 0,
        notes: newCustomer.notes || null,
        status: newCustomer.status as 'active' | 'inactive' | 'blocked',
      });
      setCustomers((prev) => [...prev, created]);
      setShowAddDialog(false);
      setNewCustomer({
        company_name: '', contact_person: '', email: '', phone: '', country: '', city: '',
        address: '', gst_number: '', pan_number: '', iec_code: '', payment_terms: '30 days',
        credit_limit: '0', notes: '', status: 'active',
      });
      toast({ title: 'Customer Added', description: `${created.company_name} has been added.` });
    } catch (error) {
      toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to add customer', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleExport = () => {
    exportToExcel(
      filteredCustomers.map((c) => {
        const stats = getCustomerStats(c.id);
        return {
          Company: c.company_name,
          Contact: c.contact_person || '',
          Email: c.email || '',
          Phone: c.phone || '',
          Country: c.country,
          City: c.city || '',
          'GST Number': c.gst_number || '',
          'PAN Number': c.pan_number || '',
          'IEC Code': c.iec_code || '',
          'Payment Terms': c.payment_terms,
          'Credit Limit': c.credit_limit,
          'Total Orders': stats.orderCount,
          'Total Ordered (USD)': stats.totalOrdered,
          'Outstanding (USD)': stats.outstanding,
          Status: c.status,
        };
      }),
      `customers-${new Date().toISOString().split('T')[0]}`,
      'Customers'
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
          <h1 className="text-2xl font-bold text-slate-900">Customer Database</h1>
          <p className="text-sm text-slate-500 mt-1">{customers.length} registered buyers</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Customer
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Customer</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div className="space-y-2 sm:col-span-2">
                  <Label>Company Name *</Label>
                  <Input
                    value={newCustomer.company_name}
                    onChange={(e) => setNewCustomer({ ...newCustomer, company_name: e.target.value })}
                    placeholder="ABC Trading LLC"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contact Person</Label>
                  <Input
                    value={newCustomer.contact_person}
                    onChange={(e) => setNewCustomer({ ...newCustomer, contact_person: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Country *</Label>
                  <Input
                    value={newCustomer.country}
                    onChange={(e) => setNewCustomer({ ...newCustomer, country: e.target.value })}
                    placeholder="UAE"
                  />
                </div>
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input
                    value={newCustomer.city}
                    onChange={(e) => setNewCustomer({ ...newCustomer, city: e.target.value })}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Address</Label>
                  <Textarea
                    value={newCustomer.address}
                    onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label>GST Number</Label>
                  <Input
                    value={newCustomer.gst_number}
                    onChange={(e) => setNewCustomer({ ...newCustomer, gst_number: e.target.value })}
                    placeholder="27AABCT1234A1Z5"
                  />
                </div>
                <div className="space-y-2">
                  <Label>PAN Number</Label>
                  <Input
                    value={newCustomer.pan_number}
                    onChange={(e) => setNewCustomer({ ...newCustomer, pan_number: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>IEC Code</Label>
                  <Input
                    value={newCustomer.iec_code}
                    onChange={(e) => setNewCustomer({ ...newCustomer, iec_code: e.target.value })}
                    placeholder="IEC0001234"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Payment Terms</Label>
                  <Input
                    value={newCustomer.payment_terms}
                    onChange={(e) => setNewCustomer({ ...newCustomer, payment_terms: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Credit Limit (USD)</Label>
                  <Input
                    type="number"
                    value={newCustomer.credit_limit}
                    onChange={(e) => setNewCustomer({ ...newCustomer, credit_limit: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={newCustomer.status}
                    onValueChange={(v) => setNewCustomer({ ...newCustomer, status: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="blocked">Blocked</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={newCustomer.notes}
                    onChange={(e) => setNewCustomer({ ...newCustomer, notes: e.target.value })}
                    rows={2}
                  />
                </div>
                <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddCustomer}
                    disabled={saving}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    {saving ? 'Saving...' : 'Add Customer'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by company, contact, email, country..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={countryFilter} onValueChange={setCountryFilter}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                {countries.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Customer Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[180px]">Company</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>IEC / GST</TableHead>
                  <TableHead className="text-right">Orders</TableHead>
                  <TableHead className="text-right">Total Value</TableHead>
                  <TableHead className="text-right">Outstanding</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => {
                  const stats = getCustomerStats(customer.id);
                  return (
                    <TableRow key={customer.id} className="hover:bg-slate-50">
                      <TableCell>
                        <p className="font-medium">{customer.company_name}</p>
                        <p className="text-xs text-slate-400">{customer.email}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{customer.contact_person || '-'}</p>
                        <p className="text-xs text-slate-400">{customer.phone}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{customer.country}</p>
                        <p className="text-xs text-slate-400">{customer.city}</p>
                      </TableCell>
                      <TableCell>
                        {customer.iec_code && (
                          <p className="text-xs">IEC: {customer.iec_code}</p>
                        )}
                        {customer.gst_number && (
                          <p className="text-xs text-slate-400">GST: {customer.gst_number}</p>
                        )}
                        {!customer.iec_code && !customer.gst_number && <span className="text-slate-400">-</span>}
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium">{stats.orderCount}</TableCell>
                      <TableCell className="text-right text-sm">
                        {formatCurrency(stats.totalOrdered)}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={`text-sm font-medium ${stats.outstanding > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {formatCurrency(stats.outstanding)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-[10px] ${getStatusColor(customer.status)}`} variant="secondary">
                          {customer.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setSelectedCustomer(customer)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-lg">
                            <DialogHeader>
                              <DialogTitle>{customer.company_name}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 mt-2">
                              <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                  <p className="text-slate-500">Contact</p>
                                  <p className="font-medium">{customer.contact_person || '-'}</p>
                                </div>
                                <div>
                                  <p className="text-slate-500">Email</p>
                                  <p className="font-medium">{customer.email || '-'}</p>
                                </div>
                                <div>
                                  <p className="text-slate-500">Phone</p>
                                  <p className="font-medium">{customer.phone || '-'}</p>
                                </div>
                                <div>
                                  <p className="text-slate-500">Location</p>
                                  <p className="font-medium">{customer.city}, {customer.country}</p>
                                </div>
                                <div>
                                  <p className="text-slate-500">IEC Code</p>
                                  <p className="font-medium">{customer.iec_code || '-'}</p>
                                </div>
                                <div>
                                  <p className="text-slate-500">GST Number</p>
                                  <p className="font-medium">{customer.gst_number || '-'}</p>
                                </div>
                                <div>
                                  <p className="text-slate-500">Payment Terms</p>
                                  <p className="font-medium">{customer.payment_terms}</p>
                                </div>
                                <div>
                                  <p className="text-slate-500">Credit Limit</p>
                                  <p className="font-medium">{formatCurrency(customer.credit_limit)}</p>
                                </div>
                              </div>
                              <div className="border-t pt-3">
                                <h4 className="text-sm font-semibold mb-2">Order History</h4>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                  <div className="bg-blue-50 p-3 rounded-lg text-center">
                                    <p className="text-2xl font-bold text-blue-700">{stats.orderCount}</p>
                                    <p className="text-xs text-blue-600">Total Orders</p>
                                  </div>
                                  <div className="bg-emerald-50 p-3 rounded-lg text-center">
                                    <p className="text-2xl font-bold text-emerald-700">{formatCurrency(stats.totalOrdered)}</p>
                                    <p className="text-xs text-emerald-600">Total Value</p>
                                  </div>
                                  <div className="bg-green-50 p-3 rounded-lg text-center">
                                    <p className="text-2xl font-bold text-green-700">{formatCurrency(stats.totalReceived)}</p>
                                    <p className="text-xs text-green-600">Received</p>
                                  </div>
                                  <div className={`p-3 rounded-lg text-center ${stats.outstanding > 0 ? 'bg-red-50' : 'bg-gray-50'}`}>
                                    <p className={`text-2xl font-bold ${stats.outstanding > 0 ? 'text-red-700' : 'text-gray-700'}`}>
                                      {formatCurrency(stats.outstanding)}
                                    </p>
                                    <p className={`text-xs ${stats.outstanding > 0 ? 'text-red-600' : 'text-gray-600'}`}>Outstanding</p>
                                  </div>
                                </div>
                              </div>
                              {customer.notes && (
                                <div className="border-t pt-3">
                                  <p className="text-xs text-slate-500">Notes</p>
                                  <p className="text-sm">{customer.notes}</p>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredCustomers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-slate-500">
                      No customers found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
