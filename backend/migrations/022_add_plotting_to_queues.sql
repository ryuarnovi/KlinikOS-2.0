-- Add doctor and nurse assignment to queues for data plotting and filtering
ALTER TABLE queues ADD COLUMN doctor_id INT REFERENCES users(id);
ALTER TABLE queues ADD COLUMN nurse_id INT REFERENCES users(id);

-- Optional: Add nurse_id to medical_records if nurse participation needs to be historical
ALTER TABLE medical_records ADD COLUMN nurse_id INT REFERENCES users(id);
