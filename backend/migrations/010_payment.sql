CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    payment_code VARCHAR(20) UNIQUE NOT NULL,
    patient_id INT NOT NULL,
    prescription_id INT,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(12,2) NOT NULL,
    payment_method ENUM('cash','debit','credit','transfer','ewallet') NOT NULL,
    paid_amount DECIMAL(12,2) NOT NULL,
    change_amount DECIMAL(12,2) DEFAULT 0,
    status ENUM('unpaid','paid','cancelled') DEFAULT 'unpaid',
    processed_by INT,
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (prescription_id) REFERENCES prescriptions(id),
    FOREIGN KEY (processed_by) REFERENCES users(id)
);