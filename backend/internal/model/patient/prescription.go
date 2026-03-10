package patient

import "time"

type PrescriptionItemFK struct {
	ID       int    `json:"id"`
	DrugID   int    `json:"drug_id"`
	DrugName string `json:"drug_name"`
	Quantity int    `json:"qty"`
	Dosage   string `json:"dosage"`
	Unit     string `json:"unit"`
}

type Prescription struct {
	ID               int        `json:"id" db:"id"`
	PrescriptionCode string     `json:"prescription_code" db:"prescription_code"`
	MedicalRecordID  int        `json:"medical_record_id" db:"medical_record_id"`
	PatientID        int        `json:"patient_id" db:"patient_id"`
	DoctorID         int        `json:"doctor_id" db:"doctor_id"`
	PrescriptionDate time.Time  `json:"prescription_date" db:"prescription_date"`
	Status           string     `json:"status" db:"status"`
	Notes            *string    `json:"notes,omitempty" db:"notes"`
	ProcessedBy      *int       `json:"processed_by,omitempty" db:"processed_by"`
	ProcessedAt      *time.Time `json:"processed_at,omitempty" db:"processed_at"`
	DispensedAt      *time.Time `json:"dispensed_at,omitempty" db:"dispensed_at"`

	// Relasi opsional untuk response join
	Patient   *PatientFK           `json:"patient,omitempty"`
	Doctor    *DoctorFK            `json:"doctor,omitempty"`
	Processor *DoctorFK            `json:"processor,omitempty"`
	Items     []PrescriptionItemFK `json:"items,omitempty"`
}

type CreatePrescriptionItemInputItem struct {
	DrugID   int    `json:"drug_id" binding:"required"`
	Quantity int    `json:"qty" binding:"required"`
	Dosage   string `json:"dosage"`
}

type CreatePrescriptionInput struct {
	PrescriptionCode string                          `json:"prescription_code"`
	MedicalRecordID  int                             `json:"medical_record_id" binding:"required"`
	PatientID        int                             `json:"patient_id" binding:"required"`
	DoctorID         int                             `json:"doctor_id" binding:"required"`
	Notes            *string                         `json:"notes"`
	Items            []CreatePrescriptionItemInputItem `json:"items"`
}

type UpdatePrescriptionInput struct {
	Status      *string    `json:"status,omitempty" db:"status"`
	Notes       *string    `json:"notes,omitempty" db:"notes"`
	ProcessedBy *int       `json:"processed_by,omitempty" db:"processed_by"`
	ProcessedAt *time.Time `json:"processed_at,omitempty" db:"processed_at"`
	DispensedAt *time.Time `json:"dispensed_at,omitempty" db:"dispensed_at"`
}

type PrescriptionResponse struct {
	ID               int                  `json:"id"`
	PrescriptionCode string               `json:"prescription_code"`
	MedicalRecordID  int                  `json:"medical_record_id"`
	PatientID        int                  `json:"patient_id"`
	PatientName      string               `json:"patient_name,omitempty"`
	DoctorID         int                  `json:"doctor_id"`
	DoctorName       string               `json:"doctor_name,omitempty"`
	PrescriptionDate time.Time            `json:"prescription_date"`
	Status           string               `json:"status"`
	Notes            *string              `json:"notes,omitempty"`
	ProcessedBy      *int                 `json:"processed_by,omitempty"`
	ProcessedAt      *time.Time            `json:"processed_at,omitempty"`
	DispensedAt      *time.Time            `json:"dispensed_at,omitempty"`
	Patient          *PatientFK           `json:"patient,omitempty"`
	Doctor           *DoctorFK            `json:"doctor,omitempty"`
	Processor        *DoctorFK            `json:"processor,omitempty"`
	Items            []PrescriptionItemFK `json:"items,omitempty"`
}

func ToPrescriptionResponse(p Prescription) PrescriptionResponse {
	resp := PrescriptionResponse{
		ID:               p.ID,
		PrescriptionCode: p.PrescriptionCode,
		MedicalRecordID:  p.MedicalRecordID,
		PatientID:        p.PatientID,
		DoctorID:         p.DoctorID,
		PrescriptionDate: p.PrescriptionDate,
		Status:           p.Status,
		Notes:            p.Notes,
		ProcessedBy:      p.ProcessedBy,
		ProcessedAt:      p.ProcessedAt,
		DispensedAt:      p.DispensedAt,
		Patient:          p.Patient,
		Doctor:           p.Doctor,
		Processor:        p.Processor,
		Items:            p.Items,
	}
	if p.Patient != nil && p.Patient.FullName != nil {
		resp.PatientName = *p.Patient.FullName
	}
	if p.Doctor != nil && p.Doctor.FullName != nil {
		resp.DoctorName = *p.Doctor.FullName
	}
	return resp
}

func ToPrescriptionResponses(list []Prescription) []PrescriptionResponse {
	res := make([]PrescriptionResponse, len(list))
	for i, p := range list {
		res[i] = ToPrescriptionResponse(p)
	}
	return res
}
