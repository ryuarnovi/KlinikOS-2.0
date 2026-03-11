package patient

import (
	"database/sql"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	mpatient "github.com/ryuarno/klinikos/internal/model/patient"
	"github.com/ryuarno/klinikos/internal/utils"
)

type MedicalRecordHandler struct {
	DB     *sql.DB
	Logger *utils.ActivityLogger
}

func (h *MedicalRecordHandler) CreateMedicalRecordHandler(c *gin.Context) {
	var input mpatient.CreateMedicalRecordInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var visitDate time.Time
	var err error
	if input.VisitDate == "" {
		visitDate = time.Now()
	} else {
		visitDate, err = time.Parse("2006-01-02", input.VisitDate)
		if err != nil {
			// Try timestamp format if date fails
			visitDate, err = time.Parse("2006-01-02 15:04:05", input.VisitDate)
			if err != nil {
				visitDate = time.Now() // default to now if invalid
			}
		}
	}

	var queueID sql.NullInt64
	if input.QueueID > 0 {
		queueID.Int64 = int64(input.QueueID)
		queueID.Valid = true
	}

	var id int
	err = h.DB.QueryRow(
		`INSERT INTO medical_records 
		(patient_id, queue_id, doctor_id, visit_date, subjective, objective, assessment, plan, vital_signs, icd_code, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW()) RETURNING id`,
		input.PatientID, queueID, input.DoctorID, visitDate, input.Subjective, input.Objective, input.Assessment, input.Plan, input.VitalSigns, input.IcdCode).Scan(&id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create medical record: " + err.Error()})
		return
	}

	// Dynamic Activity Log
	userID := utils.GetUserIDFromContext(c)
	h.Logger.Log(c, userID, "CREATE", "medical_records", id, fmt.Sprintf("Membuat rekam medis baru untuk pasien ID %d", input.PatientID))

	c.JSON(http.StatusCreated, gin.H{"message": "Medical record created", "data": id})
}

func (h *MedicalRecordHandler) UpdateMedicalRecordHandler(c *gin.Context) {
	id := c.Param("id")
	var input mpatient.UpdateMedicalRecordInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	set := []string{}
	args := []interface{}{}
	idx := 1
	if input.Subjective != nil {
		set = append(set, fmt.Sprintf("subjective = $%d", idx))
		args = append(args, *input.Subjective)
		idx++
	}
	if input.Objective != nil {
		set = append(set, fmt.Sprintf("objective = $%d", idx))
		args = append(args, *input.Objective)
		idx++
	}
	if input.Assessment != nil {
		set = append(set, fmt.Sprintf("assessment = $%d", idx))
		args = append(args, *input.Assessment)
		idx++
	}
	if input.Plan != nil {
		set = append(set, fmt.Sprintf("plan = $%d", idx))
		args = append(args, *input.Plan)
		idx++
	}
	if input.VitalSigns != nil {
		set = append(set, fmt.Sprintf("vital_signs = $%d", idx))
		args = append(args, *input.VitalSigns)
		idx++
	}
	if input.IcdCode != nil {
		set = append(set, fmt.Sprintf("icd_code = $%d", idx))
		args = append(args, *input.IcdCode)
		idx++
	}
	if len(set) > 0 {
		query := fmt.Sprintf(`UPDATE medical_records SET `+strings.Join(set, ", ")+`, updated_at = NOW() WHERE id = $%d`, idx)
		args = append(args, id)
		_, err := h.DB.Exec(query, args...)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update medical record"})
			return
		}
	}
	
	// Dynamic Activity Log
	userID := utils.GetUserIDFromContext(c)
	h.Logger.Log(c, userID, "UPDATE", "medical_records", 0, fmt.Sprintf("Memperbarui rekam medis ID %s", id))

	c.JSON(http.StatusOK, gin.H{"message": "Medical record updated"})
}

