package patient

import (
	"database/sql"
	"fmt"
	"net/http"
	"reflect"
	"time"

	"github.com/gin-gonic/gin"
	mpatient "github.com/ryuarno/klinikos/internal/model/patient"
)

type ReferralHandler struct {
	DB *sql.DB
}

// CreateReferralHandler creates a new patient referral
func (h *ReferralHandler) CreateReferralHandler(c *gin.Context) {
	var input mpatient.CreateReferralInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	dateStr := input.ReferralDate
	if dateStr == "" {
		dateStr = time.Now().Format("2006-01-02")
	}

	date, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid referral_date format (YYYY-MM-DD)"})
		return
	}

	query := `INSERT INTO referrals (patient_id, medical_record_id, doctor_id, referral_to, referral_date, diagnosis, notes, status, created_at, updated_at) 
		VALUES ($1, $2, $3, $4, $5, $6, $7, 'active', NOW(), NOW()) RETURNING id`

	var id int
	err = h.DB.QueryRow(query, input.PatientID, input.MedicalRecordID, input.DoctorID, input.ReferralTo, date, input.Diagnosis, input.Notes).Scan(&id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create referral: " + err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Referral created", "data": id})
}

// ListReferralsHandler returns all referrals
func (h *ReferralHandler) ListReferralsHandler(c *gin.Context) {
	rows, err := h.DB.Query(`
		SELECT r.id, r.patient_id, r.medical_record_id, r.doctor_id, r.referral_to, r.referral_date, r.diagnosis, r.notes, r.status, r.created_at, r.updated_at,
		       p.full_name, u.full_name
		FROM referrals r
		JOIN patients p ON r.patient_id = p.id
		JOIN users u ON r.doctor_id = u.id
		ORDER BY r.created_at DESC`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch referrals"})
		return
	}
	defer rows.Close()

	var referrals []mpatient.Referral
	for rows.Next() {
		var r mpatient.Referral
		err := rows.Scan(
			&r.ID, &r.PatientID, &r.MedicalRecordID, &r.DoctorID, &r.ReferralTo, &r.ReferralDate, &r.Diagnosis, &r.Notes, &r.Status, &r.CreatedAt, &r.UpdatedAt,
			&r.PatientName, &r.DoctorName,
		)
		if err == nil {
			referrals = append(referrals, r)
		}
	}
	c.JSON(http.StatusOK, gin.H{"data": referrals})
}

// UpdateReferralHandler updates referral detail
func (h *ReferralHandler) UpdateReferralHandler(c *gin.Context) {
	id := c.Param("id")
	var input mpatient.UpdateReferralInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	val := reflect.ValueOf(input)
	typ := reflect.TypeOf(input)
	set := []string{}
	args := []interface{}{}
	idx := 1

	for i := 0; i < val.NumField(); i++ {
		field := val.Field(i)
		fieldType := typ.Field(i)
		dbTag := fieldType.Tag.Get("db")
		if dbTag == "" || dbTag == "-" {
			continue
		}

		if field.Kind() == reflect.Ptr && !field.IsNil() {
			set = append(set, fmt.Sprintf("%s = $%d", dbTag, idx))
			args = append(args, field.Elem().Interface())
			idx++
		}
	}

	if len(set) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No data to update"})
		return
	}

	query := "UPDATE referrals SET " + joinComma(set) + ", updated_at = NOW() WHERE id = $" + fmt.Sprintf("%d", idx)
	args = append(args, id)

	_, err := h.DB.Exec(query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update referral"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Referral updated"})
}

// DeleteReferralHandler deletes a referral
func (h *ReferralHandler) DeleteReferralHandler(c *gin.Context) {
	id := c.Param("id")
	_, err := h.DB.Exec("DELETE FROM referrals WHERE id = $1", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete referral"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Referral deleted"})
}
