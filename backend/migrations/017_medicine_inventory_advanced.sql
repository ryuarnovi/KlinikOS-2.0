-- Advanced Inventory: Batches, Stock Opname, and Purchase Orders
CREATE TABLE medicine_batches (
    id SERIAL PRIMARY KEY,
    medicine_id INT REFERENCES medicines(id),
    batch_number VARCHAR(50) NOT NULL,
    expiry_date DATE NOT NULL,
    current_quantity INT NOT NULL DEFAULT 0,
    purchase_price DECIMAL(12,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE stock_opnames (
    id SERIAL PRIMARY KEY,
    opname_date DATE DEFAULT CURRENT_DATE,
    description TEXT,
    staf_id INT REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'draft', -- draft, completed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE stock_opname_items (
    id SERIAL PRIMARY KEY,
    opname_id INT REFERENCES stock_opnames(id),
    medicine_id INT REFERENCES medicines(id),
    batch_id INT REFERENCES medicine_batches(id),
    system_quantity INT NOT NULL,
    physical_quantity INT NOT NULL,
    adjustment_quantity INT NOT NULL,
    notes TEXT
);

CREATE TABLE purchase_orders (
    id SERIAL PRIMARY KEY,
    supplier_id INT REFERENCES suppliers(id),
    po_number VARCHAR(50) UNIQUE NOT NULL,
    po_date DATE DEFAULT CURRENT_DATE,
    expected_delivery_date DATE,
    total_amount DECIMAL(15,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending', -- pending, received, cancelled
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE purchase_order_items (
    id SERIAL PRIMARY KEY,
    po_id INT REFERENCES purchase_orders(id),
    medicine_id INT REFERENCES medicines(id),
    quantity INT NOT NULL,
    unit_price DECIMAL(12,2) NOT NULL,
    received_quantity INT DEFAULT 0
);
