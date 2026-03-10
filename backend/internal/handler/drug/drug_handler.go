package drug

import (
	"database/sql"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	mdrug "github.com/ryuarno/klinikos/internal/model/drug"
)

type DrugHandler struct {
	DB *sql.DB
}

// -- Drug Handlers --

// CreateDrugHandler creates a new pharmacy item
func (h *DrugHandler) CreateDrugHandler(c *gin.Context) {
	var input mdrug.CreateDrugInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	query := `INSERT INTO drugs 
		(kode_obat, nama_obat, deskripsi, fungsi_obat, efek_samping, kategori_obat, merek_obat, dosis_obat, golongan_obat, bentuk_obat, unit, stok_obat, min_stock, harga_jual_eceran, harga_jual_grosir, expiry_date, created_at, updated_at) 
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW(), NOW()) 
		RETURNING id`

	var id int
	err := h.DB.QueryRow(query, input.Sku, input.Name, input.Description, input.Function, input.SideEffects, input.Category, input.Brand, input.Dosage, input.Group, input.Shape, input.Unit, input.Stock, input.MinStock, input.SellPrice, input.BuyPrice, input.ExpiryDate).Scan(&id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create drug: " + err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Drug created successfully", "data": id})
}

// GetDrugsHandler provides a list of drugs (usually for dropdowns or simple tables)
func (h *DrugHandler) GetDrugsHandler(c *gin.Context) {
	rows, err := h.DB.Query("SELECT id, kode_obat, nama_obat, deskripsi, unit, stok_obat, harga_jual_eceran FROM drugs")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch drugs"})
		return
	}
	defer rows.Close()

	var drugs []mdrug.Drug
	for rows.Next() {
		var d mdrug.Drug
		if err := rows.Scan(&d.ID, &d.Sku, &d.Name, &d.Description, &d.Unit, &d.Stock, &d.SellPrice); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to scan drug"})
			return
		}
		drugs = append(drugs, d)
	}
	c.JSON(http.StatusOK, gin.H{"data": drugs})
}

// UpdateDrugHandler updates drug details dynamically
func (h *DrugHandler) UpdateDrugHandler(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid drug ID"})
		return
	}

	var input mdrug.UpdateDrugInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Map field pointer to column name
	fields := map[string]interface{}{
		"kode_obat":         input.Sku,
		"nama_obat":         input.Name,
		"deskripsi":         input.Description,
		"fungsi_obat":       input.Function,
		"efek_samping":      input.SideEffects,
		"kategori_obat":     input.Category,
		"merek_obat":        input.Brand,
		"dosis_obat":        input.Dosage,
		"golongan_obat":     input.Group,
		"bentuk_obat":       input.Shape,
		"unit":              input.Unit,
		"stok_obat":         input.Stock,
		"min_stock":         input.MinStock,
		"harga_jual_eceran": input.SellPrice,
		"harga_jual_grosir": input.BuyPrice,
		"expiry_date":       input.ExpiryDate,
	}

	var setParts []string
	var args []interface{}
	idx := 1

	for col, val := range fields {
		if val != nil {
			// Get actual value from pointer
			var value interface{}
			isNil := false

			switch v := val.(type) {
			case *string:
				if v == nil {
					isNil = true
				} else {
					value = *v
				}
			case *int:
				if v == nil {
					isNil = true
				} else {
					value = *v
				}
			case *float64:
				if v == nil {
					isNil = true
				} else {
					value = *v
				}
			case *mdrug.Date:
				if v == nil {
					isNil = true
				} else {
					value = v.Time()
				}
			case *time.Time:
				if v == nil {
					isNil = true
				} else {
					value = *v
				}
			}

			if !isNil {
				setParts = append(setParts, fmt.Sprintf("%s = $%d", col, idx))
				args = append(args, value)
				idx++
			}
		}
	}

	if len(setParts) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No data to update"})
		return
	}

	args = append(args, id)
	query := fmt.Sprintf("UPDATE drugs SET %s, updated_at = NOW() WHERE id = $%d", strings.Join(setParts, ", "), idx)

	_, err = h.DB.Exec(query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update drug: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Drug updated successfully"})
}

