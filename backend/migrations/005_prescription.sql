CREATE TABLE prescriptions (
    id SERIAL PRIMARY KEY,
    prescription_code VARCHAR(20) UNIQUE NOT NULL,
    medical_record_id INT NOT NULL,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    prescription_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending','processed','ready','dispensed','cancelled') DEFAULT 'pending',
    notes TEXT,
    processed_by INT,
    processed_at TIMESTAMP NULL,
    dispensed_at TIMESTAMP NULL,
    FOREIGN KEY (medical_record_id) REFERENCES medical_records(id),
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (doctor_id) REFERENCES users(id),
    FOREIGN KEY (processed_by) REFERENCES users(id)
);