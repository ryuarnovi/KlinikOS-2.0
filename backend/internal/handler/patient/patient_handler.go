package patient

import (
	"database/sql"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	mpatient "github.com/ryuarno/klinikos/internal/model/patient"
	"github.com/ryuarno/klinikos/internal/utils"
)

type PatientHandler struct {
	DB *sql.DB
}

// Create patient
func (h *PatientHandler) CreatePatientHandler(c *gin.Context) {
	var input mpatient.CreatePatientInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if input.PatientCode == "" {
		input.PatientCode = "P" + strconv.FormatInt(time.Now().Unix(), 10)[5:]
	}
	if input.Status == "" {
		input.Status = "active"
	}

	var id int
	err := h.DB.QueryRow(
		`INSERT INTO patients 
        (patient_code, nik, full_name, date_of_birth, gender, address, phone, email, blood_type, allergies, emergency_contact, emergency_phone, is_walkin, status, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW()) RETURNING id`,
		input.PatientCode, input.Nik, input.FullName, input.DateOfBirth.Time(), input.Gender, input.Address, input.Phone, input.Email,
		input.BloodType, input.Allergies, input.EmergencyContact, input.EmergencyPhone, input.IsWalkin, input.Status,
	).Scan(&id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create patient: " + err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "Patient created", "data": id})
}

// Update patient
func (h *PatientHandler) UpdatePatientHandler(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid patient ID"})
		return
	}
	var input mpatient.UpdatePatientInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Map field ke value
	fields := map[string]interface{}{
		"full_name":         input.FullName,
		"date_of_birth":     input.DateOfBirth,
		"gender":            input.Gender,
		"address":           input.Address,
		"phone":             input.Phone,
		"email":             input.Email,
		"blood_type":        input.BloodType,
		"allergies":         input.Allergies,
		"emergency_contact": input.EmergencyContact,
		"emergency_phone":   input.EmergencyPhone,
		"is_walkin":         input.IsWalkin,
		"status":            input.Status,
	}

	set := []string{}
	args := []interface{}{}
	idx := 1
	for col, val := range fields {
		// pointer dan tidak nil
		switch v := val.(type) {
		case *string:
			if v != nil {
				set = append(set, fmt.Sprintf("%s = $%d", col, idx))
				args = append(args, *v)
				idx++
			}
		case *mpatient.Date:
			if v != nil {
				set = append(set, fmt.Sprintf("%s = $%d", col, idx))
				args = append(args, v.Time())
				idx++
			}
		case *bool:
			if v != nil {
				set = append(set, fmt.Sprintf("%s = $%d", col, idx))
				args = append(args, *v)
				idx++
			}
		}
	}
	set = append(set, fmt.Sprintf("updated_at = $%d", idx))
	args = append(args, time.Now())
	idx++

	if len(set) == 1 { // hanya updated_at
		c.JSON(http.StatusBadRequest, gin.H{"error": "No data to update"})
		return
	}

	query := "UPDATE patients SET " + joinComma(set) + fmt.Sprintf(" WHERE id = $%d", idx)
	args = append(args, id)

	_, err = h.DB.Exec(query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update patient"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Patient updated"})
}

// Delete patient
func (h *PatientHandler) DeletePatientHandler(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid patient ID"})
		return
	}
	_, err = h.DB.Exec("DELETE FROM patients WHERE id = $1", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete patient"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Patient deleted"})
}

// Get patient by ID
func (h *PatientHandler) GetPatientHandler(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid patient ID"})
		return
	}
	var p mpatient.Patient
	err = h.DB.QueryRow(
		`SELECT id, patient_code, nik, full_name, date_of_birth, gender, address, phone, email, blood_type, allergies, emergency_contact, emergency_phone, is_walkin, status, created_at, updated_at
        FROM patients WHERE id = $1`, id).
		Scan(&p.ID, &p.PatientCode, &p.Nik, &p.FullName, &p.DateOfBirth, &p.Gender, &p.Address, &p.Phone, &p.Email, &p.BloodType, &p.Allergies, &p.EmergencyContact, &p.EmergencyPhone, &p.IsWalkin, &p.Status, &p.CreatedAt, &p.UpdatedAt)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Patient not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": mpatient.ToPatientResponse(p)})
}

