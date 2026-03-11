-- Patient Portal and BPJS Integration
CREATE TABLE patient_accounts (
    id SERIAL PRIMARY KEY,
    patient_id INT REFERENCES patients(id),
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    email VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- BPJS Integration fields for patients
ALTER TABLE patients ADD COLUMN bpjs_number VARCHAR(20);
ALTER TABLE patients ADD COLUMN bpjs_type VARCHAR(50); -- PBI, Non-PBI

-- BPJS Claims table
CREATE TABLE bpjs_claims (
    id SERIAL PRIMARY KEY,
    medical_record_id INT REFERENCES medical_records(id),
    sep_number VARCHAR(50) UNIQUE, -- Surat Eligibilitas Peserta
    claim_status VARCHAR(20),
    response_payload JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
