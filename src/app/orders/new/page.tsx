'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { getCustomers, createOrder } from '@/lib/data-service';
import { Customer } from '@/types/database';
import { Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewOrderPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    order_number: '',
    customer_id: '',
    order_date: new Date().toISOString().split('T')[0],
    product_description: '',
    hsn_code: '',
    quantity: '',
    unit: 'KG',
    unit_price: '',
    total_amount: '',
    currency: 'USD',
    exchange_rate: '84.00',
    inr_value: '',
    delivery_terms: 'FOB',
    payment_terms: '30 days LC',
    lc_number: '',
    lc_date: '',
    lc_expiry_date: '',
    lc_amount: '',
    lc_bank: '',
    destination_port: '',
    origin_port: 'INMUN',
    shipping_bill_number: '',
    shipping_bill_date: '',
    gst_invoice_number: '',
    gst_invoice_date: '',
    gst_amount: '0',
    igst_amount: '0',
    rodtep_claim: '0',
    rodtep_status: 'pending',
    drawback_amount: '0',
    drawback_status: 'pending',
    remarks: '',
    status: 'confirmed',
  });

  useEffect(() => {
    async function fetchCustomers() {
      try {
        const data = await getCustomers();
        setCustomers(data);
      } catch (error) {
        console.error('Failed to fetch customers:', error);
      }
    }
    fetchCustomers();
  }, []);

  // Auto-calculate total and INR value
  useEffect(() => {
    const qty = parseFloat(form.quantity) || 0;
    const price = parseFloat(form.unit_price) || 0;
    const total = qty * price;
    const rate = parseFloat(form.exchange_rate) || 0;
    const inr = total * rate;

    setForm((prev) => ({
      ...prev,
      total_amount: total.toFixed(2),
      inr_value: inr.toFixed(2),
    }));
  }, [form.quantity, form.unit_price, form.exchange_rate]);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!form.order_number || !form.customer_id || !form.product_description || !form.quantity || !form.unit_price) {
        toast({
          title: 'Validation Error',
          description: 'Please fill in all required fields',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      await createOrder({
        order_number: form.order_number,
        customer_id: form.customer_id,
        order_date: form.order_date,
        product_description: form.product_description,
        hsn_code: form.hsn_code || null,
        quantity: parseFloat(form.quantity),
        unit: form.unit,
        unit_price: parseFloat(form.unit_price),
        total_amount: parseFloat(form.total_amount),
        currency: form.currency,
        exchange_rate: parseFloat(form.exchange_rate),
        inr_value: parseFloat(form.inr_value),
        delivery_terms: form.delivery_terms,
        payment_terms: form.payment_terms,
        lc_number: form.lc_number || null,
        lc_date: form.lc_date || null,
        lc_expiry_date: form.lc_expiry_date || null,
        lc_amount: form.lc_amount ? parseFloat(form.lc_amount) : null,
        lc_bank: form.lc_bank || null,
        destination_port: form.destination_port || null,
        origin_port: form.origin_port,
        shipping_bill_number: form.shipping_bill_number || null,
        shipping_bill_date: form.shipping_bill_date || null,
        gst_invoice_number: form.gst_invoice_number || null,
        gst_invoice_date: form.gst_invoice_date || null,
        gst_amount: parseFloat(form.gst_amount),
        igst_amount: parseFloat(form.igst_amount),
        rodtep_claim: parseFloat(form.rodtep_claim),
        rodtep_status: form.rodtep_status as 'pending' | 'applied' | 'received' | 'rejected',
        drawback_amount: parseFloat(form.drawback_amount),
        drawback_status: form.drawback_status as 'pending' | 'applied' | 'received' | 'rejected',
        remarks: form.remarks || null,
        status: form.status as 'confirmed' | 'in_production' | 'ready_to_ship' | 'shipped' | 'delivered' | 'completed' | 'cancelled',
      });

      toast({
        title: 'Order Created',
        description: `Order ${form.order_number} has been created successfully`,
      });
      router.push('/orders/list');
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create order',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/orders/list">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Add New Order</h1>
          <p className="text-sm text-slate-500 mt-1">Create a new export order</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="order_number">Order Number *</Label>
              <Input
                id="order_number"
                value={form.order_number}
                onChange={(e) => handleChange('order_number', e.target.value)}
                placeholder="EXP-2026-004"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer_id">Customer *</Label>
              <Select value={form.customer_id} onValueChange={(v) => handleChange('customer_id', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.company_name} ({c.country})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="order_date">Order Date *</Label>
              <Input
                id="order_date"
                type="date"
                value={form.order_date}
                onChange={(e) => handleChange('order_date', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={form.status} onValueChange={(v) => handleChange('status', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="in_production">In Production</SelectItem>
                  <SelectItem value="ready_to_ship">Ready to Ship</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Product Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Product Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2 md:col-span-2 lg:col-span-3">
              <Label htmlFor="product_description">Product Description *</Label>
              <Input
                id="product_description"
                value={form.product_description}
                onChange={(e) => handleChange('product_description', e.target.value)}
                placeholder="e.g., Industrial Grade Sodium Hydroxide"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hsn_code">HSN Code</Label>
              <Input
                id="hsn_code"
                value={form.hsn_code}
                onChange={(e) => handleChange('hsn_code', e.target.value)}
                placeholder="e.g., 2815.11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                step="0.01"
                value={form.quantity}
                onChange={(e) => handleChange('quantity', e.target.value)}
                placeholder="25000"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Select value={form.unit} onValueChange={(v) => handleChange('unit', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="KG">KG</SelectItem>
                  <SelectItem value="MT">MT (Metric Ton)</SelectItem>
                  <SelectItem value="LTR">Litre</SelectItem>
                  <SelectItem value="PCS">Pieces</SelectItem>
                  <SelectItem value="CBM">CBM</SelectItem>
                  <SelectItem value="SET">Set</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pricing & Payment</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="unit_price">Unit Price *</Label>
              <Input
                id="unit_price"
                type="number"
                step="0.01"
                value={form.unit_price}
                onChange={(e) => handleChange('unit_price', e.target.value)}
                placeholder="0.85"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select value={form.currency} onValueChange={(v) => handleChange('currency', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="INR">INR</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="total_amount">Total Amount</Label>
              <Input
                id="total_amount"
                type="number"
                step="0.01"
                value={form.total_amount}
                readOnly
                className="bg-slate-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="exchange_rate">Exchange Rate (INR)</Label>
              <Input
                id="exchange_rate"
                type="number"
                step="0.01"
                value={form.exchange_rate}
                onChange={(e) => handleChange('exchange_rate', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inr_value">INR Value</Label>
              <Input
                id="inr_value"
                type="number"
                step="0.01"
                value={form.inr_value}
                readOnly
                className="bg-slate-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment_terms">Payment Terms</Label>
              <Select value={form.payment_terms} onValueChange={(v) => handleChange('payment_terms', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Advance">Advance</SelectItem>
                  <SelectItem value="30 days LC">30 days LC</SelectItem>
                  <SelectItem value="60 days LC">60 days LC</SelectItem>
                  <SelectItem value="90 days LC">90 days LC</SelectItem>
                  <SelectItem value="30 days TT">30 days TT</SelectItem>
                  <SelectItem value="60 days TT">60 days TT</SelectItem>
                  <SelectItem value="DP at sight">DP at Sight</SelectItem>
                  <SelectItem value="DA 30 days">DA 30 days</SelectItem>
                  <SelectItem value="DA 60 days">DA 60 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* LC Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">LC Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lc_number">LC Number</Label>
              <Input
                id="lc_number"
                value={form.lc_number}
                onChange={(e) => handleChange('lc_number', e.target.value)}
                placeholder="LC-2026-XXX-001"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lc_date">LC Date</Label>
              <Input
                id="lc_date"
                type="date"
                value={form.lc_date}
                onChange={(e) => handleChange('lc_date', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lc_expiry_date">LC Expiry Date</Label>
              <Input
                id="lc_expiry_date"
                type="date"
                value={form.lc_expiry_date}
                onChange={(e) => handleChange('lc_expiry_date', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lc_amount">LC Amount</Label>
              <Input
                id="lc_amount"
                type="number"
                step="0.01"
                value={form.lc_amount}
                onChange={(e) => handleChange('lc_amount', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lc_bank">LC Bank</Label>
              <Input
                id="lc_bank"
                value={form.lc_bank}
                onChange={(e) => handleChange('lc_bank', e.target.value)}
                placeholder="e.g., Emirates NBD"
              />
            </div>
          </CardContent>
        </Card>

        {/* Shipping Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Shipping Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="delivery_terms">Delivery Terms</Label>
              <Select value={form.delivery_terms} onValueChange={(v) => handleChange('delivery_terms', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FOB">FOB</SelectItem>
                  <SelectItem value="CIF">CIF</SelectItem>
                  <SelectItem value="CFR">CFR</SelectItem>
                  <SelectItem value="EXW">EXW</SelectItem>
                  <SelectItem value="DDP">DDP</SelectItem>
                  <SelectItem value="DAP">DAP</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="origin_port">Origin Port</Label>
              <Input
                id="origin_port"
                value={form.origin_port}
                onChange={(e) => handleChange('origin_port', e.target.value)}
                placeholder="INMUN"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="destination_port">Destination Port</Label>
              <Input
                id="destination_port"
                value={form.destination_port}
                onChange={(e) => handleChange('destination_port', e.target.value)}
                placeholder="e.g., Jebel Ali"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shipping_bill_number">Shipping Bill Number</Label>
              <Input
                id="shipping_bill_number"
                value={form.shipping_bill_number}
                onChange={(e) => handleChange('shipping_bill_number', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shipping_bill_date">Shipping Bill Date</Label>
              <Input
                id="shipping_bill_date"
                type="date"
                value={form.shipping_bill_date}
                onChange={(e) => handleChange('shipping_bill_date', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* India-specific: GST & Government Incentives */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">GST & Government Incentives</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gst_invoice_number">GST Invoice Number</Label>
              <Input
                id="gst_invoice_number"
                value={form.gst_invoice_number}
                onChange={(e) => handleChange('gst_invoice_number', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gst_invoice_date">GST Invoice Date</Label>
              <Input
                id="gst_invoice_date"
                type="date"
                value={form.gst_invoice_date}
                onChange={(e) => handleChange('gst_invoice_date', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="igst_amount">IGST Amount</Label>
              <Input
                id="igst_amount"
                type="number"
                step="0.01"
                value={form.igst_amount}
                onChange={(e) => handleChange('igst_amount', e.target.value)}
              />
            </div>

            <Separator className="col-span-full" />

            <div className="space-y-2">
              <Label htmlFor="rodtep_claim">RoDTEP Claim Amount</Label>
              <Input
                id="rodtep_claim"
                type="number"
                step="0.01"
                value={form.rodtep_claim}
                onChange={(e) => handleChange('rodtep_claim', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rodtep_status">RoDTEP Status</Label>
              <Select value={form.rodtep_status} onValueChange={(v) => handleChange('rodtep_status', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="applied">Applied</SelectItem>
                  <SelectItem value="received">Received</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator className="col-span-full" />

            <div className="space-y-2">
              <Label htmlFor="drawback_amount">Drawback Amount</Label>
              <Input
                id="drawback_amount"
                type="number"
                step="0.01"
                value={form.drawback_amount}
                onChange={(e) => handleChange('drawback_amount', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="drawback_status">Drawback Status</Label>
              <Select value={form.drawback_status} onValueChange={(v) => handleChange('drawback_status', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="applied">Applied</SelectItem>
                  <SelectItem value="received">Received</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Remarks */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Additional Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="remarks">Remarks</Label>
              <Textarea
                id="remarks"
                value={form.remarks}
                onChange={(e) => handleChange('remarks', e.target.value)}
                placeholder="Any additional notes..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex gap-3 justify-end">
          <Link href="/orders/list">
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Creating...' : 'Create Order'}
          </Button>
        </div>
      </form>
    </div>
  );
}
