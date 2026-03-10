package drug

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

type Drug struct {
	ID          int        `json:"id" db:"id"`
	Sku         string     `json:"sku" db:"kode_obat"`
	Name        string     `json:"name" db:"nama_obat"`
	Description string     `json:"description" db:"deskripsi"`
	Function    string     `json:"function" db:"fungsi_obat"`
	SideEffects string     `json:"side_effects" db:"efek_samping"`
	Category    string     `json:"category" db:"kategori_obat"`
	Brand       string     `json:"brand" db:"merek_obat"`
	Dosage      string     `json:"dosage" db:"dosis_obat"`
	Group       string     `json:"group" db:"golongan_obat"`
	Shape       string     `json:"shape" db:"bentuk_obat"`
	Unit        string     `json:"unit" db:"unit"`
	Stock       int        `json:"stock" db:"stok_obat"`
	MinStock    int        `json:"min_stock" db:"min_stock"`
	SellPrice   float64    `json:"sell_price" db:"harga_jual_eceran"`
	BuyPrice    float64    `json:"buy_price" db:"harga_jual_grosir"`
	ExpiryDate  *Date      `json:"expiry_date,omitempty" db:"expiry_date"`

	CreatedAt time.Time `json:"created_at" db:"created_at"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
}

type CreateDrugInput struct {
	Sku         string     `json:"sku" binding:"required"`
	Name        string     `json:"name" binding:"required"`
	Description string     `json:"description"`
	Function    string     `json:"function"`
	SideEffects string     `json:"side_effects"`
	Category    string     `json:"category"`
	Brand       string     `json:"brand"`
	Dosage      string     `json:"dosage"`
	Group       string     `json:"group"`
	Shape       string     `json:"shape"`
	Unit        string     `json:"unit" binding:"required"`
	Stock       int        `json:"stock" binding:"required,gte=0"`
	MinStock    int        `json:"min_stock" binding:"required,gte=0"`
	SellPrice   float64    `json:"sell_price" binding:"required,gte=0"`
	BuyPrice    float64    `json:"buy_price" binding:"required,gte=0"`
	ExpiryDate  *Date      `json:"expiry_date"`
}

type UpdateDrugInput struct {
	Sku         *string    `json:"sku"`
	Name        *string    `json:"name"`
	Description *string    `json:"description"`
	Function    *string    `json:"function"`
	SideEffects *string    `json:"side_effects"`
	Category    *string    `json:"category"`
	Brand       *string    `json:"brand"`
	Dosage      *string    `json:"dosage"`
	Group       *string    `json:"group"`
	Shape       *string    `json:"shape"`
	Unit        *string    `json:"unit"`
	Stock       *int       `json:"stock"`
	MinStock    *int       `json:"min_stock"`
	SellPrice   *float64   `json:"sell_price"`
	BuyPrice    *float64   `json:"buy_price"`
	ExpiryDate  *Date      `json:"expiry_date"`
}

type DrugResponse struct {
	ID          int        `json:"id"`
	Sku         string     `json:"sku"`
	Name        string     `json:"name"`
	Description string     `json:"description"`
	Function    string     `json:"function"`
	SideEffects string     `json:"side_effects"`
	Category    string     `json:"category"`
	Brand       string     `json:"brand"`
	Dosage      string     `json:"dosage"`
	Group       string     `json:"group"`
	Shape       string     `json:"shape"`
	Unit        string     `json:"unit"`
	Stock       int        `json:"stock"`
	MinStock    int        `json:"min_stock"`
	SellPrice   float64    `json:"sell_price"`
	BuyPrice    float64    `json:"buy_price"`
	ExpiryDate  *Date      `json:"expiry_date,omitempty"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func ToDrugResponse(d Drug) DrugResponse {
	return DrugResponse{
		ID:          d.ID,
		Sku:         d.Sku,
		Name:        d.Name,
		Description: d.Description,
		Function:    d.Function,
		SideEffects: d.SideEffects,
		Category:    d.Category,
		Brand:       d.Brand,
		Dosage:      d.Dosage,
		Group:       d.Group,
		Shape:       d.Shape,
		Unit:        d.Unit,
		Stock:       d.Stock,
		MinStock:    d.MinStock,
		SellPrice:   d.SellPrice,
		BuyPrice:    d.BuyPrice,
		ExpiryDate:  d.ExpiryDate,
		CreatedAt:   d.CreatedAt,
		UpdatedAt:   d.UpdatedAt,
	}
}

func ToDrugResponses(drugs []Drug) []DrugResponse {
	responses := make([]DrugResponse, len(drugs))
	for i, d := range drugs {
		responses[i] = ToDrugResponse(d)
	}
	return responses
}
