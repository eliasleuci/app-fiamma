-- 1. Agregar columnas si no existen (completamente seguro de ejecutar múltiples veces)
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cash_amount numeric DEFAULT 0;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS card_amount numeric DEFAULT 0;

-- 2. Eliminar restricción de "Check" si existe (esto suele bloquear nuevos métodos de pago)
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'bookings_payment_method_check') THEN 
        ALTER TABLE bookings DROP CONSTRAINT bookings_payment_method_check; 
    END IF; 
END $$;

-- 3. Asegurar que payment_method acepte texto libre o incluir 'mixed'
ALTER TABLE bookings ALTER COLUMN payment_method TYPE text;
