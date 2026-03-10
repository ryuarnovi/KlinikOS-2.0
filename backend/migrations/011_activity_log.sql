CREATE TABLE activity_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id INT,
    activity_type VARCHAR(50) NOT NULL,
    reference_id INT,
    reference_table VARCHAR(50),
    description TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);