-- Export Tracking System - Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CUSTOMERS TABLE (Buyer Database)
-- ============================================
CREATE TABLE IF NOT EXISTS customers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  country TEXT NOT NULL,
  city TEXT,
  address TEXT,
  gst_number TEXT,
  pan_number TEXT,
  iec_code TEXT,
  payment_terms TEXT DEFAULT '30 days',
  credit_limit NUMERIC(15,2) DEFAULT 0,
  notes TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blocked')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INQUIRIES TABLE (RFQ Tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS inquiries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  inquiry_number TEXT NOT NULL UNIQUE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  inquiry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  product_description TEXT NOT NULL,
  quantity NUMERIC(12,2),
  unit TEXT DEFAULT 'KG',
  target_price NUMERIC(15,2),
  currency TEXT DEFAULT 'USD',
  delivery_terms TEXT DEFAULT 'FOB',
  destination_port TEXT,
  remarks TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'quoted', 'converted', 'lost', 'cancelled')),
  follow_up_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- QUOTATIONS TABLE (Price Offers)
-- ============================================
CREATE TABLE IF NOT EXISTS quotations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  quotation_number TEXT NOT NULL UNIQUE,
  inquiry_id UUID REFERENCES inquiries(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  quotation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  valid_until DATE,
  product_description TEXT NOT NULL,
  hsn_code TEXT,
  quantity NUMERIC(12,2),
  unit TEXT DEFAULT 'KG',
  unit_price NUMERIC(15,2) NOT NULL,
  total_amount NUMERIC(15,2),
  currency TEXT DEFAULT 'USD',
  delivery_terms TEXT DEFAULT 'FOB',
  payment_terms TEXT DEFAULT '30 days LC',
  destination_port TEXT,
  remarks TEXT,
  status TEXT DEFAULT 'sent' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'expired', 'revised')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ORDERS TABLE (Confirmed Orders)
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  quotation_id UUID REFERENCES quotations(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  product_description TEXT NOT NULL,
  hsn_code TEXT,
  quantity NUMERIC(12,2) NOT NULL,
  unit TEXT DEFAULT 'KG',
  unit_price NUMERIC(15,2) NOT NULL,
  total_amount NUMERIC(15,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  exchange_rate NUMERIC(10,4) DEFAULT 83.0,
  inr_value NUMERIC(15,2),
  delivery_terms TEXT DEFAULT 'FOB',
  payment_terms TEXT DEFAULT '30 days LC',
  lc_number TEXT,
  lc_date DATE,
  lc_expiry_date DATE,
  lc_amount NUMERIC(15,2),
  lc_bank TEXT,
  destination_port TEXT,
  origin_port TEXT DEFAULT 'INMUN',
  shipping_bill_number TEXT,
  shipping_bill_date DATE,
  gst_invoice_number TEXT,
  gst_invoice_date DATE,
  gst_amount NUMERIC(15,2) DEFAULT 0,
  igst_amount NUMERIC(15,2) DEFAULT 0,
  rodtep_claim NUMERIC(15,2) DEFAULT 0,
  rodtep_status TEXT DEFAULT 'pending' CHECK (rodtep_status IN ('pending', 'applied', 'received', 'rejected')),
  drawback_amount NUMERIC(15,2) DEFAULT 0,
  drawback_status TEXT DEFAULT 'pending' CHECK (drawback_status IN ('pending', 'applied', 'received', 'rejected')),
  remarks TEXT,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'in_production', 'ready_to_ship', 'shipped', 'delivered', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SHIPMENTS TABLE (Dispatch Tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS shipments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  shipment_number TEXT NOT NULL UNIQUE,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  shipment_date DATE,
  etd DATE,
  eta DATE,
  vessel_name TEXT,
  voyage_number TEXT,
  bl_number TEXT,
  bl_date DATE,
  container_number TEXT,
  container_size TEXT DEFAULT '20ft',
  shipping_line TEXT,
  freight_amount NUMERIC(15,2) DEFAULT 0,
  freight_currency TEXT DEFAULT 'USD',
  insurance_amount NUMERIC(15,2) DEFAULT 0,
  origin_port TEXT,
  destination_port TEXT,
  cha_name TEXT,
  cha_reference TEXT,
  customs_clearance_date DATE,
  let_export_date DATE,
  remarks TEXT,
  status TEXT DEFAULT 'booked' CHECK (status IN ('booked', 'loaded', 'in_transit', 'arrived', 'delivered', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PAYMENTS TABLE (Realization Tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  payment_reference TEXT NOT NULL UNIQUE,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  invoice_number TEXT,
  invoice_date DATE,
  invoice_amount NUMERIC(15,2) NOT NULL,
  invoice_currency TEXT DEFAULT 'USD',
  payment_due_date DATE NOT NULL,
  payment_received_date DATE,
  amount_received NUMERIC(15,2) DEFAULT 0,
  received_currency TEXT DEFAULT 'USD',
  exchange_rate_at_receipt NUMERIC(10,4),
  inr_realized NUMERIC(15,2) DEFAULT 0,
  bank_charges NUMERIC(15,2) DEFAULT 0,
  firc_number TEXT,
  firc_date DATE,
  firc_bank TEXT,
  payment_mode TEXT DEFAULT 'LC' CHECK (payment_mode IN ('LC', 'TT', 'DP', 'DA', 'advance', 'open_credit')),
  bank_ref_number TEXT,
  remarks TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'received', 'overdue', 'write_off')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_inquiries_customer ON inquiries(customer_id);
CREATE INDEX idx_inquiries_status ON inquiries(status);
CREATE INDEX idx_quotations_customer ON quotations(customer_id);
CREATE INDEX idx_quotations_inquiry ON quotations(inquiry_id);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_order_date ON orders(order_date);
CREATE INDEX idx_shipments_order ON shipments(order_id);
CREATE INDEX idx_shipments_status ON shipments(status);
CREATE INDEX idx_payments_order ON payments(order_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_due_date ON payments(payment_due_date);

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inquiries_updated_at BEFORE UPDATE ON inquiries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quotations_updated_at BEFORE UPDATE ON quotations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shipments_updated_at BEFORE UPDATE ON shipments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (Optional - enable per table)
-- ============================================
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated users (adjust as needed)
CREATE POLICY "Allow all for authenticated" ON customers FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON inquiries FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON quotations FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON orders FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON shipments FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON payments FOR ALL USING (true);
