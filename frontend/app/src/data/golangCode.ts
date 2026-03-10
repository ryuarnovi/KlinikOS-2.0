// ============================================================
// SEMUA KODE GOLANG BACKEND LENGKAP — Klinik ERP
// ============================================================

// ---- go.mod ----
export const goMod = `module klinik-erp

go 1.22

require (
	github.com/gin-contrib/cors v1.7.2
	github.com/gin-gonic/gin v1.10.0
	github.com/golang-jwt/jwt/v5 v5.2.1
	github.com/golang-migrate/migrate/v4 v4.17.1
	github.com/google/uuid v1.6.0
	github.com/lib/pq v1.10.9
	golang.org/x/crypto v0.27.0
)`;

// ---- internal/config/config.go ----
export const configGo = `package config

import (
	"os"
)

type Config struct {
	DatabaseURL string
	JWTSecret   string
	Port        string
	GinMode     string
}

func Load() *Config {
	return &Config{
		DatabaseURL: getEnv("DATABASE_URL", "postgres://postgres:postgres@localhost:5432/klinik_erp?sslmode=disable"),
		JWTSecret:   getEnv("JWT_SECRET", "klinik-erp-super-secret-key-2024"),
		Port:        getEnv("PORT", "8080"),
		GinMode:     getEnv("GIN_MODE", "debug"),
	}
}

func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}`;

// ---- internal/model/user.go ----
export const modelUser = `package model

import (
	"time"

	"github.com/google/uuid"
)

type Role struct {
	ID          uuid.UUID \`json:"id" db:"id"\`
	Name        string    \`json:"name" db:"name"\`
	Description string    \`json:"description" db:"description"\`
	CreatedAt   time.Time \`json:"created_at" db:"created_at"\`
	UpdatedAt   time.Time \`json:"updated_at" db:"updated_at"\`
}

type User struct {
	ID           uuid.UUID  \`json:"id" db:"id"\`
	RoleID       uuid.UUID  \`json:"role_id" db:"role_id"\`
	Username     string     \`json:"username" db:"username"\`
	Email        string     \`json:"email" db:"email"\`
	PasswordHash string     \`json:"-" db:"password_hash"\`
	FullName     string     \`json:"full_name" db:"full_name"\`
	Phone        *string    \`json:"phone" db:"phone"\`
	IsActive     bool       \`json:"is_active" db:"is_active"\`
	LastLogin    *time.Time \`json:"last_login" db:"last_login"\`
	CreatedAt    time.Time  \`json:"created_at" db:"created_at"\`
	UpdatedAt    time.Time  \`json:"updated_at" db:"updated_at"\`
	// Joined field
	RoleName string \`json:"role_name,omitempty" db:"role_name"\`
}

type UserResponse struct {
	ID        uuid.UUID \`json:"id"\`
	Username  string    \`json:"username"\`
	Email     string    \`json:"email"\`
	FullName  string    \`json:"full_name"\`
	Phone     *string   \`json:"phone"\`
	IsActive  bool      \`json:"is_active"\`
	RoleName  string    \`json:"role_name"\`
	CreatedAt time.Time \`json:"created_at"\`
}

func (u *User) ToResponse() UserResponse {
	return UserResponse{
		ID:        u.ID,
		Username:  u.Username,
		Email:     u.Email,
		FullName:  u.FullName,
		Phone:     u.Phone,
		IsActive:  u.IsActive,
		RoleName:  u.RoleName,
		CreatedAt: u.CreatedAt,
	}
}`;

// ---- internal/model/patient.go ----
export const modelPatient = `package model

import (
	"time"

	"github.com/google/uuid"
)

type Patient struct {
	ID                    uuid.UUID  \`json:"id" db:"id"\`
	UserID                *uuid.UUID \`json:"user_id" db:"user_id"\`
	NIK                   string     \`json:"nik" db:"nik"\`
	FullName              string     \`json:"full_name" db:"full_name"\`
	DateOfBirth           time.Time  \`json:"date_of_birth" db:"date_of_birth"\`
	Gender                string     \`json:"gender" db:"gender"\`
	Phone                 *string    \`json:"phone" db:"phone"\`
	Address               *string    \`json:"address" db:"address"\`
	BloodType             *string    \`json:"blood_type" db:"blood_type"\`
	Allergies             *string    \`json:"allergies" db:"allergies"\`
	EmergencyContact      *string    \`json:"emergency_contact" db:"emergency_contact"\`
	EmergencyContactPhone *string    \`json:"emergency_contact_phone" db:"emergency_contact_phone"\`
	IsWalkin              bool       \`json:"is_walkin" db:"is_walkin"\`
	CreatedAt             time.Time  \`json:"created_at" db:"created_at"\`
	UpdatedAt             time.Time  \`json:"updated_at" db:"updated_at"\`
}

type CreatePatientRequest struct {
	NIK                   string  \`json:"nik" binding:"required,len=16"\`
	FullName              string  \`json:"full_name" binding:"required"\`
	DateOfBirth           string  \`json:"date_of_birth" binding:"required"\`
	Gender                string  \`json:"gender" binding:"required,oneof=L P"\`
	Phone                 *string \`json:"phone"\`
	Address               *string \`json:"address"\`
	BloodType             *string \`json:"blood_type"\`
	Allergies             *string \`json:"allergies"\`
	EmergencyContact      *string \`json:"emergency_contact"\`
	EmergencyContactPhone *string \`json:"emergency_contact_phone"\`
	IsWalkin              bool    \`json:"is_walkin"\`
}

type UpdatePatientRequest struct {
	FullName              *string \`json:"full_name"\`
	Phone                 *string \`json:"phone"\`
	Address               *string \`json:"address"\`
	BloodType             *string \`json:"blood_type"\`
	Allergies             *string \`json:"allergies"\`
	EmergencyContact      *string \`json:"emergency_contact"\`
	EmergencyContactPhone *string \`json:"emergency_contact_phone"\`
}`;

// ---- internal/model/medical_record.go ----
export const modelMedicalRecord = `package model

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

type MedicalRecord struct {
	ID            uuid.UUID        \`json:"id" db:"id"\`
	AppointmentID *uuid.UUID       \`json:"appointment_id" db:"appointment_id"\`
	PatientID     uuid.UUID        \`json:"patient_id" db:"patient_id"\`
	DoctorID      uuid.UUID        \`json:"doctor_id" db:"doctor_id"\`
	NurseID       *uuid.UUID       \`json:"nurse_id" db:"nurse_id"\`
	VisitDate     time.Time        \`json:"visit_date" db:"visit_date"\`
	Subjective    string           \`json:"subjective" db:"subjective"\`
	Objective     string           \`json:"objective" db:"objective"\`
	Assessment    string           \`json:"assessment" db:"assessment"\`
	Plan          string           \`json:"plan" db:"plan"\`
	VitalSigns    json.RawMessage  \`json:"vital_signs" db:"vital_signs"\`
	ICDCode       *string          \`json:"icd_code" db:"icd_code"\`
	Status        string           \`json:"status" db:"status"\`
	CreatedAt     time.Time        \`json:"created_at" db:"created_at"\`
	UpdatedAt     time.Time        \`json:"updated_at" db:"updated_at"\`
	// Joined
	PatientName string \`json:"patient_name,omitempty" db:"patient_name"\`
	DoctorName  string \`json:"doctor_name,omitempty" db:"doctor_name"\`
}

type VitalSigns struct {
	Temperature    float64 \`json:"temperature"\`
	BloodPressure  string  \`json:"blood_pressure"\`
	HeartRate      int     \`json:"heart_rate"\`
	RespiratoryRate int    \`json:"respiratory_rate"\`
	Weight         float64 \`json:"weight"\`
	Height         float64 \`json:"height"\`
	SpO2           int     \`json:"spo2"\`
}

type CreateMedicalRecordRequest struct {
	AppointmentID *uuid.UUID  \`json:"appointment_id"\`
	PatientID     uuid.UUID   \`json:"patient_id" binding:"required"\`
	NurseID       *uuid.UUID  \`json:"nurse_id"\`
	Subjective    string      \`json:"subjective" binding:"required"\`
	Objective     string      \`json:"objective" binding:"required"\`
	Assessment    string      \`json:"assessment" binding:"required"\`
	Plan          string      \`json:"plan" binding:"required"\`
	VitalSigns    *VitalSigns \`json:"vital_signs"\`
	ICDCode       *string     \`json:"icd_code"\`
}

type UpdateMedicalRecordRequest struct {
	Subjective *string     \`json:"subjective"\`
	Objective  *string     \`json:"objective"\`
	Assessment *string     \`json:"assessment"\`
	Plan       *string     \`json:"plan"\`
	VitalSigns *VitalSigns \`json:"vital_signs"\`
	ICDCode    *string     \`json:"icd_code"\`
	Status     *string     \`json:"status"\`
}`;

