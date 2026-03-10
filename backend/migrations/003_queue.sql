CREATE TABLE queues (
    id SERIAL PRIMARY KEY,
    patient_id INT NOT NULL,
    queue_number VARCHAR(10) NOT NULL,
    queue_date DATE NOT NULL,
    status ENUM('waiting','in_progress','completed','cancelled') DEFAULT 'waiting',
    created_by INT,
    called_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);