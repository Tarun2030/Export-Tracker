import supabase from './supabase';
import { Customer, Order, Payment, Shipment, Inquiry, Quotation, DashboardStats, AgingBucket } from '@/types/database';
import { demoCustomers, demoOrders, demoPayments, demoShipments, demoInquiries, demoQuotations } from './demo-data';
import { calculateOverdueDays } from './export-excel';

// Check if Supabase is configured
const isSupabaseConfigured = () => {
  return typeof window !== 'undefined';
};

// ============================================
// CUSTOMERS
// ============================================
export async function getCustomers(): Promise<Customer[]> {
  if (!isSupabaseConfigured()) return demoCustomers;

  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('company_name');

  if (error) throw new Error(`Failed to fetch customers: ${error.message}`);
  return data || [];
}

export async function getCustomer(id: string): Promise<Customer | null> {
  if (!isSupabaseConfigured()) return demoCustomers.find((c) => c.id === id) || null;

  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw new Error(`Failed to fetch customer: ${error.message}`);
  return data;
}

export async function createCustomer(customer: Partial<Customer>): Promise<Customer> {
  if (!isSupabaseConfigured()) {
    const newCustomer = { ...customer, id: `c${Date.now()}`, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as Customer;
    demoCustomers.push(newCustomer);
    return newCustomer;
  }

  const { data, error } = await supabase
    .from('customers')
    .insert(customer)
    .select()
    .single();

  if (error) throw new Error(`Failed to create customer: ${error.message}`);
  return data;
}

export async function updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer> {
  if (!isSupabaseConfigured()) {
    const idx = demoCustomers.findIndex((c) => c.id === id);
    if (idx !== -1) Object.assign(demoCustomers[idx], updates);
    return demoCustomers[idx];
  }

  const { data, error } = await supabase
    .from('customers')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update customer: ${error.message}`);
  return data;
}

export async function deleteCustomer(id: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    const idx = demoCustomers.findIndex((c) => c.id === id);
    if (idx !== -1) demoCustomers.splice(idx, 1);
    return;
  }

  const { error } = await supabase.from('customers').delete().eq('id', id);
  if (error) throw new Error(`Failed to delete customer: ${error.message}`);
}

// ============================================
// ORDERS
// ============================================
export async function getOrders(): Promise<Order[]> {
  if (!isSupabaseConfigured()) return demoOrders;

  const { data, error } = await supabase
    .from('orders')
    .select('*, customer:customers(*)')
    .order('order_date', { ascending: false });

  if (error) throw new Error(`Failed to fetch orders: ${error.message}`);
  return data || [];
}

export async function getOrder(id: string): Promise<Order | null> {
  if (!isSupabaseConfigured()) return demoOrders.find((o) => o.id === id) || null;

  const { data, error } = await supabase
    .from('orders')
    .select('*, customer:customers(*)')
    .eq('id', id)
    .single();

  if (error) throw new Error(`Failed to fetch order: ${error.message}`);
  return data;
}

export async function createOrder(order: Partial<Order>): Promise<Order> {
  if (!isSupabaseConfigured()) {
    const newOrder = {
      ...order,
      id: `o${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      customer: demoCustomers.find((c) => c.id === order.customer_id),
    } as Order;
    demoOrders.unshift(newOrder);
    return newOrder;
  }

  const { data, error } = await supabase
    .from('orders')
    .insert(order)
    .select('*, customer:customers(*)')
    .single();

  if (error) throw new Error(`Failed to create order: ${error.message}`);
  return data;
}

export async function updateOrder(id: string, updates: Partial<Order>): Promise<Order> {
  if (!isSupabaseConfigured()) {
    const idx = demoOrders.findIndex((o) => o.id === id);
    if (idx !== -1) Object.assign(demoOrders[idx], updates);
    return demoOrders[idx];
  }

  const { data, error } = await supabase
    .from('orders')
    .update(updates)
    .eq('id', id)
    .select('*, customer:customers(*)')
    .single();

  if (error) throw new Error(`Failed to update order: ${error.message}`);
  return data;
}