// ---- internal/model/appointment.go ----
export const modelAppointment = `package model

import (
	"time"

	"github.com/google/uuid"
)

type Appointment struct {
	ID              uuid.UUID  \`json:"id" db:"id"\`
	PatientID       uuid.UUID  \`json:"patient_id" db:"patient_id"\`
	DoctorID        uuid.UUID  \`json:"doctor_id" db:"doctor_id"\`
	AppointmentDate time.Time  \`json:"appointment_date" db:"appointment_date"\`
	AppointmentTime string     \`json:"appointment_time" db:"appointment_time"\`
	EndTime         *string    \`json:"end_time" db:"end_time"\`
	Status          string     \`json:"status" db:"status"\`
	Complaint       *string    \`json:"complaint" db:"complaint"\`
	Notes           *string    \`json:"notes" db:"notes"\`
	QueueNumber     *int       \`json:"queue_number" db:"queue_number"\`
	CreatedAt       time.Time  \`json:"created_at" db:"created_at"\`
	UpdatedAt       time.Time  \`json:"updated_at" db:"updated_at"\`
	// Joined
	PatientName string \`json:"patient_name,omitempty" db:"patient_name"\`
	DoctorName  string \`json:"doctor_name,omitempty" db:"doctor_name"\`
}

type CreateAppointmentRequest struct {
	PatientID       uuid.UUID \`json:"patient_id" binding:"required"\`
	DoctorID        uuid.UUID \`json:"doctor_id" binding:"required"\`
	AppointmentDate string    \`json:"appointment_date" binding:"required"\`
	AppointmentTime string    \`json:"appointment_time" binding:"required"\`
	Complaint       *string   \`json:"complaint"\`
}

type UpdateAppointmentRequest struct {
	Status  *string \`json:"status"\`
	Notes   *string \`json:"notes"\`
	EndTime *string \`json:"end_time"\`
}`;

// ---- internal/model/pharmacy.go ----
export const modelPharmacy = `package model

import (
	"time"

	"github.com/google/uuid"
)

type PharmacyItem struct {
	ID           uuid.UUID  \`json:"id" db:"id"\`
	Name         string     \`json:"name" db:"name"\`
	SKU          string     \`json:"sku" db:"sku"\`
	Category     *string    \`json:"category" db:"category"\`
	Description  *string    \`json:"description" db:"description"\`
	Unit         string     \`json:"unit" db:"unit"\`
	Stock        int        \`json:"stock" db:"stock"\`
	MinStock     int        \`json:"min_stock" db:"min_stock"\`
	BuyPrice     float64    \`json:"buy_price" db:"buy_price"\`
	SellPrice    float64    \`json:"sell_price" db:"sell_price"\`
	ExpiryDate   *time.Time \`json:"expiry_date" db:"expiry_date"\`
	Manufacturer *string    \`json:"manufacturer" db:"manufacturer"\`
	IsActive     bool       \`json:"is_active" db:"is_active"\`
	CreatedAt    time.Time  \`json:"created_at" db:"created_at"\`
	UpdatedAt    time.Time  \`json:"updated_at" db:"updated_at"\`
}

type CreatePharmacyItemRequest struct {
	Name         string   \`json:"name" binding:"required"\`
	SKU          string   \`json:"sku" binding:"required"\`
	Category     *string  \`json:"category"\`
	Description  *string  \`json:"description"\`
	Unit         string   \`json:"unit" binding:"required"\`
	Stock        int      \`json:"stock" binding:"min=0"\`
	MinStock     int      \`json:"min_stock"\`
	BuyPrice     float64  \`json:"buy_price" binding:"min=0"\`
	SellPrice    float64  \`json:"sell_price" binding:"min=0"\`
	ExpiryDate   *string  \`json:"expiry_date"\`
	Manufacturer *string  \`json:"manufacturer"\`
}

type UpdatePharmacyItemRequest struct {
	Name         *string  \`json:"name"\`
	Category     *string  \`json:"category"\`
	Unit         *string  \`json:"unit"\`
	Stock        *int     \`json:"stock"\`
	MinStock     *int     \`json:"min_stock"\`
	BuyPrice     *float64 \`json:"buy_price"\`
	SellPrice    *float64 \`json:"sell_price"\`
	ExpiryDate   *string  \`json:"expiry_date"\`
	Manufacturer *string  \`json:"manufacturer"\`
	IsActive     *bool    \`json:"is_active"\`
}

type StockLedger struct {
	ID             uuid.UUID  \`json:"id" db:"id"\`
	PharmacyItemID uuid.UUID  \`json:"pharmacy_item_id" db:"pharmacy_item_id"\`
	UserID         uuid.UUID  \`json:"user_id" db:"user_id"\`
	Type           string     \`json:"type" db:"type"\`
	Quantity       int        \`json:"quantity" db:"quantity"\`
	ReferenceType  *string    \`json:"reference_type" db:"reference_type"\`
	ReferenceID    *uuid.UUID \`json:"reference_id" db:"reference_id"\`
	Notes          *string    \`json:"notes" db:"notes"\`
	CreatedAt      time.Time  \`json:"created_at" db:"created_at"\`
	// Joined
	ItemName string \`json:"item_name,omitempty" db:"item_name"\`
	UserName string \`json:"user_name,omitempty" db:"user_name"\`
}`;

// ---- internal/model/prescription.go ----
export const modelPrescription = `package model

import (
	"time"

	"github.com/google/uuid"
)

type Prescription struct {
	ID              uuid.UUID  \`json:"id" db:"id"\`
	MedicalRecordID uuid.UUID  \`json:"medical_record_id" db:"medical_record_id"\`
	DoctorID        uuid.UUID  \`json:"doctor_id" db:"doctor_id"\`
	PharmacistID    *uuid.UUID \`json:"pharmacist_id" db:"pharmacist_id"\`
	Status          string     \`json:"status" db:"status"\`
	Notes           *string    \`json:"notes" db:"notes"\`
	DispensedAt     *time.Time \`json:"dispensed_at" db:"dispensed_at"\`
	CreatedAt       time.Time  \`json:"created_at" db:"created_at"\`
	UpdatedAt       time.Time  \`json:"updated_at" db:"updated_at"\`
	// Joined
	PatientName string             \`json:"patient_name,omitempty" db:"patient_name"\`
	DoctorName  string             \`json:"doctor_name,omitempty" db:"doctor_name"\`
	Items       []PrescriptionItem \`json:"items,omitempty"\`
}

type PrescriptionItem struct {
	ID             uuid.UUID \`json:"id" db:"id"\`
	PrescriptionID uuid.UUID \`json:"prescription_id" db:"prescription_id"\`
	PharmacyItemID uuid.UUID \`json:"pharmacy_item_id" db:"pharmacy_item_id"\`
	Quantity       int       \`json:"quantity" db:"quantity"\`
	Dosage         string    \`json:"dosage" db:"dosage"\`
	Frequency      *string   \`json:"frequency" db:"frequency"\`
	DurationDays   *int      \`json:"duration_days" db:"duration_days"\`
	Notes          *string   \`json:"notes" db:"notes"\`
	CreatedAt      time.Time \`json:"created_at" db:"created_at"\`
	// Joined
	ItemName string \`json:"item_name,omitempty" db:"item_name"\`
}

type CreatePrescriptionRequest struct {
	MedicalRecordID uuid.UUID                      \`json:"medical_record_id" binding:"required"\`
	Notes           *string                        \`json:"notes"\`
	Items           []CreatePrescriptionItemRequest \`json:"items" binding:"required,min=1"\`
}

type CreatePrescriptionItemRequest struct {
	PharmacyItemID uuid.UUID \`json:"pharmacy_item_id" binding:"required"\`
	Quantity       int       \`json:"quantity" binding:"required,min=1"\`
	Dosage         string    \`json:"dosage" binding:"required"\`
	Frequency      *string   \`json:"frequency"\`
	DurationDays   *int      \`json:"duration_days"\`
	Notes          *string   \`json:"notes"\`
}`;

// ---- internal/model/billing.go ----
export const modelBilling = `package model

import (
	"time"

	"github.com/google/uuid"
)

type BillingTransaction struct {
	ID              uuid.UUID  \`json:"id" db:"id"\`
	MedicalRecordID *uuid.UUID \`json:"medical_record_id" db:"medical_record_id"\`
	PatientID       uuid.UUID  \`json:"patient_id" db:"patient_id"\`
	CashierID       *uuid.UUID \`json:"cashier_id" db:"cashier_id"\`
	InvoiceNumber   string     \`json:"invoice_number" db:"invoice_number"\`
	DoctorFee       float64    \`json:"doctor_fee" db:"doctor_fee"\`
	MedicineCost    float64    \`json:"medicine_cost" db:"medicine_cost"\`
	AdminFee        float64    \`json:"admin_fee" db:"admin_fee"\`
	Discount        float64    \`json:"discount" db:"discount"\`
	Tax             float64    \`json:"tax" db:"tax"\`
	Total           float64    \`json:"total" db:"total"\`
	PaymentMethod   string     \`json:"payment_method" db:"payment_method"\`
	Status          string     \`json:"status" db:"status"\`
	PaidAt          *time.Time \`json:"paid_at" db:"paid_at"\`
	Notes           *string    \`json:"notes" db:"notes"\`
	CreatedAt       time.Time  \`json:"created_at" db:"created_at"\`
	UpdatedAt       time.Time  \`json:"updated_at" db:"updated_at"\`
	// Joined
	PatientName string \`json:"patient_name,omitempty" db:"patient_name"\`
	CashierName string \`json:"cashier_name,omitempty" db:"cashier_name"\`
}

type CreateBillingRequest struct {
	MedicalRecordID *uuid.UUID \`json:"medical_record_id"\`
	PatientID       uuid.UUID  \`json:"patient_id" binding:"required"\`
	DoctorFee       float64    \`json:"doctor_fee" binding:"min=0"\`
	MedicineCost    float64    \`json:"medicine_cost" binding:"min=0"\`
	AdminFee        float64    \`json:"admin_fee"\`
	Discount        float64    \`json:"discount"\`
	Tax             float64    \`json:"tax"\`
	PaymentMethod   string     \`json:"payment_method" binding:"required,oneof=cash debit credit bpjs transfer"\`
	Notes           *string    \`json:"notes"\`
}

type ProcessPaymentRequest struct {
	PaymentMethod string \`json:"payment_method" binding:"required,oneof=cash debit credit bpjs transfer"\`
}`;

