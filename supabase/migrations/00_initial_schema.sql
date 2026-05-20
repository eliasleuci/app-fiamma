-- Supabase Complete Database Schema for App Fiamma
-- Pega este código en el SQL Editor de tu proyecto en Supabase y presiona "Run"

-- 1. Tabla de Configuración de la App
CREATE TABLE IF NOT EXISTS app_config (
    key text PRIMARY KEY,
    value text
);

-- 2. Tabla de Servicios
CREATE TABLE IF NOT EXISTS services (
    id text PRIMARY KEY,
    name text NOT NULL,
    price numeric NOT NULL,
    duration text NOT NULL,
    category text NOT NULL,
    category_en text,
    description text,
    name_en text,
    description_en text,
    promo_price numeric,
    sort_order integer DEFAULT 0
);

-- 3. Tabla de Equipo (Profesionales)
CREATE TABLE IF NOT EXISTS team (
    id text PRIMARY KEY,
    name text NOT NULL,
    role text NOT NULL,
    bio text,
    image text,
    pin text,
    "showOnHome" boolean DEFAULT true
);

-- 4. Tabla de Bloqueos de Profesionales
CREATE TABLE IF NOT EXISTS professional_blocks (
    id text PRIMARY KEY,
    date text NOT NULL,
    professional_id text NOT NULL
);

-- 5. Tabla de Bloqueos de Horarios Globales
CREATE TABLE IF NOT EXISTS time_blocks (
    id text PRIMARY KEY,
    date text NOT NULL,
    time text NOT NULL
);

-- 6. Tabla de Preguntas Frecuentes (FAQs)
CREATE TABLE IF NOT EXISTS faqs (
    id text PRIMARY KEY,
    question text NOT NULL,
    answer text NOT NULL,
    question_en text,
    answer_en text
);

-- 7. Tabla de Galería de Imágenes
CREATE TABLE IF NOT EXISTS gallery (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    image_url text NOT NULL
);

-- 8. Tabla de Reservas (Bookings)
CREATE TABLE IF NOT EXISTS bookings (
    id text PRIMARY KEY,
    client_name text NOT NULL,
    client_phone text NOT NULL,
    service_id text NOT NULL,
    service_name text NOT NULL,
    price numeric NOT NULL,
    payment_method text NOT NULL,
    cash_amount numeric DEFAULT 0,
    card_amount numeric DEFAULT 0,
    date text NOT NULL,
    time text NOT NULL,
    status text NOT NULL,
    professional_id text,
    created_at timestamptz DEFAULT now()
);

-- 9. Tabla de Reseñas (Reviews)
CREATE TABLE IF NOT EXISTS reviews (
    id text PRIMARY KEY,
    client_name text NOT NULL,
    rating integer NOT NULL,
    comment text,
    date text NOT NULL,
    approved boolean DEFAULT false
);

-- 10. Tabla de Fichas Clínicas
CREATE TABLE IF NOT EXISTS clinical_records (
    id text PRIMARY KEY,
    client_name text NOT NULL,
    client_phone text NOT NULL,
    professional_id text,
    professional_name text NOT NULL,
    date text NOT NULL,
    treatment text NOT NULL,
    notes text
);

-- 11. Categorías de Gastos
CREATE TABLE IF NOT EXISTS expense_categories (
    id text PRIMARY KEY,
    name text NOT NULL,
    color text NOT NULL
);

-- 12. Gastos (Expenses)
CREATE TABLE IF NOT EXISTS expenses (
    id text PRIMARY KEY,
    category_id text NOT NULL,
    category_name text NOT NULL,
    amount numeric NOT NULL,
    description text,
    date text NOT NULL,
    payment_method text NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- NOTA DE SEGURIDAD:
-- Si prefieres evitar problemas de permisos durante el desarrollo inicial,
-- puedes deshabilitar RLS (Row Level Security) temporalmente.
-- IMPORTANTE: Para producción se recomienda habilitar RLS y crear políticas.

-- Deshabilitar temporalmente RLS (Solo recomendado para entorno de desarrollo)
ALTER TABLE app_config DISABLE ROW LEVEL SECURITY;
ALTER TABLE services DISABLE ROW LEVEL SECURITY;
ALTER TABLE team DISABLE ROW LEVEL SECURITY;
ALTER TABLE professional_blocks DISABLE ROW LEVEL SECURITY;
ALTER TABLE time_blocks DISABLE ROW LEVEL SECURITY;
ALTER TABLE faqs DISABLE ROW LEVEL SECURITY;
ALTER TABLE gallery DISABLE ROW LEVEL SECURITY;
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE expense_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE expenses DISABLE ROW LEVEL SECURITY;
