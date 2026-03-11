-- Migration to add missing columns to payments table
ALTER TABLE payments ADD COLUMN IF NOT EXISTS medical_record_id INT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS doctor_fee DECIMAL(12,2) DEFAULT 0;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS medicine_cost DECIMAL(12,2) DEFAULT 0;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS admin_fee DECIMAL(12,2) DEFAULT 0;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS discount DECIMAL(12,2) DEFAULT 0;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS tax DECIMAL(12,2) DEFAULT 0;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS notes TEXT;

-- Update status enum if needed (but simpler to use VARCHAR check)
-- For this setup, we'll ensure columns exist. 
-- The backend uses string status, so if it was ENUM, we might need to broaden it or keep it.
-- Based on error logs, the main issue is missing columns.
