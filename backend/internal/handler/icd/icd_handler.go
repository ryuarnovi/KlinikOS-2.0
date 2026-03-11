package icd

import (
	"database/sql"
	"net/http"

	"github.com/gin-gonic/gin"
	micd "github.com/ryuarno/klinikos/internal/model/icd"
)

type ICDHandler struct {
	DB *sql.DB
}

// SearchICD10Handler searches for diagnosis codes
func (h *ICDHandler) SearchICD10Handler(c *gin.Context) {
	query := c.Query("q")
	if query == "" {
		c.JSON(http.StatusOK, gin.H{"data": []micd.ICD10{}})
		return
	}

	rows, err := h.DB.Query(`
		SELECT id, code, description_en, description_id, is_active 
		FROM icd10 
		WHERE code ILIKE $1 OR description_id ILIKE $1 OR description_en ILIKE $1 
		LIMIT 20`, "%"+query+"%")
	
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to search ICD-10"})
		return
	}
	defer rows.Close()

	var results []micd.ICD10
	for rows.Next() {
		var item micd.ICD10
		if err := rows.Scan(&item.ID, &item.Code, &item.DescriptionEN, &item.DescriptionID, &item.IsActive); err != nil {
			continue
		}
		results = append(results, item)
	}

	c.JSON(http.StatusOK, gin.H{"data": results})
}

// SearchICD9CMHandler searches for procedure codes
func (h *ICDHandler) SearchICD9CMHandler(c *gin.Context) {
	query := c.Query("q")
	if query == "" {
		c.JSON(http.StatusOK, gin.H{"data": []micd.ICD9CM{}})
		return
	}

	rows, err := h.DB.Query(`
		SELECT id, code, description_en, description_id, is_active 
		FROM icd9cm 
		WHERE code ILIKE $1 OR description_id ILIKE $1 OR description_en ILIKE $1 
		LIMIT 20`, "%"+query+"%")
	
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to search ICD-9 CM"})
		return
	}
	defer rows.Close()

	var results []micd.ICD9CM
	for rows.Next() {
		var item micd.ICD9CM
		if err := rows.Scan(&item.ID, &item.Code, &item.DescriptionEN, &item.DescriptionID, &item.IsActive); err != nil {
			continue
		}
		results = append(results, item)
	}

	c.JSON(http.StatusOK, gin.H{"data": results})
}
