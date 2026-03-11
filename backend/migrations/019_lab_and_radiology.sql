-- Laboratory and Radiology Modules
CREATE TABLE lab_test_categories (
    id SERIAL PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL
);

CREATE TABLE lab_tests (
    id SERIAL PRIMARY KEY,
    category_id INT REFERENCES lab_test_categories(id),
    test_name VARCHAR(100) NOT NULL,
    reference_range TEXT,
    unit VARCHAR(20),
    price DECIMAL(12,2) NOT NULL
);

CREATE TABLE lab_orders (
    id SERIAL PRIMARY KEY,
    medical_record_id INT REFERENCES medical_records(id),
    patient_id INT REFERENCES patients(id),
    doctor_id INT REFERENCES users(id),
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending', -- pending, sample_collected, in_progress, completed, cancelled
    total_cost DECIMAL(12,2) DEFAULT 0
);

CREATE TABLE lab_order_items (
    id SERIAL PRIMARY KEY,
    lab_order_id INT REFERENCES lab_orders(id),
    lab_test_id INT REFERENCES lab_tests(id),
    result_value VARCHAR(100),
    is_normal BOOLEAN,
    notes TEXT
);

CREATE TABLE lab_results_files (
    id SERIAL PRIMARY KEY,
    lab_order_id INT REFERENCES lab_orders(id),
    file_path TEXT NOT NULL,
    file_type VARCHAR(20), -- pdf, dicom, jpg
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
