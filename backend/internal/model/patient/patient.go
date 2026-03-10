package patient

import (
	"database/sql/driver"
	"fmt"
	"strings"
	"time"
)

type Date time.Time

func (d *Date) UnmarshalJSON(b []byte) error {
	s := strings.Trim(string(b), "\"")
	if s == "" || s == "null" {
		return nil
	}
	t, err := time.Parse("2006-01-02", s)
	if err != nil {
		// Fallback to RFC3339 if possible
		t, err = time.Parse(time.RFC3339, s)
		if err != nil {
			return err
		}
	}
	*d = Date(t)
	return nil
}

func (d Date) MarshalJSON() ([]byte, error) {
	return []byte(fmt.Sprintf("\"%s\"", time.Time(d).Format("2006-01-02"))), nil
}

func (d Date) Value() (driver.Value, error) {
	t := time.Time(d)
	if t.IsZero() {
		return nil, nil
	}
	return t, nil
}

func (d *Date) Scan(value interface{}) error {
	if value == nil {
		*d = Date(time.Time{})
		return nil
	}
	t, ok := value.(time.Time)
	if !ok {
		return fmt.Errorf("could not scan type %T into Date", value)
	}
	*d = Date(t)
	return nil
}

func (d Date) Time() time.Time {
	return time.Time(d)
}

type Patient struct {
	ID               int       `json:"id" db:"id"`
	PatientCode      string    `json:"patient_code" db:"patient_code"`
	Nik              string    `json:"nik" db:"nik"`
	FullName         string    `json:"full_name" db:"full_name"`
	DateOfBirth      Date      `json:"date_of_birth" db:"date_of_birth"`
	Gender           string    `json:"gender" db:"gender"`
	Address          *string   `json:"address,omitempty" db:"address"`
	Phone            *string   `json:"phone,omitempty" db:"phone"`
	Email            *string   `json:"email,omitempty" db:"email"`
	BloodType        *string   `json:"blood_type,omitempty" db:"blood_type"`
	Allergies        *string   `json:"allergies,omitempty" db:"allergies"`
	EmergencyContact *string   `json:"emergency_contact,omitempty" db:"emergency_contact"`
	EmergencyPhone   *string   `json:"emergency_phone,omitempty" db:"emergency_phone"`
	IsWalkin         bool      `json:"is_walkin" db:"is_walkin"`
	Status           string    `json:"status" db:"status"`
	CreatedAt        time.Time `json:"created_at" db:"created_at"`
	UpdatedAt        time.Time `json:"updated_at" db:"updated_at"`
}

type CreatePatientInput struct {
	PatientCode      string    `json:"patient_code"`
	Nik              string    `json:"nik" binding:"required"`
	FullName         string    `json:"full_name" binding:"required"`
	DateOfBirth      Date      `json:"date_of_birth" binding:"required"`
	Gender           string    `json:"gender" binding:"required"`
	Address          *string   `json:"address"`
	Phone            *string   `json:"phone"`
	Email            *string   `json:"email"`
	BloodType        *string   `json:"blood_type"`
	Allergies        *string   `json:"allergies"`
	EmergencyContact *string   `json:"emergency_contact"`
	EmergencyPhone   *string   `json:"emergency_phone"`
	IsWalkin         bool      `json:"is_walkin"`
	Status           string    `json:"status"`
}

type UpdatePatientInput struct {
	FullName         *string    `json:"full_name"`
	DateOfBirth      *Date      `json:"date_of_birth"`
	Gender           *string    `json:"gender"`
	Address          *string    `json:"address"`
	Phone            *string    `json:"phone"`
	Email            *string    `json:"email"`
	BloodType        *string    `json:"blood_type"`
	Allergies        *string    `json:"allergies"`
	EmergencyContact *string    `json:"emergency_contact"`
	EmergencyPhone   *string    `json:"emergency_phone"`
	IsWalkin         *bool      `json:"is_walkin"`
	Status           *string    `json:"status"`
}

type PatientResponse struct {
	ID               int       `json:"id"`
	PatientCode      string    `json:"patient_code"`
	Nik              string    `json:"nik"`
	FullName         string    `json:"full_name"`
	DateOfBirth      Date      `json:"date_of_birth"`
	Gender           string    `json:"gender"`
	Address          *string   `json:"address,omitempty"`
	Phone            *string   `json:"phone,omitempty"`
	Email            *string   `json:"email,omitempty"`
	BloodType        *string   `json:"blood_type,omitempty"`
	Allergies        *string   `json:"allergies,omitempty"`
	EmergencyContact *string   `json:"emergency_contact,omitempty"`
	EmergencyPhone   *string   `json:"emergency_phone,omitempty"`
	IsWalkin         bool      `json:"is_walkin"`
	Status           string    `json:"status"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}

func ToPatientResponse(p Patient) PatientResponse {
	return PatientResponse{
		ID:               p.ID,
		PatientCode:      p.PatientCode,
		Nik:              p.Nik,
		FullName:         p.FullName,
		DateOfBirth:      p.DateOfBirth,
		Gender:           p.Gender,
		Address:          p.Address,
		Phone:            p.Phone,
		Email:            p.Email,
		BloodType:        p.BloodType,
		Allergies:        p.Allergies,
		EmergencyContact: p.EmergencyContact,
		EmergencyPhone:   p.EmergencyPhone,
		IsWalkin:         p.IsWalkin,
		Status:           p.Status,
		CreatedAt:        p.CreatedAt,
		UpdatedAt:        p.UpdatedAt,
	}
}

func ToPatientResponses(patients []Patient) []PatientResponse {
	responses := make([]PatientResponse, len(patients))
	for i, p := range patients {
		responses[i] = ToPatientResponse(p)
	}
	return responses
}
