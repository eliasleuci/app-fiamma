-- ======================================
-- PREMIUM MODULES - SUPABASE MIGRATION
-- Run this in Supabase SQL Editor when deploying
-- ======================================

-- 1. Client Profiles (CRM)
CREATE TABLE IF NOT EXISTS client_profiles (
  id TEXT PRIMARY KEY,
  phone VARCHAR(30) NOT NULL,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(100),
  birthdate DATE,
  allergies TEXT,
  preferences TEXT,
  private_notes TEXT,
  tags JSONB DEFAULT '[]'::jsonb,
  total_spent DECIMAL(10,2) DEFAULT 0,
  visit_count INT DEFAULT 0,
  last_visit TIMESTAMP,
  last_service_name VARCHAR(200),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Inventory Categories
CREATE TABLE IF NOT EXISTS inventory_categories (
  id TEXT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT
);

-- 3. Inventory Items
CREATE TABLE IF NOT EXISTS inventory_items (
  id TEXT PRIMARY KEY,
  category_id TEXT REFERENCES inventory_categories(id) ON DELETE SET NULL,
  category_name VARCHAR(100),
  name VARCHAR(150) NOT NULL,
  unit VARCHAR(10) NOT NULL,
  current_quantity DECIMAL(10,2) NOT NULL DEFAULT 0,
  cost_per_unit DECIMAL(10,2) NOT NULL DEFAULT 0,
  alert_threshold DECIMAL(10,2) DEFAULT 0,
  last_restock_date DATE,
  supplier VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Service Inventory Costs (link insumos → servicios)
CREATE TABLE IF NOT EXISTS service_inventory_costs (
  id TEXT PRIMARY KEY,
  service_id TEXT NOT NULL,
  inventory_item_id TEXT REFERENCES inventory_items(id) ON DELETE CASCADE,
  inventory_item_name VARCHAR(150),
  quantity_used DECIMAL(10,2) NOT NULL,
  cost_per_unit DECIMAL(10,2) NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_client_profiles_phone ON client_profiles(phone);
CREATE INDEX IF NOT EXISTS idx_inventory_items_category ON inventory_items(category_id);
CREATE INDEX IF NOT EXISTS idx_svc_inv_costs_service ON service_inventory_costs(service_id);

-- Enable RLS (same pattern as existing tables)
ALTER TABLE client_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_inventory_costs ENABLE ROW LEVEL SECURITY;

-- Public access policies (same as other tables in this app)
CREATE POLICY "Public access" ON client_profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON inventory_categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON inventory_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON service_inventory_costs FOR ALL USING (true) WITH CHECK (true);
