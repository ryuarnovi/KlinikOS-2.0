package patient

import (
	"database/sql"
	"net/http"

	"github.com/gin-gonic/gin"
)

func NewPrescriptionItemHandler(db *sql.DB) *PrescriptionItemHandler {
	return &PrescriptionItemHandler{DB: db}
}

type PrescriptionItemHandler struct {
	DB *sql.DB
}

// Handler untuk membuat PrescriptionItem
func (h *PrescriptionItemHandler) CreatePrescriptionItemHandler(c *gin.Context) {
	var input struct {
		PrescriptionID int    `json:"prescription_id" binding:"required"`
		DrugID         int    `json:"drug_id" binding:"required"`
		Quantity       int    `json:"quantity" binding:"required"`
		Dosage         string `json:"dosage_instruction"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	query := `INSERT INTO prescription_items (prescription_id, drug_id, quantity, dosage_instruction)
        VALUES ($1, $2, $3, $4) RETURNING id`
	var id int
	err := h.DB.QueryRow(query, input.PrescriptionID, input.DrugID, input.Quantity, input.Dosage).Scan(&id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create prescription item: " + err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "Prescription item created", "data": id})
}

// Handler untuk listing PrescriptionItems
func (h *PrescriptionItemHandler) ListPrescriptionItemsHandler(c *gin.Context) {
	rows, err := h.DB.Query(`
        SELECT pi.id, pi.prescription_id, pi.drug_id, d.nama_obat, pi.quantity, pi.dosage_instruction
        FROM prescription_items pi
        JOIN drugs d ON pi.drug_id = d.id
        ORDER BY pi.id DESC
    `)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch prescription items"})
		return
	}
	defer rows.Close()

	var items []gin.H
	for rows.Next() {
		var id, prescriptionID, drugID, quantity int
		var drugName, dosage string
		if err := rows.Scan(&id, &prescriptionID, &drugID, &drugName, &quantity, &dosage); err != nil {
			continue
		}
		items = append(items, gin.H{
			"id":                 id,
			"prescription_id":    prescriptionID,
			"drug_id":            drugID,
			"drug_name":          drugName,
			"qty":                quantity,
			"dosage_instruction": dosage,
		})
	}
	c.JSON(http.StatusOK, gin.H{"data": items})
}
