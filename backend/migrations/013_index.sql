CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_queues_date_status ON queues(queue_date, status);
CREATE INDEX idx_medicine_name ON medicines(medicine_name);
CREATE INDEX idx_payments_status ON payments(status, payment_date);
CREATE INDEX idx_activity_time ON activity_logs(created_at);