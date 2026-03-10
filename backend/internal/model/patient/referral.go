package patient

import (
	"time"
)

type Referral struct {
	ID              int        `json:"id" db:"id"`
	PatientID       int        `json:"patient_id" db:"patient_id"`
	MedicalRecordID *int       `json:"medical_record_id,omitempty" db:"medical_record_id"`
	DoctorID        int        `json:"doctor_id" db:"doctor_id"`
	ReferralTo      string     `json:"referral_to" db:"referral_to"`
	ReferralDate    time.Time  `json:"referral_date" db:"referral_date"`
	Diagnosis       *string    `json:"diagnosis,omitempty" db:"diagnosis"`
	Notes           *string    `json:"notes,omitempty" db:"notes"`
	Status          string     `json:"status" db:"status"`
	CreatedAt       time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt       time.Time  `json:"updated_at" db:"updated_at"`

	// Join relations
	PatientName string `json:"patient_name,omitempty"`
	DoctorName  string `json:"doctor_name,omitempty"`
}

type CreateReferralInput struct {
	PatientID       int     `json:"patient_id" binding:"required"`
	MedicalRecordID *int    `json:"medical_record_id"`
	DoctorID        int     `json:"doctor_id" binding:"required"`
	ReferralTo      string  `json:"referral_to" binding:"required"`
	ReferralDate    string  `json:"referral_date"`
	Diagnosis       *string `json:"diagnosis"`
	Notes           *string `json:"notes"`
}

type UpdateReferralInput struct {
	ReferralTo   *string `json:"referral_to" db:"referral_to"`
	ReferralDate *string `json:"referral_date" db:"referral_date"`
	Diagnosis    *string `json:"diagnosis" db:"diagnosis"`
	Notes        *string `json:"notes" db:"notes"`
	Status       *string `json:"status" db:"status"`
}
