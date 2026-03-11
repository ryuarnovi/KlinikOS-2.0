-- Migration to add staff related fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS nip VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS specialization VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS license_number VARCHAR(100);
