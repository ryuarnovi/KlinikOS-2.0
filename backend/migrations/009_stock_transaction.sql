CREATE TABLE stock_transactions (
    id SERIAL PRIMARY KEY,
    medicine_id INT NOT NULL,
    supplier_id INT,
    transaction_type ENUM('in','out','correction') NOT NULL,
    reference VARCHAR(50), -- kode resep, pembelian, atau penyesuaian
    quantity INT NOT NULL,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    processed_by INT,
    FOREIGN KEY (medicine_id) REFERENCES medicines(id),
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
    FOREIGN KEY (processed_by) REFERENCES users(id)
);