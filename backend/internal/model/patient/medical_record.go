package patient

import "time"

// FK struct minimal (bisa ditambah field sesuai kebutuhan response)
type PatientFK struct {
	ID       int     `json:"id"`
	FullName *string `json:"full_name,omitempty"`
}

type QueueFK struct {
	ID          int       `json:"id"`
	QueueNumber string    `json:"queue_number"`
	QueueDate   time.Time `json:"queue_date"`
	Status      string    `json:"status"`
}

type DoctorFK struct {
	ID       int     `json:"id"`
	FullName *string `json:"full_name,omitempty"`
}

type CreateMedicalRecordInput struct {
	PatientID  int     `json:"patient_id" binding:"required"`
	QueueID    int     `json:"queue_id"`
	DoctorID   int     `json:"doctor_id" binding:"required"`
	VisitDate  string  `json:"visit_date"` // format: "2006-01-02"
	Subjective *string `json:"subjective"`
	Objective  *string `json:"objective"`
	Assessment *string `json:"assessment"`
	Plan       *string `json:"plan"`
	VitalSigns *string `json:"vital_signs"`
	IcdCode    *string `json:"icd_code"`
}

type UpdateMedicalRecordInput struct {
	VisitDate  *string `json:"visit_date,omitempty"` // format: "2006-01-02"
	Subjective *string `json:"subjective,omitempty"`
	Objective  *string `json:"objective,omitempty"`
	Assessment *string `json:"assessment,omitempty"`
	Plan       *string `json:"plan,omitempty"`
	VitalSigns *string `json:"vital_signs,omitempty"`
	IcdCode    *string `json:"icd_code,omitempty"`
}

type MedicalRecord struct {
	ID         int       `json:"id" db:"id"`
	PatientID  int       `json:"patient_id" db:"patient_id"`
	QueueID    int       `json:"queue_id" db:"queue_id"`
	DoctorID   int       `json:"doctor_id" db:"doctor_id"`
	VisitDate  time.Time `json:"visit_date" db:"visit_date"`
	Subjective *string   `json:"subjective,omitempty" db:"subjective"`
	Objective  *string   `json:"objective,omitempty" db:"objective"`
	Assessment *string   `json:"assessment,omitempty" db:"assessment"`
	Plan       *string   `json:"plan,omitempty" db:"plan"`
	VitalSigns *string   `json:"vital_signs,omitempty" db:"vital_signs"`
	IcdCode    *string   `json:"icd_code,omitempty" db:"icd_code"`
	CreatedAt  time.Time `json:"created_at" db:"created_at"`
	UpdatedAt  time.Time `json:"updated_at" db:"updated_at"`

	// FK relasi (opsional, untuk response join)
	Patient *PatientFK `json:"patient,omitempty"`
	Queue   *QueueFK   `json:"queue,omitempty"`
	Doctor  *DoctorFK  `json:"doctor,omitempty"`
}

type MedicalRecordResponse struct {
	ID         int        `json:"id"`
	PatientID  int        `json:"patient_id"`
	QueueID    int        `json:"queue_id"`
	DoctorID   int        `json:"doctor_id"`
	VisitDate  time.Time  `json:"visit_date"`
	Subjective *string    `json:"subjective,omitempty"`
	Objective  *string    `json:"objective,omitempty"`
	Assessment *string    `json:"assessment,omitempty"`
	Plan       *string    `json:"plan,omitempty"`
	VitalSigns *string    `json:"vital_signs,omitempty"`
	IcdCode    *string    `json:"icd_code,omitempty"`
	CreatedAt  time.Time  `json:"created_at"`
	UpdatedAt  time.Time  `json:"updated_at"`
	PatientName   string     `json:"patient_name,omitempty"`
	DoctorName    string     `json:"doctor_name,omitempty"`
	QueueNumber   string     `json:"queue_number,omitempty"`
	Status        string     `json:"status"` 
	Patient       *PatientFK `json:"patient,omitempty"`
	Queue         *QueueFK   `json:"queue,omitempty"`
	Doctor        *DoctorFK  `json:"doctor,omitempty"`
}

func ToMedicalRecordResponse(m MedicalRecord) MedicalRecordResponse {
	resp := MedicalRecordResponse{
		ID:         m.ID,
		PatientID:  m.PatientID,
		QueueID:    m.QueueID,
		DoctorID:   m.DoctorID,
		VisitDate:  m.VisitDate,
		Subjective: m.Subjective,
		Objective:  m.Objective,
		Assessment: m.Assessment,
		Plan:       m.Plan,
		VitalSigns: m.VitalSigns,
		IcdCode:    m.IcdCode,
		CreatedAt:  m.CreatedAt,
		UpdatedAt:  m.UpdatedAt,
		Patient:    m.Patient,
		Queue:      m.Queue,
		Doctor:     m.Doctor,
	}
	if m.Patient != nil && m.Patient.FullName != nil {
		resp.PatientName = *m.Patient.FullName
	}
	if m.Doctor != nil && m.Doctor.FullName != nil {
		resp.DoctorName = *m.Doctor.FullName
	}
	if m.Queue != nil {
		resp.QueueNumber = m.Queue.QueueNumber
		resp.Status = m.Queue.Status
	}
	return resp
}

type DeleteMedicalRecordInput struct {
	ID int `json:"id" binding:"required"`
}

func ToMedicalRecordResponses(list []MedicalRecord) []MedicalRecordResponse {
	res := make([]MedicalRecordResponse, len(list))
	for i, m := range list {
		res[i] = ToMedicalRecordResponse(m)
	}
	return res
}
