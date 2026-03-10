package patient

import "time"

type PrescriptionFK struct {
	ID               int     `json:"id"`
	PrescriptionCode *string `json:"prescription_code,omitempty"`
}

type UserFK struct {
	ID       int     `json:"id"`
	FullName *string `json:"full_name,omitempty"`
}

type Payment struct {
	ID              int       `json:"id" db:"id"`
	PaymentCode     string    `json:"invoice_number" db:"payment_code"`
	PatientID       int       `json:"patient_id" db:"patient_id"`
	MedicalRecordID *int      `json:"medical_record_id,omitempty" db:"medical_record_id"`
	PrescriptionID  *int      `json:"prescription_id,omitempty" db:"prescription_id"`
	PaymentDate     time.Time `json:"payment_date" db:"payment_date"`
	DoctorFee       float64   `json:"doctor_fee" db:"doctor_fee"`
	MedicineCost    float64   `json:"medicine_cost" db:"medicine_cost"`
	AdminFee        float64   `json:"admin_fee" db:"admin_fee"`
	Discount        float64   `json:"discount" db:"discount"`
	Tax             float64   `json:"tax" db:"tax"`
	TotalAmount     float64   `json:"total" db:"total_amount"`
	PaymentMethod   string    `json:"payment_method" db:"payment_method"`
	PaidAmount      float64   `json:"paid_amount" db:"paid_amount"`
	ChangeAmount    float64   `json:"change_amount" db:"change_amount"`
	Status          string    `json:"status" db:"status"`
	ProcessedBy     *int      `json:"processed_by,omitempty" db:"processed_by"`
	Notes           *string   `json:"notes,omitempty" db:"notes"`

	// Relasi opsional untuk response join
	Patient      *PatientFK      `json:"patient,omitempty"`
	Prescription *PrescriptionFK `json:"prescription,omitempty"`
	Processor    *UserFK         `json:"processor,omitempty"`
}

type CreatePaymentInput struct {
	PaymentCode     string  `json:"invoice_number" binding:"required"`
	PatientID       int     `json:"patient_id" binding:"required"`
	MedicalRecordID *int    `json:"medical_record_id,omitempty"`
	PrescriptionID  *int    `json:"prescription_id,omitempty"`
	DoctorFee       float64 `json:"doctor_fee"`
	MedicineCost    float64 `json:"medicine_cost"`
	AdminFee        float64 `json:"admin_fee"`
	Discount        float64 `json:"discount"`
	Tax             float64 `json:"tax"`
	TotalAmount     float64 `json:"total" binding:"required"`
	PaymentMethod   string  `json:"payment_method" binding:"required"`
	PaidAmount      float64 `json:"paid_amount"`
	ProcessedBy     *int    `json:"processed_by,omitempty"`
	Notes           *string `json:"notes,omitempty"`
}

type UpdatePaymentInput struct {
	Status        *string  `json:"status,omitempty" db:"status"`
	PaidAmount    *float64 `json:"paid_amount,omitempty" db:"paid_amount"`
	ChangeAmount  *float64 `json:"change_amount,omitempty" db:"change_amount"`
	ProcessedBy   *int     `json:"processed_by,omitempty" db:"processed_by"`
	PaymentMethod *string  `json:"payment_method,omitempty" db:"payment_method"`
}

type PaymentResponse struct {
	ID              int             `json:"id"`
	PaymentCode     string          `json:"invoice_number"`
	PatientID       int             `json:"patient_id"`
	MedicalRecordID *int            `json:"medical_record_id,omitempty"`
	PrescriptionID  *int            `json:"prescription_id,omitempty"`
	PaymentDate     time.Time       `json:"payment_date"`
	DoctorFee       float64         `json:"doctor_fee"`
	MedicineCost    float64         `json:"medicine_cost"`
	AdminFee        float64         `json:"admin_fee"`
	Discount        float64         `json:"discount"`
	Tax             float64         `json:"tax"`
	TotalAmount     float64         `json:"total"`
	PaymentMethod   string          `json:"payment_method"`
	PaidAmount      float64         `json:"paid_amount"`
	ChangeAmount    float64         `json:"change_amount"`
	Status          string          `json:"status"`
	ProcessedBy     *int            `json:"processed_by,omitempty"`
	Notes           *string         `json:"notes,omitempty"`
	Patient         *PatientFK      `json:"patient,omitempty"`
	Prescription    *PrescriptionFK `json:"prescription,omitempty"`
	Processor       *UserFK         `json:"processor,omitempty"`
	PatientName     string          `json:"patient_name,omitempty"` // for flat lists
}

func ToPaymentResponse(p Payment) PaymentResponse {
	resp := PaymentResponse{
		ID:              p.ID,
		PaymentCode:     p.PaymentCode,
		PatientID:       p.PatientID,
		MedicalRecordID: p.MedicalRecordID,
		PrescriptionID:  p.PrescriptionID,
		PaymentDate:     p.PaymentDate,
		DoctorFee:       p.DoctorFee,
		MedicineCost:    p.MedicineCost,
		AdminFee:        p.AdminFee,
		Discount:        p.Discount,
		Tax:             p.Tax,
		TotalAmount:     p.TotalAmount,
		PaymentMethod:   p.PaymentMethod,
		PaidAmount:      p.PaidAmount,
		ChangeAmount:    p.ChangeAmount,
		Status:          p.Status,
		ProcessedBy:     p.ProcessedBy,
		Notes:           p.Notes,
		Patient:         p.Patient,
		Prescription:    p.Prescription,
		Processor:       p.Processor,
	}
	if p.Patient != nil && p.Patient.FullName != nil {
		resp.PatientName = *p.Patient.FullName
	}
	return resp
}

func ToPaymentResponses(list []Payment) []PaymentResponse {
	res := make([]PaymentResponse, len(list))
	for i, p := range list {
		res[i] = ToPaymentResponse(p)
	}
	return res
}