// ---- internal/model/staff_profile.go ----
export const modelStaffProfile = `package model

import (
	"time"

	"github.com/google/uuid"
)

type StaffProfile struct {
	ID             uuid.UUID  \`json:"id" db:"id"\`
	UserID         uuid.UUID  \`json:"user_id" db:"user_id"\`
	NIP            string     \`json:"nip" db:"nip"\`
	Specialization *string    \`json:"specialization" db:"specialization"\`
	LicenseNumber  *string    \`json:"license_number" db:"license_number"\`
	Education      *string    \`json:"education" db:"education"\`
	JoinDate       time.Time  \`json:"join_date" db:"join_date"\`
	IsAvailable    bool       \`json:"is_available" db:"is_available"\`
	CreatedAt      time.Time  \`json:"created_at" db:"created_at"\`
	UpdatedAt      time.Time  \`json:"updated_at" db:"updated_at"\`
	// Joined
	UserFullName string \`json:"user_full_name,omitempty" db:"user_full_name"\`
	RoleName     string \`json:"role_name,omitempty" db:"role_name"\`
}`;

// ---- internal/model/auth.go ----
export const modelAuth = `package model

type LoginRequest struct {
	Username string \`json:"username" binding:"required"\`
	Password string \`json:"password" binding:"required"\`
}

type RegisterRequest struct {
	Username string \`json:"username" binding:"required,min=3,max=100"\`
	Email    string \`json:"email" binding:"required,email"\`
	Password string \`json:"password" binding:"required,min=6"\`
	FullName string \`json:"full_name" binding:"required"\`
	Phone    string \`json:"phone"\`
}

type LoginResponse struct {
	Token string       \`json:"token"\`
	User  UserResponse \`json:"user"\`
}`;

// ---- internal/middleware/auth.go ----
export const middlewareAuth = `package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

// Claims menyimpan informasi user dari JWT token
type Claims struct {
	UserID string \`json:"user_id"\`
	Role   string \`json:"role"\`
	jwt.RegisteredClaims
}

// JWTAuth mengekstrak dan memvalidasi JWT token dari header Authorization
func JWTAuth(secretKey string) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"error":   "Authorization header is required",
			})
			c.Abort()
			return
		}

		// Ekstrak Bearer token
		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		if tokenString == authHeader {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"error":   "Bearer token format required",
			})
			c.Abort()
			return
		}

		// Parse dan validasi token
		claims := &Claims{}
		token, err := jwt.ParseWithClaims(tokenString, claims,
			func(token *jwt.Token) (interface{}, error) {
				// Pastikan signing method sesuai
				if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
					return nil, jwt.ErrSignatureInvalid
				}
				return []byte(secretKey), nil
			},
		)

		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"error":   "Invalid or expired token",
			})
			c.Abort()
			return
		}

		// Set user info ke Gin context agar bisa dipakai handler
		c.Set("user_id", claims.UserID)
		c.Set("role", claims.Role)
		c.Next()
	}
}

// AuthorizeRole membatasi akses endpoint hanya untuk role tertentu
// Contoh: AuthorizeRole("Dokter", "Perawat") → hanya Dokter & Perawat boleh akses
func AuthorizeRole(allowedRoles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		userRole, exists := c.Get("role")
		if !exists {
			c.JSON(http.StatusForbidden, gin.H{
				"success": false,
				"error":   "Role not found in token",
			})
			c.Abort()
			return
		}

		roleStr, ok := userRole.(string)
		if !ok {
			c.JSON(http.StatusForbidden, gin.H{
				"success": false,
				"error":   "Invalid role format",
			})
			c.Abort()
			return
		}

		// Cek apakah role user ada di daftar yang diizinkan
		for _, allowed := range allowedRoles {
			if roleStr == allowed {
				c.Next()
				return
			}
		}

		c.JSON(http.StatusForbidden, gin.H{
			"success":  false,
			"error":    "Access denied: insufficient permissions",
			"required": allowedRoles,
			"current":  roleStr,
		})
		c.Abort()
	}
}`;

// ---- internal/middleware/cors.go ----
export const middlewareCors = `package middleware

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

// SetupCORS mengembalikan CORS middleware yang dikonfigurasi
func SetupCORS() gin.HandlerFunc {
	return cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Authorization", "Content-Type", "Accept"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	})
}`;

// ---- internal/repository/user_repo.go ----
export const repoUser = `package repository

import (
	"database/sql"
	"fmt"

	"github.com/google/uuid"

	"klinik-erp/internal/model"
)

type UserRepository struct {
	db *sql.DB
}

func NewUserRepository(db *sql.DB) *UserRepository {
	return &UserRepository{db: db}
}

// FindByUsername mencari user berdasarkan username (untuk login)
func (r *UserRepository) FindByUsername(username string) (*model.User, error) {
	query := \`
		SELECT u.id, u.role_id, u.username, u.email, u.password_hash,
		       u.full_name, u.phone, u.is_active, u.last_login,
		       u.created_at, u.updated_at, r.name as role_name
		FROM users u
		JOIN roles r ON u.role_id = r.id
		WHERE u.username = $1
	\`
	user := &model.User{}
	err := r.db.QueryRow(query, username).Scan(
		&user.ID, &user.RoleID, &user.Username, &user.Email,
		&user.PasswordHash, &user.FullName, &user.Phone,
		&user.IsActive, &user.LastLogin, &user.CreatedAt,
		&user.UpdatedAt, &user.RoleName,
	)
	if err != nil {
		return nil, fmt.Errorf("user not found: %w", err)
	}
	return user, nil
}

// FindByID mencari user berdasarkan ID
func (r *UserRepository) FindByID(id uuid.UUID) (*model.User, error) {
	query := \`
		SELECT u.id, u.role_id, u.username, u.email, u.password_hash,
		       u.full_name, u.phone, u.is_active, u.last_login,
		       u.created_at, u.updated_at, r.name as role_name
		FROM users u
		JOIN roles r ON u.role_id = r.id
		WHERE u.id = $1
	\`
	user := &model.User{}
	err := r.db.QueryRow(query, id).Scan(
		&user.ID, &user.RoleID, &user.Username, &user.Email,
		&user.PasswordHash, &user.FullName, &user.Phone,
		&user.IsActive, &user.LastLogin, &user.CreatedAt,
		&user.UpdatedAt, &user.RoleName,
	)
	if err != nil {
		return nil, fmt.Errorf("user not found: %w", err)
	}
	return user, nil
}

// FindAll mengambil semua user dengan joined role name
func (r *UserRepository) FindAll() ([]model.User, error) {
	query := \`
		SELECT u.id, u.role_id, u.username, u.email, u.password_hash,
		       u.full_name, u.phone, u.is_active, u.last_login,
		       u.created_at, u.updated_at, r.name as role_name
		FROM users u
		JOIN roles r ON u.role_id = r.id
		ORDER BY u.created_at DESC
	\`
	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []model.User
	for rows.Next() {
		var u model.User
		err := rows.Scan(
			&u.ID, &u.RoleID, &u.Username, &u.Email,
			&u.PasswordHash, &u.FullName, &u.Phone,
			&u.IsActive, &u.LastLogin, &u.CreatedAt,
			&u.UpdatedAt, &u.RoleName,
		)
		if err != nil {
			return nil, err
		}
		users = append(users, u)
	}
	return users, nil
}

// Create membuat user baru
func (r *UserRepository) Create(user *model.User) error {
	query := \`
		INSERT INTO users (role_id, username, email, password_hash, full_name, phone)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, created_at, updated_at
	\`
	return r.db.QueryRow(
		query, user.RoleID, user.Username, user.Email,
		user.PasswordHash, user.FullName, user.Phone,
	).Scan(&user.ID, &user.CreatedAt, &user.UpdatedAt)
}

// Update mengupdate data user
func (r *UserRepository) Update(user *model.User) error {
	query := \`
		UPDATE users
		SET full_name = $2, email = $3, phone = $4, is_active = $5,
		    updated_at = NOW()
		WHERE id = $1
	\`
	_, err := r.db.Exec(query, user.ID, user.FullName, user.Email, user.Phone, user.IsActive)
	return err
}

// Delete menghapus user berdasarkan ID
func (r *UserRepository) Delete(id uuid.UUID) error {
	query := \`DELETE FROM users WHERE id = $1\`
	result, err := r.db.Exec(query, id)
	if err != nil {
		return err
	}
	affected, _ := result.RowsAffected()
	if affected == 0 {
		return fmt.Errorf("user not found")
	}
	return nil
}

// GetRoleByName mengambil role berdasarkan nama
func (r *UserRepository) GetRoleByName(name string) (*model.Role, error) {
	query := \`SELECT id, name, description FROM roles WHERE name = $1\`
	role := &model.Role{}
	err := r.db.QueryRow(query, name).Scan(&role.ID, &role.Name, &role.Description)
	if err != nil {
		return nil, fmt.Errorf("role not found: %w", err)
	}
	return role, nil
}`;

