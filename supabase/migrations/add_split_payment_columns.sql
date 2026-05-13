-- Add columns for split payments
ALTER TABLE bookings 
ADD COLUMN cash_amount numeric DEFAULT 0,
ADD COLUMN card_amount numeric DEFAULT 0;

-- Optional: Update existing records to have consistent data (if needed)
-- For example, if payment_method is 'cash', set cash_amount = price
UPDATE bookings 
SET cash_amount = price, card_amount = 0 
WHERE payment_method = 'cash';

UPDATE bookings 
SET card_amount = price, cash_amount = 0 
WHERE payment_method = 'card';
