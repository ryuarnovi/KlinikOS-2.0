CREATE TABLE medicines (
    id SERIAL PRIMARY KEY,
    medicine_code VARCHAR(20) UNIQUE NOT NULL,
    medicine_name VARCHAR(100) NOT NULL,
    generic_name VARCHAR(100),
    category VARCHAR(50),
    unit VARCHAR(20),
    price DECIMAL(12,2) NOT NULL,
    stock_quantity INT DEFAULT 0,
    min_stock INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);