// ---- internal/repository/patient_repo.go ----
export const repoPatient = `package repository

import (
	"database/sql"
	"fmt"

	"github.com/google/uuid"

	"klinik-erp/internal/model"
)

type PatientRepository struct {
	db *sql.DB
}

func NewPatientRepository(db *sql.DB) *PatientRepository {
	return &PatientRepository{db: db}
}

func (r *PatientRepository) FindAll() ([]model.Patient, error) {
	query := \`
		SELECT id, user_id, nik, full_name, date_of_birth, gender,
		       phone, address, blood_type, allergies,
		       emergency_contact, emergency_contact_phone,
		       is_walkin, created_at, updated_at
		FROM patients
		ORDER BY created_at DESC
	\`
	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var patients []model.Patient
	for rows.Next() {
		var p model.Patient
		err := rows.Scan(
			&p.ID, &p.UserID, &p.NIK, &p.FullName, &p.DateOfBirth,
			&p.Gender, &p.Phone, &p.Address, &p.BloodType,
			&p.Allergies, &p.EmergencyContact, &p.EmergencyContactPhone,
			&p.IsWalkin, &p.CreatedAt, &p.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		patients = append(patients, p)
	}
	return patients, nil
}

func (r *PatientRepository) FindByID(id uuid.UUID) (*model.Patient, error) {
	query := \`
		SELECT id, user_id, nik, full_name, date_of_birth, gender,
		       phone, address, blood_type, allergies,
		       emergency_contact, emergency_contact_phone,
		       is_walkin, created_at, updated_at
		FROM patients
		WHERE id = $1
	\`
	p := &model.Patient{}
	err := r.db.QueryRow(query, id).Scan(
		&p.ID, &p.UserID, &p.NIK, &p.FullName, &p.DateOfBirth,
		&p.Gender, &p.Phone, &p.Address, &p.BloodType,
		&p.Allergies, &p.EmergencyContact, &p.EmergencyContactPhone,
		&p.IsWalkin, &p.CreatedAt, &p.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("patient not found: %w", err)
	}
	return p, nil
}

func (r *PatientRepository) Create(p *model.Patient) error {
	query := \`
		INSERT INTO patients (user_id, nik, full_name, date_of_birth, gender,
		                      phone, address, blood_type, allergies,
		                      emergency_contact, emergency_contact_phone, is_walkin)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
		RETURNING id, created_at, updated_at
	\`
	return r.db.QueryRow(
		query, p.UserID, p.NIK, p.FullName, p.DateOfBirth,
		p.Gender, p.Phone, p.Address, p.BloodType,
		p.Allergies, p.EmergencyContact, p.EmergencyContactPhone, p.IsWalkin,
	).Scan(&p.ID, &p.CreatedAt, &p.UpdatedAt)
}

func (r *PatientRepository) Update(p *model.Patient) error {
	query := \`
		UPDATE patients
		SET full_name = $2, phone = $3, address = $4,
		    blood_type = $5, allergies = $6,
		    emergency_contact = $7, emergency_contact_phone = $8,
		    updated_at = NOW()
		WHERE id = $1
	\`
	_, err := r.db.Exec(query, p.ID, p.FullName, p.Phone, p.Address,
		p.BloodType, p.Allergies, p.EmergencyContact, p.EmergencyContactPhone)
	return err
}`;

// ---- internal/repository/medical_record_repo.go ----
export const repoMedicalRecord = `package repository

import (
	"database/sql"
	"fmt"

	"github.com/google/uuid"

	"klinik-erp/internal/model"
)

type MedicalRecordRepository struct {
	db *sql.DB
}

func NewMedicalRecordRepository(db *sql.DB) *MedicalRecordRepository {
	return &MedicalRecordRepository{db: db}
}

func (r *MedicalRecordRepository) FindAll() ([]model.MedicalRecord, error) {
	query := \`
		SELECT mr.id, mr.appointment_id, mr.patient_id, mr.doctor_id,
		       mr.nurse_id, mr.visit_date, mr.subjective, mr.objective,
		       mr.assessment, mr.plan, mr.vital_signs, mr.icd_code,
		       mr.status, mr.created_at, mr.updated_at,
		       p.full_name as patient_name, u.full_name as doctor_name
		FROM medical_records mr
		JOIN patients p ON mr.patient_id = p.id
		JOIN users u ON mr.doctor_id = u.id
		ORDER BY mr.visit_date DESC
	\`
	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var records []model.MedicalRecord
	for rows.Next() {
		var m model.MedicalRecord
		err := rows.Scan(
			&m.ID, &m.AppointmentID, &m.PatientID, &m.DoctorID,
			&m.NurseID, &m.VisitDate, &m.Subjective, &m.Objective,
			&m.Assessment, &m.Plan, &m.VitalSigns, &m.ICDCode,
			&m.Status, &m.CreatedAt, &m.UpdatedAt,
			&m.PatientName, &m.DoctorName,
		)
		if err != nil {
			return nil, err
		}
		records = append(records, m)
	}
	return records, nil
}

func (r *MedicalRecordRepository) FindByID(id uuid.UUID) (*model.MedicalRecord, error) {
	query := \`
		SELECT mr.id, mr.appointment_id, mr.patient_id, mr.doctor_id,
		       mr.nurse_id, mr.visit_date, mr.subjective, mr.objective,
		       mr.assessment, mr.plan, mr.vital_signs, mr.icd_code,
		       mr.status, mr.created_at, mr.updated_at,
		       p.full_name as patient_name, u.full_name as doctor_name
		FROM medical_records mr
		JOIN patients p ON mr.patient_id = p.id
		JOIN users u ON mr.doctor_id = u.id
		WHERE mr.id = $1
	\`
	m := &model.MedicalRecord{}
	err := r.db.QueryRow(query, id).Scan(
		&m.ID, &m.AppointmentID, &m.PatientID, &m.DoctorID,
		&m.NurseID, &m.VisitDate, &m.Subjective, &m.Objective,
		&m.Assessment, &m.Plan, &m.VitalSigns, &m.ICDCode,
		&m.Status, &m.CreatedAt, &m.UpdatedAt,
		&m.PatientName, &m.DoctorName,
	)
	if err != nil {
		return nil, fmt.Errorf("medical record not found: %w", err)
	}
	return m, nil
}

// FindByDoctorID mengambil rekam medis berdasarkan dokter (data isolation)
func (r *MedicalRecordRepository) FindByDoctorID(doctorID uuid.UUID) ([]model.MedicalRecord, error) {
	query := \`
		SELECT mr.id, mr.appointment_id, mr.patient_id, mr.doctor_id,
		       mr.nurse_id, mr.visit_date, mr.subjective, mr.objective,
		       mr.assessment, mr.plan, mr.vital_signs, mr.icd_code,
		       mr.status, mr.created_at, mr.updated_at,
		       p.full_name as patient_name, u.full_name as doctor_name
		FROM medical_records mr
		JOIN patients p ON mr.patient_id = p.id
		JOIN users u ON mr.doctor_id = u.id
		WHERE mr.doctor_id = $1
		ORDER BY mr.visit_date DESC
	\`
	rows, err := r.db.Query(query, doctorID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var records []model.MedicalRecord
	for rows.Next() {
		var m model.MedicalRecord
		err := rows.Scan(
			&m.ID, &m.AppointmentID, &m.PatientID, &m.DoctorID,
			&m.NurseID, &m.VisitDate, &m.Subjective, &m.Objective,
			&m.Assessment, &m.Plan, &m.VitalSigns, &m.ICDCode,
			&m.Status, &m.CreatedAt, &m.UpdatedAt,
			&m.PatientName, &m.DoctorName,
		)
		if err != nil {
			return nil, err
		}
		records = append(records, m)
	}
	return records, nil
}

func (r *MedicalRecordRepository) Create(m *model.MedicalRecord) error {
	query := \`
		INSERT INTO medical_records (
			appointment_id, patient_id, doctor_id, nurse_id,
			visit_date, subjective, objective, assessment, plan,
			vital_signs, icd_code, status
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
		RETURNING id, created_at, updated_at
	\`
	return r.db.QueryRow(
		query, m.AppointmentID, m.PatientID, m.DoctorID, m.NurseID,
		m.VisitDate, m.Subjective, m.Objective, m.Assessment, m.Plan,
		m.VitalSigns, m.ICDCode, m.Status,
	).Scan(&m.ID, &m.CreatedAt, &m.UpdatedAt)
}

func (r *MedicalRecordRepository) Update(m *model.MedicalRecord) error {
	query := \`
		UPDATE medical_records
		SET subjective = $2, objective = $3, assessment = $4, plan = $5,
		    vital_signs = $6, icd_code = $7, status = $8, updated_at = NOW()
		WHERE id = $1
	\`
	_, err := r.db.Exec(query, m.ID, m.Subjective, m.Objective, m.Assessment,
		m.Plan, m.VitalSigns, m.ICDCode, m.Status)
	return err
}`;

