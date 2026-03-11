-- HRIS: Doctor Schedules and Staff Shifts
CREATE TABLE doctor_schedules (
    id SERIAL PRIMARY KEY,
    doctor_id INT REFERENCES users(id),
    day_of_week INT NOT NULL, -- 0 (Sunday) to 6 (Saturday)
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    quota INT DEFAULT 20,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE staff_shifts (
    id SERIAL PRIMARY KEY,
    staff_id INT REFERENCES users(id),
    shift_date DATE NOT NULL,
    shift_type VARCHAR(20), -- morning, afternoon, night
    start_time TIME,
    end_time TIME,
    notes TEXT
);

-- Penyesuaian ke antrean untuk mengacu pada jadwal jika diperlukan
ALTER TABLE queues ADD COLUMN schedule_id INT REFERENCES doctor_schedules(id);
