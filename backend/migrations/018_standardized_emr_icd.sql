-- Standardized EMR: ICD-10 (Diagnosis) and ICD-9 CM (Procedures)
CREATE TABLE icd10 (
    id SERIAL PRIMARY KEY,
    code VARCHAR(10) UNIQUE NOT NULL,
    description_en TEXT,
    description_id TEXT,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE icd9cm (
    id SERIAL PRIMARY KEY,
    code VARCHAR(10) UNIQUE NOT NULL,
    description_en TEXT,
    description_id TEXT,
    is_active BOOLEAN DEFAULT TRUE
);

-- Relasikan ke rekam medis
ALTER TABLE medical_records ADD COLUMN primary_diagnosis_id INT REFERENCES icd10(id);
ALTER TABLE medical_records ADD COLUMN secondary_diagnoses JSONB; -- Untuk diagnosa tambahan
ALTER TABLE medical_records ADD COLUMN procedures JSONB; -- Untuk ICD-9 CM
