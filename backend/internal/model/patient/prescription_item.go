package patient

// Relasi ke batch (untuk nama batch, dsb)
type DrugBatch struct {
	ID      string `json:"id"`
	NoBatch string `json:"nomor_batch"`
	// Tambahkan field lain jika perlu
}

type PrescriptionItem struct {
	ID               string  `json:"id"`
	PrescriptionID   string  `json:"prescription_id"`
	DrugBatchID      string  `json:"drug_batch_id"`
	DrugID           string  `json:"drug_id"`
	Jumlah           int     `json:"jumlah"`
	HargaJualSaatItu float64 `json:"harga_jual_saat_itu"`

	// Relasi opsional
	DrugBatch    *DrugBatch    `json:"drug_batch,omitempty"`
	Prescription *Prescription `json:"prescription,omitempty"`
}

// Untuk kebutuhan create
type CreatePrescriptionItemInput struct {
	PrescriptionID   string  `json:"prescription_id" binding:"required"`
	DrugBatchID      string  `json:"drug_batch_id" binding:"required"`
	DrugID           string  `json:"drug_id" binding:"required"`
	Jumlah           int     `json:"jumlah" binding:"required"`
	HargaJualSaatItu float64 `json:"harga_jual_saat_itu" binding:"required"`
}

// Untuk response
type PrescriptionItemResponse struct {
	ID               string        `json:"id"`
	PrescriptionID   string        `json:"prescription_id"`
	DrugBatchID      string        `json:"drug_batch_id"`
	DrugID           string        `json:"drug_id"`
	Jumlah           int           `json:"jumlah"`
	HargaJualSaatItu float64       `json:"harga_jual_saat_itu"`
	DrugBatch        *DrugBatch    `json:"drug_batch,omitempty"`
	Prescription     *Prescription `json:"prescription,omitempty"`
}
