package patient

import (
	"database/sql"
	"fmt"
	"net/http"
	"reflect"
	"time"

	"github.com/gin-gonic/gin"
	mpatient "github.com/ryuarno/klinikos/internal/model/patient"
	"github.com/ryuarno/klinikos/internal/utils"
)

type PrescriptionHandler struct {
	DB     *sql.DB
	Logger *utils.ActivityLogger
}

// Handler untuk membuat resep baru
func (h *PrescriptionHandler) CreatePrescriptionHandler(c *gin.Context) {
	var input mpatient.CreatePrescriptionInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if input.PrescriptionCode == "" {
		input.PrescriptionCode = "RX" + fmt.Sprintf("%d", time.Now().Unix())[4:]
	}

	tx, err := h.DB.Begin()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to start transaction"})
		return
	}

	var medRecID sql.NullInt64
	if input.MedicalRecordID != nil {
		medRecID.Int64 = int64(*input.MedicalRecordID)
		medRecID.Valid = true
	}

	query := `INSERT INTO prescriptions 
        (prescription_code, medical_record_id, patient_id, doctor_id, notes, prescription_date, status)
        VALUES ($1, $2, $3, $4, $5, NOW(), 'pending') RETURNING id`
	var prescriptionID int
	err = tx.QueryRow(query,
		input.PrescriptionCode,
		medRecID,
		input.PatientID,
		input.DoctorID,
		input.Notes,
	).Scan(&prescriptionID)
	if err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create prescription: " + err.Error()})
		return
	}

	for _, item := range input.Items {
		_, err = tx.Exec(`INSERT INTO prescription_items (prescription_id, drug_id, quantity, dosage_instruction) VALUES ($1, $2, $3, $4)`,
			prescriptionID, item.DrugID, item.Quantity, item.Dosage)
		if err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create prescription item: " + err.Error()})
			return
		}
	}

	if err := tx.Commit(); err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to commit transaction"})
		return
	}

	// Dynamic Activity Log
	userID := utils.GetUserIDFromContext(c)
	h.Logger.Log(c, userID, "CREATE", "prescriptions", prescriptionID, fmt.Sprintf("Membuat resep baru %s", input.PrescriptionCode))

	c.JSON(http.StatusCreated, gin.H{"message": "Prescription created", "data": prescriptionID})
}

// Handler untuk list semua resep
func (h *PrescriptionHandler) ListPrescriptionsHandler(c *gin.Context) {
	rows, err := h.DB.Query(
		`SELECT id, prescription_code, medical_record_id, patient_id, doctor_id, prescription_date, status, notes, processed_by, processed_at, dispensed_at
         FROM prescriptions ORDER BY prescription_date DESC`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch prescriptions"})
		return
	}
	defer rows.Close()

	var prescriptions []mpatient.Prescription
	for rows.Next() {
		var p mpatient.Prescription
		err := rows.Scan(
			&p.ID, &p.PrescriptionCode, &p.MedicalRecordID, &p.PatientID, &p.DoctorID,
			&p.PrescriptionDate, &p.Status, &p.Notes, &p.ProcessedBy, &p.ProcessedAt, &p.DispensedAt,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to scan prescription"})
			return
		}

		// Fetch patient & doctor name for convenience
		var pName, dName sql.NullString
		h.DB.QueryRow("SELECT full_name FROM patients WHERE id = $1", p.PatientID).Scan(&pName)
		h.DB.QueryRow("SELECT full_name FROM users WHERE id = $1", p.DoctorID).Scan(&dName)
		if pName.Valid {
			p.Patient = &mpatient.PatientFK{ID: p.PatientID, FullName: &pName.String}
		}
		if dName.Valid {
			p.Doctor = &mpatient.DoctorFK{ID: p.DoctorID, FullName: &dName.String}
		}

		// Fetch Items
		itemRows, _ := h.DB.Query(`
			SELECT pi.id, pi.drug_id, d.nama_obat, pi.quantity, pi.dosage_instruction, d.unit
			FROM prescription_items pi
			JOIN drugs d ON pi.drug_id = d.id
			WHERE pi.prescription_id = $1`, p.ID)
		if itemRows != nil {
			for itemRows.Next() {
				var item mpatient.PrescriptionItemFK
				itemRows.Scan(&item.ID, &item.DrugID, &item.DrugName, &item.Quantity, &item.Dosage, &item.Unit)
				p.Items = append(p.Items, item)
			}
			itemRows.Close()
		}

		prescriptions = append(prescriptions, p)
	}
	c.JSON(http.StatusOK, gin.H{"data": mpatient.ToPrescriptionResponses(prescriptions)})
}

// Handler untuk update prescription (tanpa banyak if)
func (h *PrescriptionHandler) UpdatePrescriptionHandler(c *gin.Context) {
	id := c.Param("id")
	var input mpatient.UpdatePrescriptionInput
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
		// Hanya update jika pointer dan tidak nil
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

	query := "UPDATE prescriptions SET " + joinComma(set) + fmt.Sprintf(" WHERE id = $%d", idx)
	args = append(args, id)

	_, err := h.DB.Exec(query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update prescription"})
		return
	}

	// Dynamic Activity Log
	userID := utils.GetUserIDFromContext(c)
	h.Logger.Log(c, userID, "UPDATE", "prescriptions", 0, fmt.Sprintf("Memperbarui resep ID %s", id))

	c.JSON(http.StatusOK, gin.H{"message": "Prescription updated"})
}

// Handler untuk delete prescription
func (h *PrescriptionHandler) DeletePrescriptionHandler(c *gin.Context) {
	id := c.Param("id")
	_, err := h.DB.Exec("DELETE FROM prescriptions WHERE id = $1", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete prescription"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Prescription deleted"})
}