// ---- internal/repository/pharmacy_repo.go ----
export const repoPharmacy = `package repository

import (
	"database/sql"
	"fmt"

	"github.com/google/uuid"

	"klinik-erp/internal/model"
)

type PharmacyRepository struct {
	db *sql.DB
}

func NewPharmacyRepository(db *sql.DB) *PharmacyRepository {
	return &PharmacyRepository{db: db}
}

func (r *PharmacyRepository) FindAllItems() ([]model.PharmacyItem, error) {
	query := \`
		SELECT id, name, sku, category, description, unit,
		       stock, min_stock, buy_price, sell_price,
		       expiry_date, manufacturer, is_active,
		       created_at, updated_at
		FROM pharmacy_items
		WHERE is_active = true
		ORDER BY name ASC
	\`
	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []model.PharmacyItem
	for rows.Next() {
		var i model.PharmacyItem
		err := rows.Scan(
			&i.ID, &i.Name, &i.SKU, &i.Category, &i.Description,
			&i.Unit, &i.Stock, &i.MinStock, &i.BuyPrice, &i.SellPrice,
			&i.ExpiryDate, &i.Manufacturer, &i.IsActive,
			&i.CreatedAt, &i.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	return items, nil
}

func (r *PharmacyRepository) FindItemByID(id uuid.UUID) (*model.PharmacyItem, error) {
	query := \`
		SELECT id, name, sku, category, description, unit,
		       stock, min_stock, buy_price, sell_price,
		       expiry_date, manufacturer, is_active,
		       created_at, updated_at
		FROM pharmacy_items
		WHERE id = $1
	\`
	i := &model.PharmacyItem{}
	err := r.db.QueryRow(query, id).Scan(
		&i.ID, &i.Name, &i.SKU, &i.Category, &i.Description,
		&i.Unit, &i.Stock, &i.MinStock, &i.BuyPrice, &i.SellPrice,
		&i.ExpiryDate, &i.Manufacturer, &i.IsActive,
		&i.CreatedAt, &i.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("pharmacy item not found: %w", err)
	}
	return i, nil
}

func (r *PharmacyRepository) CreateItem(item *model.PharmacyItem) error {
	query := \`
		INSERT INTO pharmacy_items (
			name, sku, category, description, unit,
			stock, min_stock, buy_price, sell_price,
			expiry_date, manufacturer
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
		RETURNING id, created_at, updated_at
	\`
	return r.db.QueryRow(
		query, item.Name, item.SKU, item.Category, item.Description,
		item.Unit, item.Stock, item.MinStock, item.BuyPrice, item.SellPrice,
		item.ExpiryDate, item.Manufacturer,
	).Scan(&item.ID, &item.CreatedAt, &item.UpdatedAt)
}

func (r *PharmacyRepository) UpdateItem(item *model.PharmacyItem) error {
	query := \`
		UPDATE pharmacy_items
		SET name = $2, category = $3, unit = $4, stock = $5,
		    min_stock = $6, buy_price = $7, sell_price = $8,
		    expiry_date = $9, manufacturer = $10, is_active = $11,
		    updated_at = NOW()
		WHERE id = $1
	\`
	_, err := r.db.Exec(query, item.ID, item.Name, item.Category, item.Unit,
		item.Stock, item.MinStock, item.BuyPrice, item.SellPrice,
		item.ExpiryDate, item.Manufacturer, item.IsActive)
	return err
}

// UpdateStock mengupdate stok dan mencatat ke stock_ledger (transactional)
func (r *PharmacyRepository) UpdateStock(itemID, userID uuid.UUID, stockType string, qty int, notes string) error {
	tx, err := r.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// Update stock
	var updateQuery string
	if stockType == "in" {
		updateQuery = \`UPDATE pharmacy_items SET stock = stock + $2, updated_at = NOW() WHERE id = $1\`
	} else if stockType == "out" {
		updateQuery = \`UPDATE pharmacy_items SET stock = stock - $2, updated_at = NOW() WHERE id = $1 AND stock >= $2\`
	} else {
		updateQuery = \`UPDATE pharmacy_items SET stock = $2, updated_at = NOW() WHERE id = $1\`
	}

	result, err := tx.Exec(updateQuery, itemID, qty)
	if err != nil {
		return err
	}
	affected, _ := result.RowsAffected()
	if affected == 0 {
		return fmt.Errorf("insufficient stock or item not found")
	}

	// Insert stock ledger
	ledgerQuery := \`
		INSERT INTO stock_ledger (pharmacy_item_id, user_id, type, quantity, notes)
		VALUES ($1, $2, $3, $4, $5)
	\`
	_, err = tx.Exec(ledgerQuery, itemID, userID, stockType, qty, notes)
	if err != nil {
		return err
	}

	return tx.Commit()
}

func (r *PharmacyRepository) GetStockLedger(itemID *uuid.UUID) ([]model.StockLedger, error) {
	query := \`
		SELECT sl.id, sl.pharmacy_item_id, sl.user_id, sl.type,
		       sl.quantity, sl.reference_type, sl.reference_id,
		       sl.notes, sl.created_at,
		       pi.name as item_name, u.full_name as user_name
		FROM stock_ledger sl
		JOIN pharmacy_items pi ON sl.pharmacy_item_id = pi.id
		JOIN users u ON sl.user_id = u.id
	\`
	var args []interface{}
	if itemID != nil {
		query += " WHERE sl.pharmacy_item_id = $1"
		args = append(args, *itemID)
	}
	query += " ORDER BY sl.created_at DESC LIMIT 100"

	rows, err := r.db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var ledgers []model.StockLedger
	for rows.Next() {
		var l model.StockLedger
		err := rows.Scan(
			&l.ID, &l.PharmacyItemID, &l.UserID, &l.Type,
			&l.Quantity, &l.ReferenceType, &l.ReferenceID,
			&l.Notes, &l.CreatedAt,
			&l.ItemName, &l.UserName,
		)
		if err != nil {
			return nil, err
		}
		ledgers = append(ledgers, l)
	}
	return ledgers, nil
}`;

// ---- internal/repository/billing_repo.go ----
export const repoBilling = `package repository

import (
	"database/sql"
	"fmt"
	"time"

	"github.com/google/uuid"

	"klinik-erp/internal/model"
)

type BillingRepository struct {
	db *sql.DB
}

func NewBillingRepository(db *sql.DB) *BillingRepository {
	return &BillingRepository{db: db}
}

func (r *BillingRepository) FindAll() ([]model.BillingTransaction, error) {
	query := \`
		SELECT bt.id, bt.medical_record_id, bt.patient_id, bt.cashier_id,
		       bt.invoice_number, bt.doctor_fee, bt.medicine_cost,
		       bt.admin_fee, bt.discount, bt.tax, bt.total,
		       bt.payment_method, bt.status, bt.paid_at, bt.notes,
		       bt.created_at, bt.updated_at,
		       p.full_name as patient_name,
		       COALESCE(u.full_name, '') as cashier_name
		FROM billing_transactions bt
		JOIN patients p ON bt.patient_id = p.id
		LEFT JOIN users u ON bt.cashier_id = u.id
		ORDER BY bt.created_at DESC
	\`
	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var bills []model.BillingTransaction
	for rows.Next() {
		var b model.BillingTransaction
		err := rows.Scan(
			&b.ID, &b.MedicalRecordID, &b.PatientID, &b.CashierID,
			&b.InvoiceNumber, &b.DoctorFee, &b.MedicineCost,
			&b.AdminFee, &b.Discount, &b.Tax, &b.Total,
			&b.PaymentMethod, &b.Status, &b.PaidAt, &b.Notes,
			&b.CreatedAt, &b.UpdatedAt,
			&b.PatientName, &b.CashierName,
		)
		if err != nil {
			return nil, err
		}
		bills = append(bills, b)
	}
	return bills, nil
}

func (r *BillingRepository) Create(b *model.BillingTransaction) error {
	// Auto-generate invoice number
	b.InvoiceNumber = fmt.Sprintf("INV-%s-%04d",
		time.Now().Format("20060102"), time.Now().UnixNano()%10000)

	// Calculate total
	b.Total = b.DoctorFee + b.MedicineCost + b.AdminFee + b.Tax - b.Discount

	query := \`
		INSERT INTO billing_transactions (
			medical_record_id, patient_id, cashier_id,
			invoice_number, doctor_fee, medicine_cost,
			admin_fee, discount, tax, total,
			payment_method, status, notes
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
		RETURNING id, created_at, updated_at
	\`
	return r.db.QueryRow(
		query, b.MedicalRecordID, b.PatientID, b.CashierID,
		b.InvoiceNumber, b.DoctorFee, b.MedicineCost,
		b.AdminFee, b.Discount, b.Tax, b.Total,
		b.PaymentMethod, "unpaid", b.Notes,
	).Scan(&b.ID, &b.CreatedAt, &b.UpdatedAt)
}

func (r *BillingRepository) ProcessPayment(id, cashierID uuid.UUID, paymentMethod string) error {
	query := \`
		UPDATE billing_transactions
		SET status = 'paid', cashier_id = $2,
		    payment_method = $3, paid_at = NOW(), updated_at = NOW()
		WHERE id = $1 AND status = 'unpaid'
	\`
	result, err := r.db.Exec(query, id, cashierID, paymentMethod)
	if err != nil {
		return err
	}
	affected, _ := result.RowsAffected()
	if affected == 0 {
		return fmt.Errorf("billing not found or already paid")
	}
	return nil
}`;

// ---- internal/service/auth_service.go ----
export const serviceAuth = `package service

import (
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"

	"klinik-erp/internal/model"
	"klinik-erp/internal/repository"
)

type AuthService struct {
	userRepo  *repository.UserRepository
	jwtSecret string
}

func NewAuthService(userRepo *repository.UserRepository, jwtSecret string) *AuthService {
	return &AuthService{
		userRepo:  userRepo,
		jwtSecret: jwtSecret,
	}
}

// Login memvalidasi credentials dan menghasilkan JWT token
func (s *AuthService) Login(req model.LoginRequest) (*model.LoginResponse, error) {
	// Cari user berdasarkan username
	user, err := s.userRepo.FindByUsername(req.Username)
	if err != nil {
		return nil, fmt.Errorf("invalid username or password")
	}

	// Verifikasi password
	if err := bcrypt.CompareHashAndPassword(
		[]byte(user.PasswordHash), []byte(req.Password),
	); err != nil {
		return nil, fmt.Errorf("invalid username or password")
	}

	// Cek apakah user aktif
	if !user.IsActive {
		return nil, fmt.Errorf("account is deactivated")
	}

	// Generate JWT token
	token, err := s.generateToken(user)
	if err != nil {
		return nil, fmt.Errorf("failed to generate token: %w", err)
	}

	return &model.LoginResponse{
		Token: token,
		User:  user.ToResponse(),
	}, nil
}

// Register mendaftarkan user baru (default role: Pasien)
func (s *AuthService) Register(req model.RegisterRequest) (*model.LoginResponse, error) {
	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword(
		[]byte(req.Password), bcrypt.DefaultCost,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password: %w", err)
	}

	// Get role "Pasien" sebagai default
	role, err := s.userRepo.GetRoleByName("Pasien")
	if err != nil {
		return nil, fmt.Errorf("default role not found: %w", err)
	}

	// Create user
	user := &model.User{
		RoleID:       role.ID,
		Username:     req.Username,
		Email:        req.Email,
		PasswordHash: string(hashedPassword),
		FullName:     req.FullName,
		Phone:        &req.Phone,
		IsActive:     true,
	}

	if err := s.userRepo.Create(user); err != nil {
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	// Set role name untuk response
	user.RoleName = role.Name

	// Generate token
	token, err := s.generateToken(user)
	if err != nil {
		return nil, fmt.Errorf("failed to generate token: %w", err)
	}

	return &model.LoginResponse{
		Token: token,
		User:  user.ToResponse(),
	}, nil
}

// generateToken membuat JWT token dengan claims user_id dan role
func (s *AuthService) generateToken(user *model.User) (string, error) {
	claims := jwt.MapClaims{
		"user_id": user.ID.String(),
		"role":    user.RoleName,
		"exp":     time.Now().Add(24 * time.Hour).Unix(),
		"iat":     time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.jwtSecret))
}`;

