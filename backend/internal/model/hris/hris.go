package hris

import (
	"time"
)

type DoctorSchedule struct {
	ID         int       `json:"id" db:"id"`
	DoctorID   int       `json:"doctor_id" db:"doctor_id"`
	DoctorName string    `json:"doctor_name,omitempty" db:"doctor_name"`
	DayOfWeek  int       `json:"day_of_week" db:"day_of_week"` // 0-6
	StartTime  string    `json:"start_time" db:"start_time"`
	EndTime    string    `json:"end_time" db:"end_time"`
	Quota      int       `json:"quota" db:"quota"`
	IsActive   bool      `json:"is_active" db:"is_active"`
	CreatedAt  time.Time `json:"created_at" db:"created_at"`
	UpdatedAt  time.Time `json:"updated_at" db:"updated_at"`
}

type CreateScheduleInput struct {
	DoctorID  int    `json:"doctor_id" binding:"required"`
	DayOfWeek int    `json:"day_of_week" binding:"required,min=0,max=6"`
	StartTime string `json:"start_time" binding:"required"` // HH:MM
	EndTime   string `json:"end_time" binding:"required"`   // HH:MM
	Quota     int    `json:"quota" binding:"required,min=1"`
}

type StaffShift struct {
	ID        int       `json:"id" db:"id"`
	StaffID   int       `json:"staff_id" db:"staff_id"`
	StaffName string    `json:"staff_name,omitempty" db:"staff_name"`
	ShiftDate string    `json:"shift_date" db:"shift_date"`
	ShiftType string    `json:"shift_type" db:"shift_type"` // morning, afternoon, night
	StartTime string    `json:"start_time" db:"start_time"`
	EndTime   string    `json:"end_time" db:"end_time"`
	Notes     string    `json:"notes" db:"notes"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
}

type CreateShiftInput struct {
	StaffID   int    `json:"staff_id" binding:"required"`
	ShiftDate string `json:"shift_date" binding:"required"` // YYYY-MM-DD
	ShiftType string `json:"shift_type" binding:"required"`
	StartTime string `json:"start_time"`
	EndTime   string `json:"end_time"`
	Notes     string `json:"notes"`
}
