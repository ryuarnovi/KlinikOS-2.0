package icd

type ICD10 struct {
	ID            int    `json:"id" db:"id"`
	Code          string `json:"code" db:"code"`
	DescriptionEN string `json:"description_en" db:"description_en"`
	DescriptionID string `json:"description_id" db:"description_id"`
	IsActive      bool   `json:"is_active" db:"is_active"`
}

type ICD9CM struct {
	ID            int    `json:"id" db:"id"`
	Code          string `json:"code" db:"code"`
	DescriptionEN string `json:"description_en" db:"description_en"`
	DescriptionID string `json:"description_id" db:"description_id"`
	IsActive      bool   `json:"is_active" db:"is_active"`
}

type ICDResponse struct {
	ID          int    `json:"id"`
	Code        string `json:"code"`
	Description string `json:"description"`
}