// ---- internal/service/patient_service.go ----
export const servicePatient = `package service

import (
	"fmt"
	"time"

	"github.com/google/uuid"

	"klinik-erp/internal/model"
	"klinik-erp/internal/repository"
)

type PatientService struct {
	patientRepo *repository.PatientRepository
}

func NewPatientService(patientRepo *repository.PatientRepository) *PatientService {
	return &PatientService{patientRepo: patientRepo}
}

func (s *PatientService) GetAll() ([]model.Patient, error) {
	return s.patientRepo.FindAll()
}

func (s *PatientService) GetByID(id uuid.UUID) (*model.Patient, error) {
	return s.patientRepo.FindByID(id)
}

func (s *PatientService) Create(req model.CreatePatientRequest) (*model.Patient, error) {
	dob, err := time.Parse("2006-01-02", req.DateOfBirth)
	if err != nil {
		return nil, fmt.Errorf("invalid date format, use YYYY-MM-DD")
	}

	patient := &model.Patient{
		NIK:                   req.NIK,
		FullName:              req.FullName,
		DateOfBirth:           dob,
		Gender:                req.Gender,
		Phone:                 req.Phone,
		Address:               req.Address,
		BloodType:             req.BloodType,
		Allergies:             req.Allergies,
		EmergencyContact:      req.EmergencyContact,
		EmergencyContactPhone: req.EmergencyContactPhone,
		IsWalkin:              req.IsWalkin,
	}

	if err := s.patientRepo.Create(patient); err != nil {
		return nil, fmt.Errorf("failed to create patient: %w", err)
	}

	return patient, nil
}

func (s *PatientService) Update(id uuid.UUID, req model.UpdatePatientRequest) (*model.Patient, error) {
	patient, err := s.patientRepo.FindByID(id)
	if err != nil {
		return nil, err
	}

	if req.FullName != nil {
		patient.FullName = *req.FullName
	}
	if req.Phone != nil {
		patient.Phone = req.Phone
	}
	if req.Address != nil {
		patient.Address = req.Address
	}
	if req.BloodType != nil {
		patient.BloodType = req.BloodType
	}
	if req.Allergies != nil {
		patient.Allergies = req.Allergies
	}
	if req.EmergencyContact != nil {
		patient.EmergencyContact = req.EmergencyContact
	}
	if req.EmergencyContactPhone != nil {
		patient.EmergencyContactPhone = req.EmergencyContactPhone
	}

	if err := s.patientRepo.Update(patient); err != nil {
		return nil, fmt.Errorf("failed to update patient: %w", err)
	}

	return patient, nil
}`;

// ---- internal/service/medical_record_service.go ----
export const serviceMedicalRecord = `package service

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/google/uuid"

	"klinik-erp/internal/model"
	"klinik-erp/internal/repository"
)

type MedicalRecordService struct {
	recordRepo *repository.MedicalRecordRepository
}

func NewMedicalRecordService(repo *repository.MedicalRecordRepository) *MedicalRecordService {
	return &MedicalRecordService{recordRepo: repo}
}

func (s *MedicalRecordService) GetAll(role string, userID uuid.UUID) ([]model.MedicalRecord, error) {
	// Data isolation: Dokter hanya melihat rekam medis pasiennya sendiri
	if role == "Dokter" {
		return s.recordRepo.FindByDoctorID(userID)
	}
	// Admin dan Perawat bisa melihat semua
	return s.recordRepo.FindAll()
}

func (s *MedicalRecordService) GetByID(id uuid.UUID) (*model.MedicalRecord, error) {
	return s.recordRepo.FindByID(id)
}

func (s *MedicalRecordService) Create(
	doctorID uuid.UUID,
	req model.CreateMedicalRecordRequest,
) (*model.MedicalRecord, error) {
	vitalSignsJSON, _ := json.Marshal(req.VitalSigns)

	record := &model.MedicalRecord{
		AppointmentID: req.AppointmentID,
		PatientID:     req.PatientID,
		DoctorID:      doctorID,
		NurseID:       req.NurseID,
		VisitDate:     time.Now(),
		Subjective:    req.Subjective,
		Objective:     req.Objective,
		Assessment:    req.Assessment,
		Plan:          req.Plan,
		VitalSigns:    vitalSignsJSON,
		ICDCode:       req.ICDCode,
		Status:        "draft",
	}

	if err := s.recordRepo.Create(record); err != nil {
		return nil, fmt.Errorf("failed to create medical record: %w", err)
	}

	return record, nil
}

func (s *MedicalRecordService) Update(
	id uuid.UUID,
	doctorID uuid.UUID,
	req model.UpdateMedicalRecordRequest,
) (*model.MedicalRecord, error) {
	record, err := s.recordRepo.FindByID(id)
	if err != nil {
		return nil, err
	}

	// Verifikasi ownership: hanya dokter yang membuat boleh mengupdate
	if record.DoctorID != doctorID {
		return nil, fmt.Errorf("unauthorized: you can only edit your own records")
	}

	// Cek status: finalized tidak bisa diubah
	if record.Status == "finalized" {
		return nil, fmt.Errorf("record already finalized, cannot be modified")
	}

	if req.Subjective != nil {
		record.Subjective = *req.Subjective
	}
	if req.Objective != nil {
		record.Objective = *req.Objective
	}
	if req.Assessment != nil {
		record.Assessment = *req.Assessment
	}
	if req.Plan != nil {
		record.Plan = *req.Plan
	}
	if req.VitalSigns != nil {
		vitalJSON, _ := json.Marshal(req.VitalSigns)
		record.VitalSigns = vitalJSON
	}
	if req.ICDCode != nil {
		record.ICDCode = req.ICDCode
	}
	if req.Status != nil {
		record.Status = *req.Status
	}

	if err := s.recordRepo.Update(record); err != nil {
		return nil, fmt.Errorf("failed to update record: %w", err)
	}

	return record, nil
}`;

// ---- internal/handler/auth_handler.go ----
export const handlerAuth = `package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"klinik-erp/internal/model"
	"klinik-erp/internal/service"
)

type AuthHandler struct {
	authService *service.AuthService
}

func NewAuthHandler(authService *service.AuthService) *AuthHandler {
	return &AuthHandler{authService: authService}
}

// Login godoc
// @Summary Login user
// @Description Authenticate user and return JWT token
// @Tags Auth
// @Accept json
// @Produce json
// @Param request body model.LoginRequest true "Login credentials"
// @Success 200 {object} model.LoginResponse
// @Router /api/auth/login [post]
func (h *AuthHandler) Login(c *gin.Context) {
	var req model.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid request: " + err.Error(),
		})
		return
	}

	response, err := h.authService.Login(req)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    response,
	})
}

// Register godoc
// @Summary Register new patient
// @Description Register new patient account
// @Tags Auth
// @Accept json
// @Produce json
// @Param request body model.RegisterRequest true "Registration data"
// @Success 201 {object} model.LoginResponse
// @Router /api/auth/register [post]
func (h *AuthHandler) Register(c *gin.Context) {
	var req model.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid request: " + err.Error(),
		})
		return
	}

	response, err := h.authService.Register(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"data":    response,
	})
}`;

// ---- internal/handler/patient_handler.go ----
export const handlerPatient = `package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"klinik-erp/internal/model"
	"klinik-erp/internal/service"
)

type PatientHandler struct {
	patientService *service.PatientService
}

func NewPatientHandler(svc *service.PatientService) *PatientHandler {
	return &PatientHandler{patientService: svc}
}

// GetPatients godoc
// @Summary List all patients
// @Tags Patients
// @Security BearerAuth
// @Produce json
// @Success 200 {array} model.Patient
// @Router /api/patients [get]
func (h *PatientHandler) GetPatients(c *gin.Context) {
	patients, err := h.patientService.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    patients,
		"count":   len(patients),
	})
}

// GetPatient godoc
// @Summary Get patient by ID
// @Tags Patients
// @Security BearerAuth
// @Param id path string true "Patient UUID"
// @Produce json
// @Success 200 {object} model.Patient
// @Router /api/patients/{id} [get]
func (h *PatientHandler) GetPatient(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid patient ID",
		})
		return
	}

	patient, err := h.patientService.GetByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    patient,
	})
}

// CreatePatient godoc
// @Summary Register new patient
// @Tags Patients
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param request body model.CreatePatientRequest true "Patient data"
// @Success 201 {object} model.Patient
// @Router /api/patients [post]
func (h *PatientHandler) CreatePatient(c *gin.Context) {
	var req model.CreatePatientRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid request: " + err.Error(),
		})
		return
	}

	patient, err := h.patientService.Create(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"data":    patient,
	})
}

// UpdatePatient godoc
// @Summary Update patient data
// @Tags Patients
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param id path string true "Patient UUID"
// @Param request body model.UpdatePatientRequest true "Updated data"
// @Success 200 {object} model.Patient
// @Router /api/patients/{id} [put]
func (h *PatientHandler) UpdatePatient(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid patient ID",
		})
		return
	}

	var req model.UpdatePatientRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid request: " + err.Error(),
		})
		return
	}

	patient, err := h.patientService.Update(id, req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    patient,
	})
}`;

