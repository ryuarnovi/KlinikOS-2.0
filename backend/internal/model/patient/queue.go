package patient

import (
	"time"
)

type User struct {
	ID       int     `json:"id" db:"id"`
	FullName *string `json:"full_name,omitempty" db:"full_name,omitempty"`
}

type Queue struct {
	ID          int        `json:"id" db:"id"`
	PatientID   int        `json:"patient_id" db:"patient_id"`
	QueueNumber string     `json:"queue_number" db:"queue_number"`
	QueueDate   time.Time  `json:"queue_date" db:"queue_date"`
	Status      string     `json:"status" db:"status"`
	CreatedBy   *int       `json:"created_by,omitempty" db:"created_by"`
	DoctorID    *int       `json:"doctor_id,omitempty" db:"doctor_id"`
	NurseID     *int       `json:"nurse_id,omitempty" db:"nurse_id"`
	CalledAt    *time.Time `json:"called_at,omitempty" db:"called_at"`
	CompletedAt *time.Time `json:"completed_at,omitempty" db:"completed_at"`
	CreatedAt   time.Time  `json:"created_at" db:"created_at"`

	// Patient *PatientFK `json:"patient,omitempty"` // relasi ke patient
	Patient *PatientFK `json:"patient,omitempty"` // relasi ke patient
	Users   *User      `json:"users,omitempty"`   // relasi ke users (created_by)
}

type CreateQueueInput struct {
	PatientID   int    `json:"patient_id" binding:"required"`
	QueueNumber string `json:"queue_number"`
	QueueDate   string `json:"queue_date"` // format: "2006-01-02"
	CreatedBy   *int   `json:"created_by"`
	DoctorID    *int   `json:"doctor_id"`
	NurseID     *int   `json:"nurse_id"`
}

type UpdateQueueInput struct {
	Status      *string    `json:"status,omitempty"`
	CalledAt    *time.Time `json:"called_at,omitempty"`
	CompletedAt *time.Time `json:"completed_at,omitempty"`
}

type QueueResponse struct {
	ID            int        `json:"id"`
	PatientID     int        `json:"patient_id"`
	PatientName   string     `json:"patient_name,omitempty"`
	QueueNumber   string     `json:"queue_number"`
	QueueDate     time.Time  `json:"queue_date"`
	Status        string     `json:"status"`
	CreatedBy     *int       `json:"created_by,omitempty"`
	CreatedByName string     `json:"created_by_name,omitempty"`
	DoctorID      *int       `json:"doctor_id,omitempty"`
	NurseID       *int       `json:"nurse_id,omitempty"`
	CalledAt      *time.Time `json:"called_at,omitempty"`
	CompletedAt   *time.Time `json:"completed_at,omitempty"`
	CreatedAt     time.Time  `json:"created_at"`
}

func ToQueueResponse(q Queue) QueueResponse {
	resp := QueueResponse{
		ID:          q.ID,
		PatientID:   q.PatientID,
		QueueNumber: q.QueueNumber,
		QueueDate:   q.QueueDate,
		Status:      q.Status,
		CreatedBy:   q.CreatedBy,
		DoctorID:    q.DoctorID,
		NurseID:     q.NurseID,
		CalledAt:    q.CalledAt,
		CompletedAt: q.CompletedAt,
		CreatedAt:   q.CreatedAt,
	}
	if q.Patient != nil && q.Patient.FullName != nil {
		resp.PatientName = *q.Patient.FullName
	}
	if q.Users != nil && q.Users.FullName != nil {
		resp.CreatedByName = *q.Users.FullName
	}
	return resp
}

func ToQueueResponses(list []Queue) []QueueResponse {
	res := make([]QueueResponse, len(list))
	for i, q := range list {
		res[i] = ToQueueResponse(q)
	}
	return res
}