// List all patients (dengan filtering per role)
func (h *PatientHandler) ListPatientsHandler(c *gin.Context) {
	userID := utils.GetUserIDFromContext(c)
	role := strings.ToLower(utils.GetUserRoleFromContext(c))

	query := `SELECT DISTINCT p.id, p.patient_code, p.nik, p.full_name, p.date_of_birth, p.gender, p.address, p.phone, p.email, p.blood_type, p.allergies, p.emergency_contact, p.emergency_phone, p.is_walkin, p.status, p.created_at, p.updated_at 
	          FROM patients p`
	
	args := []interface{}{}
	if role == "dokter" {
		query += ` LEFT JOIN queues q ON p.id = q.patient_id 
		           LEFT JOIN medical_records mr ON p.id = mr.patient_id
		           WHERE q.doctor_id = $1 OR mr.doctor_id = $1`
		args = append(args, userID)
	} else if role == "perawat" {
		query += ` JOIN queues q ON p.id = q.patient_id 
		           WHERE q.nurse_id = $1`
		args = append(args, userID)
	}

	rows, err := h.DB.Query(query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get patients: " + err.Error()})
		return
	}
	defer rows.Close()
	var patients []mpatient.Patient
	for rows.Next() {
		var p mpatient.Patient
		if err := rows.Scan(&p.ID, &p.PatientCode, &p.Nik, &p.FullName, &p.DateOfBirth, &p.Gender, &p.Address, &p.Phone, &p.Email, &p.BloodType, &p.Allergies, &p.EmergencyContact, &p.EmergencyPhone, &p.IsWalkin, &p.Status, &p.CreatedAt, &p.UpdatedAt); err == nil {
			patients = append(patients, p)
		}
	}
	c.JSON(http.StatusOK, gin.H{"data": mpatient.ToPatientResponses(patients)})
}

// List patient payments (history by patient_id)
func (h *PatientHandler) ListPatientPaymentsHandler(c *gin.Context) {
	patientID := c.Query("patient_id")
	query := `SELECT p.id, p.payment_code, p.total_amount, p.payment_date, p.payment_method, p.status, pt.full_name, pt.patient_code
    FROM payments p
    JOIN patients pt ON p.patient_id = pt.id
    WHERE 1=1`
	var args []interface{}
	if patientID != "" {
		query += fmt.Sprintf(" AND p.patient_id = $%d", len(args)+1)
		args = append(args, patientID)
	}
	rows, err := h.DB.Query(query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get payments"})
		return
	}
	defer rows.Close()
	type PaymentHistory struct {
		ID            int64   `json:"id"`
		InvoiceNumber string  `json:"invoice_number"`
		Total         float64 `json:"total"`
		CreatedAt     string  `json:"created_at"`
		Method        string  `json:"payment_method"`
		Status        string  `json:"status"`
		PatientName   string  `json:"patient_name"`
		PatientCode   string  `json:"patient_code"`
	}
	var payments []PaymentHistory
	for rows.Next() {
		var p PaymentHistory
		var paymentDate sql.NullTime
		if err := rows.Scan(&p.ID, &p.InvoiceNumber, &p.Total, &paymentDate, &p.Method, &p.Status, &p.PatientName, &p.PatientCode); err == nil {
			if paymentDate.Valid {
				p.CreatedAt = paymentDate.Time.Format("2006-01-02 15:04:05")
			}
			payments = append(payments, p)
		}
	}
	c.JSON(http.StatusOK, gin.H{"data": payments})
}

func joinComma(s []string) string {
	return strings.Join(s, ", ")
}