// ---- internal/handler/medical_record_handler.go ----
export const handlerMedicalRecord = `package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"klinik-erp/internal/model"
	"klinik-erp/internal/service"
)

type MedicalRecordHandler struct {
	recordService *service.MedicalRecordService
}

func NewMedicalRecordHandler(svc *service.MedicalRecordService) *MedicalRecordHandler {
	return &MedicalRecordHandler{recordService: svc}
}

// GetMedicalRecords — Dokter hanya melihat milik sendiri, Perawat/Admin melihat semua
func (h *MedicalRecordHandler) GetMedicalRecords(c *gin.Context) {
	role := c.GetString("role")
	userIDStr := c.GetString("user_id")
	userID, _ := uuid.Parse(userIDStr)

	records, err := h.recordService.GetAll(role, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    records,
		"count":   len(records),
	})
}

func (h *MedicalRecordHandler) GetMedicalRecord(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid ID format",
		})
		return
	}

	record, err := h.recordService.GetByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    record,
	})
}

// CreateMedicalRecord — HANYA DOKTER yang bisa membuat rekam medis
func (h *MedicalRecordHandler) CreateMedicalRecord(c *gin.Context) {
	doctorIDStr := c.GetString("user_id")
	doctorID, _ := uuid.Parse(doctorIDStr)

	var req model.CreateMedicalRecordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid request: " + err.Error(),
		})
		return
	}

	record, err := h.recordService.Create(doctorID, req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"data":    record,
		"message": "Medical record created (SOAP)",
	})
}

func (h *MedicalRecordHandler) UpdateMedicalRecord(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid ID format",
		})
		return
	}

	doctorIDStr := c.GetString("user_id")
	doctorID, _ := uuid.Parse(doctorIDStr)

	var req model.UpdateMedicalRecordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid request: " + err.Error(),
		})
		return
	}

	record, err := h.recordService.Update(id, doctorID, req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    record,
	})
}`;

// ---- internal/handler/pharmacy_handler.go ----
export const handlerPharmacy = `package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"klinik-erp/internal/model"
	"klinik-erp/internal/repository"
)

type PharmacyHandler struct {
	pharmacyRepo *repository.PharmacyRepository
}

func NewPharmacyHandler(repo *repository.PharmacyRepository) *PharmacyHandler {
	return &PharmacyHandler{pharmacyRepo: repo}
}

func (h *PharmacyHandler) GetPharmacyItems(c *gin.Context) {
	items, err := h.pharmacyRepo.FindAllItems()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    items,
		"count":   len(items),
	})
}

func (h *PharmacyHandler) CreatePharmacyItem(c *gin.Context) {
	var req model.CreatePharmacyItemRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	item := &model.PharmacyItem{
		Name:     req.Name,
		SKU:      req.SKU,
		Category: req.Category,
		Unit:     req.Unit,
		Stock:    req.Stock,
		MinStock: req.MinStock,
		BuyPrice: req.BuyPrice,
		SellPrice: req.SellPrice,
	}

	if err := h.pharmacyRepo.CreateItem(item); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"data":    item,
	})
}

func (h *PharmacyHandler) UpdatePharmacyItem(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid ID",
		})
		return
	}

	item, err := h.pharmacyRepo.FindItemByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	var req model.UpdatePharmacyItemRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	if req.Name != nil { item.Name = *req.Name }
	if req.Category != nil { item.Category = req.Category }
	if req.Unit != nil { item.Unit = *req.Unit }
	if req.Stock != nil { item.Stock = *req.Stock }
	if req.MinStock != nil { item.MinStock = *req.MinStock }
	if req.BuyPrice != nil { item.BuyPrice = *req.BuyPrice }
	if req.SellPrice != nil { item.SellPrice = *req.SellPrice }
	if req.IsActive != nil { item.IsActive = *req.IsActive }

	if err := h.pharmacyRepo.UpdateItem(item); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    item,
	})
}

func (h *PharmacyHandler) GetStockLedger(c *gin.Context) {
	var itemID *uuid.UUID
	if idStr := c.Query("item_id"); idStr != "" {
		id, err := uuid.Parse(idStr)
		if err == nil {
			itemID = &id
		}
	}

	ledgers, err := h.pharmacyRepo.GetStockLedger(itemID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    ledgers,
	})
}`;

// ---- internal/handler/billing_handler.go ----
export const handlerBilling = `package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"klinik-erp/internal/model"
	"klinik-erp/internal/repository"
)

type BillingHandler struct {
	billingRepo *repository.BillingRepository
}

func NewBillingHandler(repo *repository.BillingRepository) *BillingHandler {
	return &BillingHandler{billingRepo: repo}
}

func (h *BillingHandler) GetBillingTransactions(c *gin.Context) {
	bills, err := h.billingRepo.FindAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    bills,
		"count":   len(bills),
	})
}

func (h *BillingHandler) CreateBilling(c *gin.Context) {
	cashierIDStr := c.GetString("user_id")
	cashierID, _ := uuid.Parse(cashierIDStr)

	var req model.CreateBillingRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	bill := &model.BillingTransaction{
		MedicalRecordID: req.MedicalRecordID,
		PatientID:       req.PatientID,
		CashierID:       &cashierID,
		DoctorFee:       req.DoctorFee,
		MedicineCost:    req.MedicineCost,
		AdminFee:        req.AdminFee,
		Discount:        req.Discount,
		Tax:             req.Tax,
		PaymentMethod:   req.PaymentMethod,
		Notes:           req.Notes,
	}

	if err := h.billingRepo.Create(bill); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"data":    bill,
	})
}

func (h *BillingHandler) ProcessPayment(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid billing ID",
		})
		return
	}

	cashierIDStr := c.GetString("user_id")
	cashierID, _ := uuid.Parse(cashierIDStr)

	var req model.ProcessPaymentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	if err := h.billingRepo.ProcessPayment(id, cashierID, req.PaymentMethod); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Payment processed successfully",
	})
}`;

// ---- cmd/main.go (FULL version with DI) ----
export const mainGoFull = `package main

import (
	"database/sql"
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	_ "github.com/lib/pq"

	"klinik-erp/internal/config"
	"klinik-erp/internal/handler"
	mw "klinik-erp/internal/middleware"
	"klinik-erp/internal/repository"
	"klinik-erp/internal/service"
)

func main() {
	// Load configuration
	cfg := config.Load()

	// Connect to database
	db, err := sql.Open("postgres", cfg.DatabaseURL)
	if err != nil {
		log.Fatal("❌ Failed to connect to database:", err)
	}
	defer db.Close()

	// Verify connection
	if err := db.Ping(); err != nil {
		log.Fatal("❌ Database ping failed:", err)
	}
	log.Println("✅ Database connected successfully")

	// Run migrations automatically
	runMigrations(db)

	// ===== Dependency Injection =====
	// Repositories
	userRepo := repository.NewUserRepository(db)
	patientRepo := repository.NewPatientRepository(db)
	recordRepo := repository.NewMedicalRecordRepository(db)
	pharmacyRepo := repository.NewPharmacyRepository(db)
	billingRepo := repository.NewBillingRepository(db)

	// Services
	authService := service.NewAuthService(userRepo, cfg.JWTSecret)
	patientService := service.NewPatientService(patientRepo)
	recordService := service.NewMedicalRecordService(recordRepo)

	// Handlers
	authHandler := handler.NewAuthHandler(authService)
	patientHandler := handler.NewPatientHandler(patientService)
	recordHandler := handler.NewMedicalRecordHandler(recordService)
	pharmacyHandler := handler.NewPharmacyHandler(pharmacyRepo)
	billingHandler := handler.NewBillingHandler(billingRepo)

	// ===== Setup Gin Router =====
	gin.SetMode(cfg.GinMode)
	r := gin.Default()

	// CORS
	r.Use(mw.SetupCORS())

	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "healthy", "service": "klinik-erp"})
	})

	// ===== PUBLIC ROUTES =====
	r.POST("/api/auth/login", authHandler.Login)
	r.POST("/api/auth/register", authHandler.Register)

	// ===== PROTECTED ROUTES =====
	api := r.Group("/api")
	api.Use(mw.JWTAuth(cfg.JWTSecret))
	{
		// --- PATIENTS [Admin, Dokter, Perawat, Kasir] ---
		patients := api.Group("/patients")
		patients.Use(mw.AuthorizeRole("Admin", "Dokter", "Perawat", "Kasir"))
		{
			patients.GET("", patientHandler.GetPatients)
			patients.GET("/:id", patientHandler.GetPatient)
			patients.POST("", patientHandler.CreatePatient)
			patients.PUT("/:id", patientHandler.UpdatePatient)
		}

		// --- MEDICAL RECORDS [Dokter, Perawat] ---
		records := api.Group("/medical-records")
		records.Use(mw.AuthorizeRole("Dokter", "Perawat"))
		{
			records.GET("", recordHandler.GetMedicalRecords)
			records.GET("/:id", recordHandler.GetMedicalRecord)
			// POST dan PUT hanya untuk Dokter (nested middleware)
			records.POST("",
				mw.AuthorizeRole("Dokter"),
				recordHandler.CreateMedicalRecord,
			)
			records.PUT("/:id",
				mw.AuthorizeRole("Dokter"),
				recordHandler.UpdateMedicalRecord,
			)
		}

		// --- PHARMACY [Apoteker, Admin] ---
		pharmacy := api.Group("/pharmacy")
		pharmacy.Use(mw.AuthorizeRole("Apoteker", "Admin"))
		{
			pharmacy.GET("/items", pharmacyHandler.GetPharmacyItems)
			pharmacy.POST("/items", pharmacyHandler.CreatePharmacyItem)
			pharmacy.PUT("/items/:id", pharmacyHandler.UpdatePharmacyItem)
			pharmacy.GET("/stock-ledger", pharmacyHandler.GetStockLedger)
		}

		// --- BILLING [Kasir, Admin] ---
		billing := api.Group("/billing")
		billing.Use(mw.AuthorizeRole("Kasir", "Admin"))
		{
			billing.GET("", billingHandler.GetBillingTransactions)
			billing.POST("", billingHandler.CreateBilling)
			billing.PATCH("/:id/pay", billingHandler.ProcessPayment)
		}
	}

	// Start server
	port := cfg.Port
	log.Printf("🚀 Klinik ERP Backend running on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatal("❌ Server failed to start:", err)
	}
}

// runMigrations menjalankan migration.Up() otomatis saat startup
func runMigrations(db *sql.DB) {
	driver, err := postgres.WithInstance(db, &postgres.Config{})
	if err != nil {
		log.Fatal("❌ Migration driver error:", err)
	}

	migrationsPath := os.Getenv("MIGRATIONS_PATH")
	if migrationsPath == "" {
		migrationsPath = "file://db/migrations"
	}

	m, err := migrate.NewWithDatabaseInstance(migrationsPath, "postgres", driver)
	if err != nil {
		log.Fatal("❌ Migration init error:", err)
	}

	if err := m.Up(); err != nil && err != migrate.ErrNoChange {
		log.Fatal("❌ Migration error:", err)
	}

	log.Println("✅ Database migrations applied successfully")
}`;

