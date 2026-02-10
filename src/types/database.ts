// ============================================
// Database Types for Export Tracking System
// ============================================

export interface Customer {
  id: string;
  company_name: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  country: string;
  city: string | null;
  address: string | null;
  gst_number: string | null;
  pan_number: string | null;
  iec_code: string | null;
  payment_terms: string;
  credit_limit: number;
  notes: string | null;
  status: 'active' | 'inactive' | 'blocked';
  created_at: string;
  updated_at: string;
}

export interface Inquiry {
  id: string;
  inquiry_number: string;
  customer_id: string | null;
  inquiry_date: string;
  product_description: string;
  quantity: number | null;
  unit: string;
  target_price: number | null;
  currency: string;
  delivery_terms: string;
  destination_port: string | null;
  remarks: string | null;
  status: 'pending' | 'quoted' | 'converted' | 'lost' | 'cancelled';
  follow_up_date: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  customer?: Customer;
}

export interface Quotation {
  id: string;
  quotation_number: string;
  inquiry_id: string | null;
  customer_id: string | null;
  quotation_date: string;
  valid_until: string | null;
  product_description: string;
  hsn_code: string | null;
  quantity: number | null;
  unit: string;
  unit_price: number;
  total_amount: number | null;
  currency: string;
  delivery_terms: string;
  payment_terms: string;
  destination_port: string | null;
  remarks: string | null;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'revised';
  created_at: string;
  updated_at: string;
  // Joined
  customer?: Customer;
  inquiry?: Inquiry;
}

export interface Order {
  id: string;
  order_number: string;
  quotation_id: string | null;
  customer_id: string | null;
  order_date: string;
  product_description: string;
  hsn_code: string | null;
  quantity: number;
  unit: string;
  unit_price: number;
  total_amount: number;
  currency: string;
  exchange_rate: number;
  inr_value: number | null;
  delivery_terms: string;
  payment_terms: string;
  lc_number: string | null;
  lc_date: string | null;
  lc_expiry_date: string | null;
  lc_amount: number | null;
  lc_bank: string | null;
  destination_port: string | null;
  origin_port: string;
  shipping_bill_number: string | null;
  shipping_bill_date: string | null;
  gst_invoice_number: string | null;
  gst_invoice_date: string | null;
  gst_amount: number;
  igst_amount: number;
  rodtep_claim: number;
  rodtep_status: 'pending' | 'applied' | 'received' | 'rejected';
  drawback_amount: number;
  drawback_status: 'pending' | 'applied' | 'received' | 'rejected';
  remarks: string | null;
  status: 'confirmed' | 'in_production' | 'ready_to_ship' | 'shipped' | 'delivered' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  // Joined
  customer?: Customer;
  quotation?: Quotation;
  shipments?: Shipment[];
  payments?: Payment[];
}

export interface Shipment {
  id: string;
  shipment_number: string;
  order_id: string;
  customer_id: string | null;
  shipment_date: string | null;
  etd: string | null;
  eta: string | null;
  vessel_name: string | null;
  voyage_number: string | null;
  bl_number: string | null;
  bl_date: string | null;
  container_number: string | null;
  container_size: string;
  shipping_line: string | null;
  freight_amount: number;
  freight_currency: string;
  insurance_amount: number;
  origin_port: string | null;
  destination_port: string | null;
  cha_name: string | null;
  cha_reference: string | null;
  customs_clearance_date: string | null;
  let_export_date: string | null;
  remarks: string | null;
  status: 'booked' | 'loaded' | 'in_transit' | 'arrived' | 'delivered' | 'cancelled';
  created_at: string;
  updated_at: string;
  // Joined
  order?: Order;
  customer?: Customer;
}

export interface Payment {
  id: string;
  payment_reference: string;
  order_id: string;
  customer_id: string | null;
  invoice_number: string | null;
  invoice_date: string | null;
  invoice_amount: number;
  invoice_currency: string;
  payment_due_date: string;
  payment_received_date: string | null;
  amount_received: number;
  received_currency: string;
  exchange_rate_at_receipt: number | null;
  inr_realized: number;
  bank_charges: number;
  firc_number: string | null;
  firc_date: string | null;
  firc_bank: string | null;
  payment_mode: 'LC' | 'TT' | 'DP' | 'DA' | 'advance' | 'open_credit';
  bank_ref_number: string | null;
  remarks: string | null;
  status: 'pending' | 'partial' | 'received' | 'overdue' | 'write_off';
  created_at: string;
  updated_at: string;
  // Joined
  order?: Order;
  customer?: Customer;
}

// ============================================
// Form Types
// ============================================
export type CustomerFormData = Omit<Customer, 'id' | 'created_at' | 'updated_at'>;
export type OrderFormData = Omit<Order, 'id' | 'created_at' | 'updated_at' | 'customer' | 'quotation' | 'shipments' | 'payments'>;
export type PaymentFormData = Omit<Payment, 'id' | 'created_at' | 'updated_at' | 'order' | 'customer'>;
export type ShipmentFormData = Omit<Shipment, 'id' | 'created_at' | 'updated_at' | 'order' | 'customer'>;

// ============================================
// Dashboard Types
// ============================================
export interface DashboardStats {
  totalOrders: number;
  pendingPayments: number;
  overduePayments: number;
  shipmentsInTransit: number;
  thisMonthRevenue: number;
  totalCustomers: number;
  totalInquiries: number;
  conversionRate: number;
}

export interface AgingBucket {
  range: string;
  count: number;
  totalAmount: number;
  payments: Payment[];
}