export async function deleteOrder(id: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    const idx = demoOrders.findIndex((o) => o.id === id);
    if (idx !== -1) demoOrders.splice(idx, 1);
    return;
  }

  const { error } = await supabase.from('orders').delete().eq('id', id);
  if (error) throw new Error(`Failed to delete order: ${error.message}`);
}

// ============================================
// PAYMENTS
// ============================================
export async function getPayments(): Promise<Payment[]> {
  if (!isSupabaseConfigured()) return demoPayments;

  const { data, error } = await supabase
    .from('payments')
    .select('*, order:orders(*), customer:customers(*)')
    .order('payment_due_date', { ascending: false });

  if (error) throw new Error(`Failed to fetch payments: ${error.message}`);
  return data || [];
}

export async function createPayment(payment: Partial<Payment>): Promise<Payment> {
  if (!isSupabaseConfigured()) {
    const newPayment = { ...payment, id: `p${Date.now()}`, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as Payment;
    demoPayments.push(newPayment);
    return newPayment;
  }

  const { data, error } = await supabase
    .from('payments')
    .insert(payment)
    .select('*, order:orders(*), customer:customers(*)')
    .single();

  if (error) throw new Error(`Failed to create payment: ${error.message}`);
  return data;
}

export async function updatePayment(id: string, updates: Partial<Payment>): Promise<Payment> {
  if (!isSupabaseConfigured()) {
    const idx = demoPayments.findIndex((p) => p.id === id);
    if (idx !== -1) Object.assign(demoPayments[idx], updates);
    return demoPayments[idx];
  }

  const { data, error } = await supabase
    .from('payments')
    .update(updates)
    .eq('id', id)
    .select('*, order:orders(*), customer:customers(*)')
    .single();

  if (error) throw new Error(`Failed to update payment: ${error.message}`);
  return data;
}

// ============================================
// SHIPMENTS
// ============================================
export async function getShipments(): Promise<Shipment[]> {
  if (!isSupabaseConfigured()) return demoShipments;

  const { data, error } = await supabase
    .from('shipments')
    .select('*, order:orders(*), customer:customers(*)')
    .order('shipment_date', { ascending: false });

  if (error) throw new Error(`Failed to fetch shipments: ${error.message}`);
  return data || [];
}

export async function createShipment(shipment: Partial<Shipment>): Promise<Shipment> {
  if (!isSupabaseConfigured()) {
    const newShipment = { ...shipment, id: `s${Date.now()}`, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as Shipment;
    demoShipments.push(newShipment);
    return newShipment;
  }

  const { data, error } = await supabase
    .from('shipments')
    .insert(shipment)
    .select('*, order:orders(*), customer:customers(*)')
    .single();

  if (error) throw new Error(`Failed to create shipment: ${error.message}`);
  return data;
}

export async function updateShipment(id: string, updates: Partial<Shipment>): Promise<Shipment> {
  if (!isSupabaseConfigured()) {
    const idx = demoShipments.findIndex((s) => s.id === id);
    if (idx !== -1) Object.assign(demoShipments[idx], updates);
    return demoShipments[idx];
  }

  const { data, error } = await supabase
    .from('shipments')
    .update(updates)
    .eq('id', id)
    .select('*, order:orders(*), customer:customers(*)')
    .single();

  if (error) throw new Error(`Failed to update shipment: ${error.message}`);
  return data;
}

// ============================================
// INQUIRIES
// ============================================
export async function getInquiries(): Promise<Inquiry[]> {
  if (!isSupabaseConfigured()) return demoInquiries;

  const { data, error } = await supabase
    .from('inquiries')
    .select('*, customer:customers(*)')
    .order('inquiry_date', { ascending: false });

  if (error) throw new Error(`Failed to fetch inquiries: ${error.message}`);
  return data || [];
}

export async function createInquiry(inquiry: Partial<Inquiry>): Promise<Inquiry> {
  if (!isSupabaseConfigured()) {
    const newInquiry = { ...inquiry, id: `inq${Date.now()}`, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as Inquiry;
    demoInquiries.push(newInquiry);
    return newInquiry;
  }

  const { data, error } = await supabase
    .from('inquiries')
    .insert(inquiry)
    .select('*, customer:customers(*)')
    .single();

  if (error) throw new Error(`Failed to create inquiry: ${error.message}`);
  return data;
}

// ============================================
// QUOTATIONS
// ============================================
export async function getQuotations(): Promise<Quotation[]> {
  if (!isSupabaseConfigured()) return demoQuotations;

  const { data, error } = await supabase
    .from('quotations')
    .select('*, customer:customers(*), inquiry:inquiries(*)')
    .order('quotation_date', { ascending: false });

  if (error) throw new Error(`Failed to fetch quotations: ${error.message}`);
  return data || [];
}

export async function createQuotation(quotation: Partial<Quotation>): Promise<Quotation> {
  if (!isSupabaseConfigured()) {
    const newQuotation = { ...quotation, id: `q${Date.now()}`, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as Quotation;
    demoQuotations.push(newQuotation);
    return newQuotation;
  }

  const { data, error } = await supabase
    .from('quotations')
    .insert(quotation)
    .select('*, customer:customers(*), inquiry:inquiries(*)')
    .single();

  if (error) throw new Error(`Failed to create quotation: ${error.message}`);
  return data;
}

// ============================================
// DASHBOARD STATS
// ============================================
export async function getDashboardStats(): Promise<DashboardStats> {
  const [orders, payments, shipments, customers, inquiries] = await Promise.all([
    getOrders(),
    getPayments(),
    getShipments(),
    getCustomers(),
    getInquiries(),
  ]);

  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();

  const thisMonthOrders = orders.filter((o) => {
    const d = new Date(o.order_date);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  });

  const pendingPayments = payments.filter(
    (p) => p.status === 'pending' || p.status === 'partial' || p.status === 'overdue'
  );

  const overduePayments = payments.filter((p) => {
    if (p.status === 'received') return false;
    return calculateOverdueDays(p.payment_due_date) > 30;
  });

  const shipmentsInTransit = shipments.filter(
    (s) => s.status === 'in_transit' || s.status === 'loaded'
  );

  const thisMonthRevenue = thisMonthOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);

  const convertedInquiries = inquiries.filter((i) => i.status === 'converted').length;
  const totalInquiriesCount = inquiries.length;
  const conversionRate = totalInquiriesCount > 0 ? (convertedInquiries / totalInquiriesCount) * 100 : 0;

  return {
    totalOrders: orders.length,
    pendingPayments: pendingPayments.length,
    overduePayments: overduePayments.length,
    shipmentsInTransit: shipmentsInTransit.length,
    thisMonthRevenue,
    totalCustomers: customers.length,
    totalInquiries: totalInquiriesCount,
    conversionRate,
  };
}

// ============================================
// AGING ANALYSIS
// ============================================
export async function getAgingAnalysis(): Promise<AgingBucket[]> {
  const payments = await getPayments();

  const unpaidPayments = payments.filter(
    (p) => p.status !== 'received'
  );

  const buckets: AgingBucket[] = [
    { range: '0-30 days', count: 0, totalAmount: 0, payments: [] },
    { range: '30-60 days', count: 0, totalAmount: 0, payments: [] },
    { range: '60-90 days', count: 0, totalAmount: 0, payments: [] },
    { range: '90+ days', count: 0, totalAmount: 0, payments: [] },
  ];

  unpaidPayments.forEach((payment) => {
    const overdueDays = calculateOverdueDays(payment.payment_due_date);
    const outstanding = payment.invoice_amount - payment.amount_received;

    let bucketIdx: number;
    if (overdueDays <= 30) bucketIdx = 0;
    else if (overdueDays <= 60) bucketIdx = 1;
    else if (overdueDays <= 90) bucketIdx = 2;
    else bucketIdx = 3;

    buckets[bucketIdx].count++;
    buckets[bucketIdx].totalAmount += outstanding;
    buckets[bucketIdx].payments.push(payment);
  });

  return buckets;
}
