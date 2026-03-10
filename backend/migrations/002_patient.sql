CREATE TABLE patients (
    id SERIAL PRIMARY KEY,
    patient_code VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(1) CHECK (gender IN ('L','P')) NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(100),
    blood_type VARCHAR(5),
    allergies TEXT,
    emergency_contact VARCHAR(100),
    emergency_phone VARCHAR(20),
    status VARCHAR(10) NOT NULL DEFAULT 'umum' CHECK (status IN ('umum','bpjs','swasta','pbi','jkm','jkk','raharja')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);