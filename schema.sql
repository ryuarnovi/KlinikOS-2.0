-- schema.sql

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    role VARCHAR(20) NOT NULL, -- admin, dokter, apoteker, kasir, resepsionis, perawat
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Patients table
CREATE TABLE IF NOT EXISTS patients (
    id SERIAL PRIMARY KEY,
    patient_code VARCHAR(20) UNIQUE NOT NULL,
    nik VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender CHAR(1) NOT NULL, -- L/P
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(100),
    blood_type VARCHAR(5),
    allergies TEXT,
    emergency_contact VARCHAR(255),
    emergency_phone VARCHAR(20),
    is_walkin BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Drugs/Pharmacy items
CREATE TABLE IF NOT EXISTS drugs (
    id SERIAL PRIMARY KEY,
    kode_obat VARCHAR(20) UNIQUE NOT NULL,
    nama_obat VARCHAR(255) NOT NULL,
    deskripsi TEXT,
    fungsi_obat TEXT,
    efek_samping TEXT,
    kategori_obat VARCHAR(100),
    merek_obat VARCHAR(100),
    dosis_obat VARCHAR(100),
    golongan_obat VARCHAR(100),
    bentuk_obat VARCHAR(50),
    unit VARCHAR(50),
    stok_obat INT DEFAULT 0,
    min_stock INT DEFAULT 0,
    harga_jual_grosir DECIMAL(15,2) DEFAULT 0,
    harga_jual_eceran DECIMAL(15,2) DEFAULT 0,
    expiry_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Queues table
CREATE TABLE IF NOT EXISTS queues (
    id SERIAL PRIMARY KEY,
    patient_id INT REFERENCES patients(id),
    queue_number VARCHAR(10) NOT NULL,
    queue_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'waiting', -- waiting, calling, completed, cancelled
    created_by INT REFERENCES users(id),
    called_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Medical Records
CREATE TABLE IF NOT EXISTS medical_records (
    id SERIAL PRIMARY KEY,
    patient_id INT REFERENCES patients(id),
    queue_id INT REFERENCES queues(id),
    doctor_id INT REFERENCES users(id),
    visit_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    subjective TEXT,
    objective TEXT,
    assessment TEXT,
    plan TEXT,
    vital_signs TEXT, -- Can be JSON string
    icd_code VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Prescriptions
CREATE TABLE IF NOT EXISTS prescriptions (
    id SERIAL PRIMARY KEY,
    prescription_code VARCHAR(20) UNIQUE NOT NULL,
    medical_record_id INT REFERENCES medical_records(id),
    patient_id INT REFERENCES patients(id),
    doctor_id INT REFERENCES users(id),
    prescription_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending', -- pending, processed, dispensed
    notes TEXT,
    processed_by INT REFERENCES users(id),
    processed_at TIMESTAMP,
    dispensed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Prescription Items
CREATE TABLE IF NOT EXISTS prescription_items (
    id SERIAL PRIMARY KEY,
    prescription_id INT REFERENCES prescriptions(id),
    drug_id INT REFERENCES drugs(id),
    quantity INT NOT NULL,
    dosage_instruction TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payments / Billing
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    payment_code VARCHAR(20) UNIQUE NOT NULL,
    patient_id INT REFERENCES patients(id),
    medical_record_id INT REFERENCES medical_records(id),
    prescription_id INT REFERENCES prescriptions(id),
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    doctor_fee DECIMAL(15,2) DEFAULT 0,
    medicine_cost DECIMAL(15,2) DEFAULT 0,
    admin_fee DECIMAL(15,2) DEFAULT 0,
    discount DECIMAL(15,2) DEFAULT 0,
    tax DECIMAL(15,2) DEFAULT 0,
    total_amount DECIMAL(15,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    paid_amount DECIMAL(15,2) DEFAULT 0,
    change_amount DECIMAL(15,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'unpaid', -- unpaid, paid, cancelled
    processed_by INT REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Referral table
CREATE TABLE IF NOT EXISTS referrals (
    id SERIAL PRIMARY KEY,
    patient_id INT REFERENCES patients(id),
    medical_record_id INT REFERENCES medical_records(id),
    doctor_id INT REFERENCES users(id),
    referral_to VARCHAR(255) NOT NULL,
    referral_date DATE DEFAULT CURRENT_DATE,
    diagnosis TEXT,
    notes TEXT,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Activity Logs
CREATE TABLE IF NOT EXISTS activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity VARCHAR(50),
    entity_id INT,
    description TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Data (Password for all: root210605)
-- Hash: $2a$10$bcy29aTs1DY9gdJdqZEtYelC8stMiwZ4Q4z80it4JQ9cPjz3dlryG

INSERT INTO users (username, password_hash, full_name, email, role, is_active)
VALUES 
('admin', '$2a$10$bcy29aTs1DY9gdJdqZEtYelC8stMiwZ4Q4z80it4JQ9cPjz3dlryG', 'Administrator', 'admin@klinikos.com', 'admin', TRUE),
('dokter', '$2a$10$bcy29aTs1DY9gdJdqZEtYelC8stMiwZ4Q4z80it4JQ9cPjz3dlryG', 'dr. Budi Santoso', 'budi@klinikos.com', 'dokter', TRUE),
('apoteker', '$2a$10$bcy29aTs1DY9gdJdqZEtYelC8stMiwZ4Q4z80it4JQ9cPjz3dlryG', 'Ibu Siti Aminah', 'siti@klinikos.com', 'apoteker', TRUE),
('kasir', '$2a$10$bcy29aTs1DY9gdJdqZEtYelC8stMiwZ4Q4z80it4JQ9cPjz3dlryG', 'Andi Kasir', 'andi@klinikos.com', 'kasir', TRUE),
('resepsionis', '$2a$10$bcy29aTs1DY9gdJdqZEtYelC8stMiwZ4Q4z80it4JQ9cPjz3dlryG', 'Rina Resep', 'rina@klinikos.com', 'resepsionis', TRUE),
('perawat', '$2a$10$bcy29aTs1DY9gdJdqZEtYelC8stMiwZ4Q4z80it4JQ9cPjz3dlryG', 'Suster Siti', 'perawat@klinikos.com', 'perawat', TRUE)
ON CONFLICT (username) DO NOTHING;

-- Seed Patient
INSERT INTO patients (patient_code, nik, full_name, date_of_birth, gender, address, phone, status)
VALUES ('P001', '1234567890123456', 'John Doe', '1990-01-01', 'L', 'Jl. Merdeka No. 1', '08123456789', 'active')
ON CONFLICT (patient_code) DO NOTHING;

-- Seed Drugs
INSERT INTO drugs (kode_obat, nama_obat, kategori_obat, unit, stok_obat, min_stock, harga_jual_eceran, harga_jual_grosir)
VALUES 
('D001', 'Paracetamol 500mg', 'Analgesic', 'Tablet', 100, 10, 500.00, 400.00),
('D002', 'Amoxicillin 250mg', 'Antibiotic', 'Capsule', 50, 5, 1200.00, 1000.00),
('D003', 'Vitamin C 1000mg', 'Supplement', 'Tablet', 200, 20, 1500.00, 1200.00)
ON CONFLICT (kode_obat) DO NOTHING;
