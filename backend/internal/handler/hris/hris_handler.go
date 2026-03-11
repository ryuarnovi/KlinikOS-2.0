package hris

import (
	"database/sql"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	mhris "github.com/ryuarno/klinikos/internal/model/hris"
	"github.com/ryuarno/klinikos/internal/utils"
)

type HRISHandler struct {
	DB *sql.DB
}

// -- Schedules --

func (h *HRISHandler) ListSchedulesHandler(c *gin.Context) {
	doctorID := c.Query("doctor_id")
	userID := utils.GetUserIDFromContext(c)
	role := strings.ToLower(utils.GetUserRoleFromContext(c))

	query := `SELECT s.id, s.doctor_id, u.full_name as doctor_name, s.day_of_week, 
	          TO_CHAR(s.start_time, 'HH24:MI') as start_time, 
	          TO_CHAR(s.end_time, 'HH24:MI') as end_time, 
	          s.quota, s.is_active 
	          FROM doctor_schedules s
	          JOIN users u ON s.doctor_id = u.id
	          WHERE 1=1`
	
	args := []interface{}{}
	if role == "dokter" {
		query += " AND s.doctor_id = $1"
		args = append(args, userID)
	} else if doctorID != "" {
		query += " AND s.doctor_id = $1"
		args = append(args, doctorID)
	}

	rows, err := h.DB.Query(query, args...)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var schedules []mhris.DoctorSchedule
	for rows.Next() {
		var s mhris.DoctorSchedule
		if err := rows.Scan(&s.ID, &s.DoctorID, &s.DoctorName, &s.DayOfWeek, &s.StartTime, &s.EndTime, &s.Quota, &s.IsActive); err != nil {
			continue
		}
		schedules = append(schedules, s)
	}
	c.JSON(http.StatusOK, gin.H{"data": schedules})
}

func (h *HRISHandler) CreateScheduleHandler(c *gin.Context) {
	var input mhris.CreateScheduleInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	query := `INSERT INTO doctor_schedules (doctor_id, day_of_week, start_time, end_time, quota, is_active) 
	          VALUES ($1, $2, $3, $4, $5, true) RETURNING id`
	
	var id int
	err := h.DB.QueryRow(query, input.DoctorID, input.DayOfWeek, input.StartTime, input.EndTime, input.Quota).Scan(&id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"data": id})
}

func (h *HRISHandler) UpdateScheduleHandler(c *gin.Context) {
	id := c.Param("id")
	var input mhris.CreateScheduleInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	query := `UPDATE doctor_schedules SET doctor_id = $1, day_of_week = $2, start_time = $3, end_time = $4, quota = $5 
	          WHERE id = $6`
	
	_, err := h.DB.Exec(query, input.DoctorID, input.DayOfWeek, input.StartTime, input.EndTime, input.Quota, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Schedule updated"})
}

func (h *HRISHandler) DeleteScheduleHandler(c *gin.Context) {
	id := c.Param("id")
	_, err := h.DB.Exec("DELETE FROM doctor_schedules WHERE id = $1", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Schedule deleted"})
}

// -- Shifts --

func (h *HRISHandler) ListShiftsHandler(c *gin.Context) {
	date := c.Query("date")
	userID := utils.GetUserIDFromContext(c)
	role := strings.ToLower(utils.GetUserRoleFromContext(c))

	query := `SELECT s.id, s.staff_id, u.full_name as staff_name, s.shift_date, s.shift_type, 
	          TO_CHAR(s.start_time, 'HH24:MI') as start_time, 
	          TO_CHAR(s.end_time, 'HH24:MI') as end_time, 
	          s.notes 
	          FROM staff_shifts s
	          JOIN users u ON s.staff_id = u.id
	          WHERE 1=1`
	
	args := []interface{}{}
	if role != "admin" && role != "pasien" && role != "dokter" {
		query += " AND s.staff_id = $1"
		args = append(args, userID)
	} else if date != "" {
		query += " AND s.shift_date = $1"
		args = append(args, date)
	}

	rows, err := h.DB.Query(query, args...)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var shifts []mhris.StaffShift
	for rows.Next() {
		var s mhris.StaffShift
		if err := rows.Scan(&s.ID, &s.StaffID, &s.StaffName, &s.ShiftDate, &s.ShiftType, &s.StartTime, &s.EndTime, &s.Notes); err != nil {
			continue
		}
		shifts = append(shifts, s)
	}
	c.JSON(http.StatusOK, gin.H{"data": shifts})
}

func (h *HRISHandler) CreateShiftHandler(c *gin.Context) {
	var input mhris.CreateShiftInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	query := `INSERT INTO staff_shifts (staff_id, shift_date, shift_type, start_time, end_time, notes) 
	          VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`
	
	var id int
	err := h.DB.QueryRow(query, input.StaffID, input.ShiftDate, input.ShiftType, input.StartTime, input.EndTime, input.Notes).Scan(&id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"data": id})
}

func (h *HRISHandler) UpdateShiftHandler(c *gin.Context) {
	id := c.Param("id")
	var input mhris.CreateShiftInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	query := `UPDATE staff_shifts SET staff_id = $1, shift_date = $2, shift_type = $3, start_time = $4, end_time = $5, notes = $6 
	          WHERE id = $7`
	
	_, err := h.DB.Exec(query, input.StaffID, input.ShiftDate, input.ShiftType, input.StartTime, input.EndTime, input.Notes, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Shift updated"})
}

func (h *HRISHandler) DeleteShiftHandler(c *gin.Context) {
	id := c.Param("id")
	_, err := h.DB.Exec("DELETE FROM staff_shifts WHERE id = $1", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Shift deleted"})
}