// ---- db/migration.go ----
export const dbMigration = `package db

import (
	"database/sql"
	"log"
	"os"

	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
)

// RunMigrations menjalankan semua migration file
func RunMigrations(db *sql.DB) error {
	driver, err := postgres.WithInstance(db, &postgres.Config{})
	if err != nil {
		return err
	}

	migrationsPath := os.Getenv("MIGRATIONS_PATH")
	if migrationsPath == "" {
		migrationsPath = "file://db/migrations"
	}

	m, err := migrate.NewWithDatabaseInstance(migrationsPath, "postgres", driver)
	if err != nil {
		return err
	}

	if err := m.Up(); err != nil && err != migrate.ErrNoChange {
		return err
	}

	log.Println("✅ Migrations applied successfully")
	return nil
}

// RollbackMigrations melakukan rollback migration terakhir
func RollbackMigrations(db *sql.DB) error {
	driver, err := postgres.WithInstance(db, &postgres.Config{})
	if err != nil {
		return err
	}

	m, err := migrate.NewWithDatabaseInstance("file://db/migrations", "postgres", driver)
	if err != nil {
		return err
	}

	if err := m.Down(); err != nil && err != migrate.ErrNoChange {
		return err
	}

	log.Println("✅ Migration rollback completed")
	return nil
}

// MigrateToVersion menuju ke versi migration tertentu
func MigrateToVersion(db *sql.DB, version uint) error {
	driver, err := postgres.WithInstance(db, &postgres.Config{})
	if err != nil {
		return err
	}

	m, err := migrate.NewWithDatabaseInstance("file://db/migrations", "postgres", driver)
	if err != nil {
		return err
	}

	return m.Migrate(version)
}`;

// File tree for the project
export const fileTree = [
  { path: 'go.mod', category: 'root', description: 'Go module definition' },
  { path: 'cmd/main.go', category: 'entrypoint', description: 'Entry point, DI, router setup, auto-migration' },
  { path: 'internal/config/config.go', category: 'config', description: 'Environment variable configuration' },
  { path: 'internal/middleware/auth.go', category: 'middleware', description: 'JWT validation + RBAC authorization' },
  { path: 'internal/middleware/cors.go', category: 'middleware', description: 'CORS configuration' },
  { path: 'internal/model/auth.go', category: 'model', description: 'Auth request/response DTOs' },
  { path: 'internal/model/user.go', category: 'model', description: 'User & Role entities' },
  { path: 'internal/model/patient.go', category: 'model', description: 'Patient entity & DTOs' },
  { path: 'internal/model/appointment.go', category: 'model', description: 'Appointment entity & DTOs' },
  { path: 'internal/model/medical_record.go', category: 'model', description: 'Medical Record (SOAP) entity' },
  { path: 'internal/model/pharmacy.go', category: 'model', description: 'Pharmacy & Stock Ledger entities' },
  { path: 'internal/model/prescription.go', category: 'model', description: 'Prescription & items entities' },
  { path: 'internal/model/billing.go', category: 'model', description: 'Billing transaction entity' },
  { path: 'internal/model/staff_profile.go', category: 'model', description: 'Staff profile entity' },
  { path: 'internal/repository/user_repo.go', category: 'repository', description: 'User CRUD + role queries' },
  { path: 'internal/repository/patient_repo.go', category: 'repository', description: 'Patient CRUD operations' },
  { path: 'internal/repository/medical_record_repo.go', category: 'repository', description: 'Medical record CRUD + data isolation' },
  { path: 'internal/repository/pharmacy_repo.go', category: 'repository', description: 'Pharmacy CRUD + stock ledger (transactional)' },
  { path: 'internal/repository/billing_repo.go', category: 'repository', description: 'Billing CRUD + payment processing' },
  { path: 'internal/service/auth_service.go', category: 'service', description: 'Login, register, JWT generation' },
  { path: 'internal/service/patient_service.go', category: 'service', description: 'Patient business logic' },
  { path: 'internal/service/medical_record_service.go', category: 'service', description: 'Medical record + RBAC data isolation' },
  { path: 'internal/handler/auth_handler.go', category: 'handler', description: 'Auth HTTP handlers (login/register)' },
  { path: 'internal/handler/patient_handler.go', category: 'handler', description: 'Patient HTTP handlers' },
  { path: 'internal/handler/medical_record_handler.go', category: 'handler', description: 'Medical record HTTP handlers' },
  { path: 'internal/handler/pharmacy_handler.go', category: 'handler', description: 'Pharmacy HTTP handlers' },
  { path: 'internal/handler/billing_handler.go', category: 'handler', description: 'Billing HTTP handlers' },
  { path: 'db/migration.go', category: 'database', description: 'Migration runner utilities' },
  { path: 'db/migrations/000001_init.up.sql', category: 'database', description: 'Initial schema creation' },
  { path: 'db/migrations/000001_init.down.sql', category: 'database', description: 'Initial schema rollback' },
];

// Map of file path to code
export const fileCodeMap: Record<string, { code: string; language: string }> = {
  'go.mod': { code: goMod, language: 'Go' },
  'cmd/main.go': { code: mainGoFull, language: 'Go' },
  'internal/config/config.go': { code: configGo, language: 'Go' },
  'internal/middleware/auth.go': { code: middlewareAuth, language: 'Go' },
  'internal/middleware/cors.go': { code: middlewareCors, language: 'Go' },
  'internal/model/auth.go': { code: modelAuth, language: 'Go' },
  'internal/model/user.go': { code: modelUser, language: 'Go' },
  'internal/model/patient.go': { code: modelPatient, language: 'Go' },
  'internal/model/appointment.go': { code: modelAppointment, language: 'Go' },
  'internal/model/medical_record.go': { code: modelMedicalRecord, language: 'Go' },
  'internal/model/pharmacy.go': { code: modelPharmacy, language: 'Go' },
  'internal/model/prescription.go': { code: modelPrescription, language: 'Go' },
  'internal/model/billing.go': { code: modelBilling, language: 'Go' },
  'internal/model/staff_profile.go': { code: modelStaffProfile, language: 'Go' },
  'internal/repository/user_repo.go': { code: repoUser, language: 'Go' },
  'internal/repository/patient_repo.go': { code: repoPatient, language: 'Go' },
  'internal/repository/medical_record_repo.go': { code: repoMedicalRecord, language: 'Go' },
  'internal/repository/pharmacy_repo.go': { code: repoPharmacy, language: 'Go' },
  'internal/repository/billing_repo.go': { code: repoBilling, language: 'Go' },
  'internal/service/auth_service.go': { code: serviceAuth, language: 'Go' },
  'internal/service/patient_service.go': { code: servicePatient, language: 'Go' },
  'internal/service/medical_record_service.go': { code: serviceMedicalRecord, language: 'Go' },
  'internal/handler/auth_handler.go': { code: handlerAuth, language: 'Go' },
  'internal/handler/patient_handler.go': { code: handlerPatient, language: 'Go' },
  'internal/handler/medical_record_handler.go': { code: handlerMedicalRecord, language: 'Go' },
  'internal/handler/pharmacy_handler.go': { code: handlerPharmacy, language: 'Go' },
  'internal/handler/billing_handler.go': { code: handlerBilling, language: 'Go' },
  'db/migration.go': { code: dbMigration, language: 'Go' },
};