// List all medical records (with patient, queue, doctor relasi)
func (h *MedicalRecordHandler) ListMedicalRecordsHandler(c *gin.Context) {
	rows, err := h.DB.Query(`
        SELECT mr.id, mr.patient_id, mr.queue_id, mr.doctor_id, mr.visit_date, mr.subjective, mr.objective, mr.assessment, mr.plan, mr.vital_signs, mr.icd_code, mr.created_at, mr.updated_at,
               p.full_name, q.queue_number, q.queue_date, q.status, u.full_name
          FROM medical_records mr
          LEFT JOIN patients p ON mr.patient_id = p.id
          LEFT JOIN queues q ON mr.queue_id = q.id
          LEFT JOIN users u ON mr.doctor_id = u.id
        ORDER BY mr.visit_date DESC`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch medical records"})
		return
	}
	defer rows.Close()

	var records []mpatient.MedicalRecord
	for rows.Next() {
		var mr mpatient.MedicalRecord
		var patientName sql.NullString
		var queueNumber sql.NullString
		var queueDate sql.NullTime
		var queueStatus sql.NullString
		var doctorName sql.NullString

		err := rows.Scan(
			&mr.ID, &mr.PatientID, &mr.QueueID, &mr.DoctorID, &mr.VisitDate, &mr.Subjective, &mr.Objective, &mr.Assessment, &mr.Plan, &mr.VitalSigns, &mr.IcdCode, &mr.CreatedAt, &mr.UpdatedAt,
			&patientName, &queueNumber, &queueDate, &queueStatus, &doctorName,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to scan medical record"})
			return
		}
		mr.Patient = &mpatient.PatientFK{
			ID:       mr.PatientID,
			FullName: nil,
		}
		if patientName.Valid {
			mr.Patient.FullName = &patientName.String
		}
		mr.Queue = &mpatient.QueueFK{
			ID:          mr.QueueID,
			QueueNumber: "",
			QueueDate:   queueDate.Time,
			Status:      "",
		}
		if queueNumber.Valid {
			mr.Queue.QueueNumber = queueNumber.String
		}
		if queueStatus.Valid {
			mr.Queue.Status = queueStatus.String
		}
		mr.Doctor = &mpatient.DoctorFK{
			ID:       mr.DoctorID,
			FullName: nil,
		}
		if doctorName.Valid {
			mr.Doctor.FullName = &doctorName.String
		}
		records = append(records, mr)
	}
	c.JSON(http.StatusOK, gin.H{"data": mpatient.ToMedicalRecordResponses(records)})
}

// Get medical record by ID (with relasi)
func (h *MedicalRecordHandler) GetMedicalRecordHandler(c *gin.Context) {
	id := c.Param("id")
	var mr mpatient.MedicalRecord
	var patientName sql.NullString
	var queueNumber sql.NullString
	var queueDate sql.NullTime
	var queueStatus sql.NullString
	var doctorName sql.NullString

	err := h.DB.QueryRow(`
        SELECT mr.id, mr.patient_id, mr.queue_id, mr.doctor_id, mr.visit_date, mr.subjective, mr.objective, mr.assessment, mr.plan, mr.vital_signs, mr.icd_code, mr.created_at, mr.updated_at,
               p.full_name, q.queue_number, q.queue_date, q.status, u.full_name
          FROM medical_records mr
          LEFT JOIN patients p ON mr.patient_id = p.id
          LEFT JOIN queues q ON mr.queue_id = q.id
          LEFT JOIN users u ON mr.doctor_id = u.id
         WHERE mr.id = $1`, id).
		Scan(
			&mr.ID, &mr.PatientID, &mr.QueueID, &mr.DoctorID, &mr.VisitDate, &mr.Subjective, &mr.Objective, &mr.Assessment, &mr.Plan, &mr.VitalSigns, &mr.IcdCode, &mr.CreatedAt, &mr.UpdatedAt,
			&patientName, &queueNumber, &queueDate, &queueStatus, &doctorName,
		)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Medical record not found"})
		return
	}
	mr.Patient = &mpatient.PatientFK{
		ID:       mr.PatientID,
		FullName: nil,
	}
	if patientName.Valid {
		mr.Patient.FullName = &patientName.String
	}
	mr.Queue = &mpatient.QueueFK{
		ID:          mr.QueueID,
		QueueNumber: "",
		QueueDate:   queueDate.Time,
		Status:      "",
	}
	if queueNumber.Valid {
		mr.Queue.QueueNumber = queueNumber.String
	}
	if queueStatus.Valid {
		mr.Queue.Status = queueStatus.String
	}
	mr.Doctor = &mpatient.DoctorFK{
		ID:       mr.DoctorID,
		FullName: nil,
	}
	if doctorName.Valid {
		mr.Doctor.FullName = &doctorName.String
	}
	c.JSON(http.StatusOK, gin.H{"data": mpatient.ToMedicalRecordResponse(mr)})
}

func (h *MedicalRecordHandler) DeleteMedicalRecordHandler(c *gin.Context) {
	id := c.Param("id")
	_, err := h.DB.Exec("DELETE FROM medical_records WHERE id = $1", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete medical record"})
		return
	}

	// Dynamic Activity Log
	userID := utils.GetUserIDFromContext(c)
	h.Logger.Log(c, userID, "DELETE", "medical_records", 0, fmt.Sprintf("Menghapus rekam medis ID %s", id))

	c.JSON(http.StatusOK, gin.H{"message": "Medical record deleted"})
}
