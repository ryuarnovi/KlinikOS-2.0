-- schema.sql

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    nip VARCHAR(20) UNIQUE,
    specialization VARCHAR(100),
    license_number VARCHAR(100),
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
VALUES 
('P001', '1234567890123456', 'John Doe', '1990-01-01', 'L', 'Jl. Merdeka No. 1', '08123456789', 'active'),
('P002', '3214567890123457', 'Siti Nurbaya', '1985-05-15', 'P', 'Jl. Jendral Sudirman No. 12', '08129876543', 'active'),
('P003', '6543217890123458', 'Budi Santoso', '1978-08-20', 'L', 'Jl. Ahmad Yani No. 45', '08134567890', 'active'),
('P004', '9876543210123459', 'Dewi Lestari', '1992-11-10', 'P', 'Jl. Gatot Subroto No. 8', '08567890123', 'active'),
('P005', '1239874560123460', 'Andi Firmansyah', '1980-03-25', 'L', 'Jl. Diponegoro No. 22', '08781234567', 'active'),
('P006', '4561237890123461', 'Rina Kusuma', '1995-07-30', 'P', 'Jl. Pahlawan No. 5', '08963456789', 'active'),
('P007', '7894561230123462', 'Surya Darma', '1975-12-05', 'L', 'Jl. Veteran No. 18', '08215678901', 'active'),
('P008', '3217894560123463', 'Maya Indah', '1988-02-14', 'P', 'Jl. Imam Bonjol No. 3', '08529012345', 'active')
ON CONFLICT (patient_code) DO NOTHING;

-- Seed Drugs
INSERT INTO drugs (kode_obat, nama_obat, kategori_obat, unit, stok_obat, min_stock, harga_jual_eceran, harga_jual_grosir)
VALUES 
('D001', 'Paracetamol 500mg', 'Analgesic', 'Tablet', 100, 10, 500.00, 400.00),
('D002', 'Amoxicillin 250mg', 'Antibiotic', 'Capsule', 50, 5, 1200.00, 1000.00),
('D003', 'Vitamin C 1000mg', 'Supplement', 'Tablet', 200, 20, 1500.00, 1200.00),
('D004', 'Omeprazole 20mg', 'Antacid', 'Capsule', 80, 15, 2000.00, 1800.00),
('D005', 'Cetirizine 10mg', 'Antihistamine', 'Tablet', 150, 20, 1000.00, 800.00),
('D006', 'Ibuprofen 400mg', 'NSAID', 'Tablet', 120, 15, 800.00, 600.00),
('D007', 'Metformin 500mg', 'Antidiabetic', 'Tablet', 300, 50, 700.00, 500.00),
('D008', 'Amlodipine 5mg', 'Antihypertensive', 'Tablet', 250, 30, 900.00, 700.00),
('D009', 'Salbutamol 2mg', 'Bronchodilator', 'Tablet', 100, 15, 600.00, 400.00),
('D010', 'Cefadroxil 500mg', 'Antibiotic', 'Capsule', 60, 10, 2500.00, 2000.00),
('D011', 'Loratadine 10mg', 'Antihistamine', 'Tablet', 150, 20, 1200.00, 900.00),
('D012', 'Domperidone 10mg', 'Antiemetic', 'Tablet', 200, 30, 800.00, 600.00),
('D013', 'Loperamide 2mg', 'Antidiarrheal', 'Tablet', 100, 15, 1500.00, 1200.00),
('D014', 'Simvastatin 10mg', 'Anticholesterol', 'Tablet', 180, 25, 1000.00, 750.00),
('D015', 'Glimepiride 2mg', 'Antidiabetic', 'Tablet', 150, 20, 1800.00, 1400.00),
('D016', 'Ranitidine 150mg', 'Antacid', 'Tablet', 90, 10, 800.00, 600.00),
('D017', 'Diclofenac 50mg', 'NSAID', 'Tablet', 250, 40, 700.00, 500.00),
('D018', 'Neurobion Forte', 'Vitamin B', 'Tablet', 300, 50, 2000.00, 1700.00),
('D019', 'Captopril 25mg', 'Antihypertensive', 'Tablet', 120, 20, 500.00, 300.00),
('D020', 'Prednisone 5mg', 'Corticosteroid', 'Tablet', 200, 30, 600.00, 400.00)
ON CONFLICT (kode_obat) DO NOTHING;

