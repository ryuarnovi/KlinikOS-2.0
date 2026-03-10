CREATE TABLE medical_records (
    id SERIAL PRIMARY KEY,
    patient_id INT NOT NULL,
    queue_id INT NOT NULL,
    doctor_id INT NOT NULL,
    visit_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    complaints TEXT,
    exam_results TEXT,
    diagnosis TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (queue_id) REFERENCES queues(id),
    FOREIGN KEY (doctor_id) REFERENCES users(id)
);