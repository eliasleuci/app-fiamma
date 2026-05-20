-- ============================================
-- RLS Policies for Fiamma Turnos
-- Permite todas las operaciones necesarias
-- usando la anon key (sin autenticación)
-- ============================================

-- Habilitar RLS en todas las tablas (por consistencia)
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE team ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- bookings (SELECT, INSERT, UPDATE, DELETE)
CREATE OR REPLACE POLICY "Enable all for anon on bookings" ON bookings
  FOR ALL USING (true) WITH CHECK (true);

-- services (SELECT, INSERT, UPDATE, DELETE)
CREATE OR REPLACE POLICY "Enable all for anon on services" ON services
  FOR ALL USING (true) WITH CHECK (true);

-- app_config (SELECT, UPSERT)
CREATE OR REPLACE POLICY "Enable all for anon on app_config" ON app_config
  FOR ALL USING (true) WITH CHECK (true);

-- team (SELECT, INSERT, DELETE)
CREATE OR REPLACE POLICY "Enable all for anon on team" ON team
  FOR ALL USING (true) WITH CHECK (true);

-- professional_blocks (SELECT, INSERT, DELETE)
CREATE OR REPLACE POLICY "Enable all for anon on professional_blocks" ON professional_blocks
  FOR ALL USING (true) WITH CHECK (true);

-- time_blocks (SELECT, INSERT, DELETE)
CREATE OR REPLACE POLICY "Enable all for anon on time_blocks" ON time_blocks
  FOR ALL USING (true) WITH CHECK (true);

-- faqs (SELECT, INSERT, DELETE)
CREATE OR REPLACE POLICY "Enable all for anon on faqs" ON faqs
  FOR ALL USING (true) WITH CHECK (true);

-- gallery (SELECT, INSERT, DELETE)
CREATE OR REPLACE POLICY "Enable all for anon on gallery" ON gallery
  FOR ALL USING (true) WITH CHECK (true);

-- reviews (SELECT, INSERT, DELETE)
CREATE OR REPLACE POLICY "Enable all for anon on reviews" ON reviews
  FOR ALL USING (true) WITH CHECK (true);

-- clinical_records (SELECT, INSERT, UPDATE, DELETE)
CREATE OR REPLACE POLICY "Enable all for anon on clinical_records" ON clinical_records
  FOR ALL USING (true) WITH CHECK (true);

-- expense_categories (SELECT, INSERT, UPDATE, DELETE)
CREATE OR REPLACE POLICY "Enable all for anon on expense_categories" ON expense_categories
  FOR ALL USING (true) WITH CHECK (true);

-- expenses (SELECT, INSERT, UPDATE, DELETE)
CREATE OR REPLACE POLICY "Enable all for anon on expenses" ON expenses
  FOR ALL USING (true) WITH CHECK (true);