// GetDrugsLowStockHandler returns drugs with stock below their individual min_stock or a custom threshold
func (h *DrugHandler) GetDrugsLowStockHandler(c *gin.Context) {
	thresholdStr := c.DefaultQuery("threshold", "10")
	threshold, _ := strconv.Atoi(thresholdStr)

	rows, err := h.DB.Query("SELECT id, kode_obat, nama_obat, stok_obat, min_stock, unit FROM drugs WHERE stok_obat <= $1 OR stok_obat <= min_stock", threshold)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch low stock drugs"})
		return
	}
	defer rows.Close()

	var drugs []mdrug.Drug
	for rows.Next() {
		var d mdrug.Drug
		if err := rows.Scan(&d.ID, &d.Sku, &d.Name, &d.Stock, &d.MinStock, &d.Unit); err != nil {
			continue
		}
		drugs = append(drugs, d)
	}
	c.JSON(http.StatusOK, gin.H{"data": drugs})
}

// ListDrugsHandler returns comprehensive drug list
func (h *DrugHandler) ListDrugsHandler(c *gin.Context) {
	rows, err := h.DB.Query(`SELECT id, kode_obat, nama_obat, deskripsi, fungsi_obat, efek_samping, kategori_obat, merek_obat, dosis_obat, golongan_obat, bentuk_obat, unit, stok_obat, min_stock, harga_jual_eceran, harga_jual_grosir, expiry_date, created_at, updated_at FROM drugs`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch drugs listing"})
		return
	}
	defer rows.Close()

	var drugs []mdrug.Drug
	for rows.Next() {
		var d mdrug.Drug
		err := rows.Scan(
			&d.ID, &d.Sku, &d.Name, &d.Description, &d.Function, &d.SideEffects, &d.Category, &d.Brand, &d.Dosage, &d.Group, &d.Shape, &d.Unit, &d.Stock, &d.MinStock, &d.SellPrice, &d.BuyPrice, &d.ExpiryDate, &d.CreatedAt, &d.UpdatedAt,
		)
		if err != nil {
			continue
		}
		drugs = append(drugs, d)
	}
	c.JSON(http.StatusOK, gin.H{"data": mdrug.ToDrugResponses(drugs)})
}

// DeleteDrugHandler deletes a pharmacy item
func (h *DrugHandler) DeleteDrugHandler(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid drug ID"})
		return
	}

	_, err = h.DB.Exec("DELETE FROM drugs WHERE id = $1", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete drug"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Drug deleted successfully"})
}

// GetDrugHandler gets a single drug by SKU (kode_obat)
func (h *DrugHandler) GetDrugHandler(c *gin.Context) {
	sku := c.Param("sku")
	var d mdrug.Drug
	err := h.DB.QueryRow(`SELECT id, kode_obat, nama_obat, deskripsi, fungsi_obat, efek_samping, kategori_obat, merek_obat, dosis_obat, golongan_obat, bentuk_obat, unit, stok_obat, min_stock, harga_jual_eceran, harga_jual_grosir, expiry_date, created_at, updated_at 
		FROM drugs WHERE kode_obat = $1`, sku).
		Scan(&d.ID, &d.Sku, &d.Name, &d.Description, &d.Function, &d.SideEffects, &d.Category, &d.Brand, &d.Dosage, &d.Group, &d.Shape, &d.Unit, &d.Stock, &d.MinStock, &d.SellPrice, &d.BuyPrice, &d.ExpiryDate, &d.CreatedAt, &d.UpdatedAt)
	
	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, gin.H{"error": "Drug not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": mdrug.ToDrugResponse(d)})
}