-- Seed Queues
INSERT INTO queues (patient_id, queue_number, status, created_by)
VALUES 
(1, 'Q001', 'completed', 5),
(2, 'Q002', 'waiting', 5),
(3, 'Q003', 'calling', 5),
(4, 'Q004', 'waiting', 5),
(5, 'Q005', 'waiting', 5);

-- Seed Medical Records
INSERT INTO medical_records (patient_id, queue_id, doctor_id, subjective, objective, assessment, plan, vital_signs, icd_code)
VALUES 
(1, 1, 2, 'Pasien mengeluh demam tinggi sejak 3 hari yang lalu, disertai mual dan pusing.', 'Suhu tubuh 39°C, Tekanan Darah 110/70 mmHg, Nadi 90x/menit. Tampak lemas.', 'Observasi Febris H-3, Suspek Demam Dengue / Tifoid.', 'Cek lab darah lengkap perifer. Berikan antipiretik, istirahat cukup, dan banyak minum air putih.', '{"TD": "110/70", "Suhu": "39", "Nadi": "90", "Nafas": "20", "BB": "65", "TB": "170"}', 'R50.9'),
(2, 2, 2, 'Batuk berdahak sudah 1 minggu, kadang sesak ringan.', 'Suara paru kasar, BP 120/80', 'Bronkitis Akut', 'Ekspektoran dan Antibiotik 5 hari', '{"TD": "120/80", "Suhu": "37", "Nadi": "85", "BB": "55"}', 'J20.9');

-- Seed Prescriptions
INSERT INTO prescriptions (prescription_code, medical_record_id, patient_id, doctor_id, status, notes)
VALUES 
('RX-1681234567', 1, 1, 2, 'pending', 'Diminum sesudah makan. Habiskan antibiotik jika ada.'),
('RX-1681234568', 2, 2, 2, 'processed', 'Tebus segera');

-- Seed Prescription Items
INSERT INTO prescription_items (prescription_id, drug_id, quantity, dosage_instruction)
VALUES 
(1, 1, 10, '3 x 1 Tablet, jika demam'),
(1, 3, 10, '1 x 1 Tablet, sesudah sarapan'),
(2, 2, 10, '3 x 1 Kapsul, habiskan'),
(2, 5, 5, '1 x 1 Tablet malam hari');

-- Seed Payments / Billing
INSERT INTO payments (payment_code, patient_id, medical_record_id, prescription_id, total_amount, payment_method, status, notes, doctor_fee, medicine_cost, admin_fee)
VALUES 
('INV-1681234567', 1, 1, 1, 105000.00, 'cash', 'unpaid', 'Biaya konsultasi dr. Budi Santoso dan resep rawat jalan.', 80000.00, 20000.00, 5000.00),
('INV-1681234568', 2, 2, 2, 120000.00, 'qris', 'paid', 'Konsultasi + Obat racikan', 80000.00, 35000.00, 5000.00);

-- Seed Referrals
INSERT INTO referrals (patient_id, medical_record_id, doctor_id, referral_to, diagnosis, notes, status)
VALUES 
(1, 1, 2, 'RSUD Provinsi', 'Suspek Demam Dengue (DBD) dengan warning signs', 'Mohon penanganan lebih lanjut dan cek lab berkala.', 'active'),
(2, 2, 2, 'Klinik Spesialis Paru Sehat', 'Suspek TB/Pneumonia', 'Mohon foto Rontgen Thorax', 'processed'),
(3, NULL, 2, 'RS Jantung Harapan Kita', 'Nyeri dada kiri menjalar ke lengan', 'Rujuk segera ke IGD', 'active'),
(4, NULL, 2, 'RS Spesialis Mata JEC', 'Buram pada mata kanan', 'Mohon evaluasi retina', 'active'),
(5, NULL, 2, 'Klinik Ortopedi', 'Fraktur terbuka pada kaki kiri', 'Rujuk untuk reposisi platina', 'active'),
(6, NULL, 2, 'Puskesmas Kecamatan', 'Kontrol gizi balita', 'Pertumbuhan BB stagnan 3 bulan', 'active');

-- Seed Activity Logs
INSERT INTO activity_logs (user_id, action, entity, entity_id, description)
VALUES 
(1, 'LOGIN', 'user', 1, 'Administrator berhasil login ke sistem.'),
(2, 'CREATE_MEDICAL_RECORD', 'medical_record', 1, 'dr. Budi Santoso telah menambahkan rekam medis baru untuk pasien John Doe.');
