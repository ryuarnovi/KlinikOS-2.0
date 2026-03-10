export const migrationUp = `-- =============================================
-- Klinik ERP: 000001_init.up.sql
-- Database Migration (PostgreSQL)
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. ROLES TABLE
-- =============================================
CREATE TABLE "roles" (
    "id"          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name"        VARCHAR(50) NOT NULL UNIQUE,
    "description" TEXT,
    "created_at"  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updated_at"  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed default roles
INSERT INTO "roles" ("name", "description") VALUES
    ('Admin',    'Administrator sistem dengan akses penuh'),
    ('Pasien',   'Pasien terdaftar yang bisa melihat rekam medis sendiri'),
    ('Dokter',   'Dokter yang melakukan pemeriksaan dan menulis resep'),
    ('Perawat',  'Perawat yang membantu proses pemeriksaan'),
    ('Apoteker', 'Apoteker yang mengelola stok obat dan menyiapkan resep'),
    ('Kasir',    'Kasir yang menangani pembayaran dan invoice');

-- =============================================
-- 2. USERS TABLE
-- =============================================
CREATE TABLE "users" (
    "id"            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "role_id"       UUID NOT NULL REFERENCES "roles"("id") ON DELETE RESTRICT,
    "username"      VARCHAR(100) NOT NULL UNIQUE,
    "email"         VARCHAR(255) NOT NULL UNIQUE,
    "password_hash" VARCHAR(255) NOT NULL,
    "full_name"     VARCHAR(255) NOT NULL,
    "phone"         VARCHAR(20),
    "is_active"     BOOLEAN DEFAULT TRUE,
    "last_login"    TIMESTAMP WITH TIME ZONE,
    "created_at"    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updated_at"    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX "idx_users_role_id" ON "users"("role_id");
CREATE INDEX "idx_users_email" ON "users"("email");

-- =============================================
-- 3. PATIENTS TABLE
-- Relasi 1:1 ke users (nullable untuk walk-in)
-- =============================================
CREATE TABLE "patients" (
    "id"             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "user_id"        UUID UNIQUE REFERENCES "users"("id") ON DELETE SET NULL,
    "nik"            VARCHAR(16) NOT NULL UNIQUE,
    "full_name"      VARCHAR(255) NOT NULL,
    "date_of_birth"  DATE NOT NULL,
    "gender"         VARCHAR(1) NOT NULL CHECK ("gender" IN ('L', 'P')),
    "phone"          VARCHAR(20),
    "address"        TEXT,
    "blood_type"     VARCHAR(3) CHECK ("blood_type" IN ('A','B','AB','O')),
    "allergies"      TEXT,
    "emergency_contact"      VARCHAR(255),
    "emergency_contact_phone" VARCHAR(20),
    "is_walkin"      BOOLEAN DEFAULT FALSE,
    "created_at"     TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updated_at"     TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX "idx_patients_user_id" ON "patients"("user_id");
CREATE INDEX "idx_patients_nik" ON "patients"("nik");

-- =============================================
-- 4. STAFF PROFILES TABLE
-- Spesialisasi Dokter, NIP Perawat/Apoteker
-- =============================================
CREATE TABLE "staff_profiles" (
    "id"              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "user_id"         UUID NOT NULL UNIQUE REFERENCES "users"("id") ON DELETE CASCADE,
    "nip"             VARCHAR(50) NOT NULL UNIQUE,
    "specialization"  VARCHAR(255),
    "license_number"  VARCHAR(100),
    "education"       VARCHAR(255),
    "join_date"       DATE DEFAULT CURRENT_DATE,
    "is_available"    BOOLEAN DEFAULT TRUE,
    "created_at"      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updated_at"      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX "idx_staff_profiles_user_id" ON "staff_profiles"("user_id");

-- =============================================
-- 5. APPOINTMENTS TABLE
-- Jadwal temu Pasien ↔ Dokter
-- =============================================
CREATE TABLE "appointments" (
    "id"               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "patient_id"       UUID NOT NULL REFERENCES "patients"("id") ON DELETE CASCADE,
    "doctor_id"        UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "appointment_date" DATE NOT NULL,
    "appointment_time" TIME NOT NULL,
    "end_time"         TIME,
    "status"           VARCHAR(20) NOT NULL DEFAULT 'scheduled'
                       CHECK ("status" IN ('scheduled','in_progress','completed','cancelled')),
    "complaint"        TEXT,
    "notes"            TEXT,
    "queue_number"     INTEGER,
    "created_at"       TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updated_at"       TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX "idx_appointments_patient_id" ON "appointments"("patient_id");
CREATE INDEX "idx_appointments_doctor_id" ON "appointments"("doctor_id");
CREATE INDEX "idx_appointments_date" ON "appointments"("appointment_date");

-- =============================================
-- 6. MEDICAL RECORDS TABLE (SOAP)
-- Rekam Medis dengan format SOAP
-- =============================================
CREATE TABLE "medical_records" (
    "id"             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "appointment_id" UUID REFERENCES "appointments"("id") ON DELETE SET NULL,
    "patient_id"     UUID NOT NULL REFERENCES "patients"("id") ON DELETE CASCADE,
    "doctor_id"      UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "nurse_id"       UUID REFERENCES "users"("id") ON DELETE SET NULL,
    "visit_date"     DATE NOT NULL DEFAULT CURRENT_DATE,
    "subjective"     TEXT NOT NULL,
    "objective"      TEXT NOT NULL,
    "assessment"     TEXT NOT NULL,
    "plan"           TEXT NOT NULL,
    "vital_signs"    JSONB DEFAULT '{}',
    "icd_code"       VARCHAR(20),
    "status"         VARCHAR(20) DEFAULT 'draft'
                     CHECK ("status" IN ('draft', 'finalized')),
    "created_at"     TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updated_at"     TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX "idx_medical_records_patient_id" ON "medical_records"("patient_id");
CREATE INDEX "idx_medical_records_doctor_id" ON "medical_records"("doctor_id");
CREATE INDEX "idx_medical_records_visit_date" ON "medical_records"("visit_date");

-- =============================================
-- 7. PHARMACY ITEMS TABLE
-- Stok Obat, Satuan, Harga
-- =============================================
CREATE TABLE "pharmacy_items" (
    "id"          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name"        VARCHAR(255) NOT NULL,
    "sku"         VARCHAR(50) NOT NULL UNIQUE,
    "category"    VARCHAR(100),
    "description" TEXT,
    "unit"        VARCHAR(50) NOT NULL,
    "stock"       INTEGER NOT NULL DEFAULT 0 CHECK ("stock" >= 0),
    "min_stock"   INTEGER DEFAULT 10,
    "buy_price"   DECIMAL(12,2) NOT NULL DEFAULT 0,
    "sell_price"  DECIMAL(12,2) NOT NULL DEFAULT 0,
    "expiry_date" DATE,
    "manufacturer" VARCHAR(255),
    "is_active"   BOOLEAN DEFAULT TRUE,
    "created_at"  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updated_at"  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX "idx_pharmacy_items_sku" ON "pharmacy_items"("sku");
CREATE INDEX "idx_pharmacy_items_category" ON "pharmacy_items"("category");

-- =============================================
-- 8. PRESCRIPTIONS TABLE
-- Resep Dokter → ditebus Apoteker
-- =============================================
CREATE TABLE "prescriptions" (
    "id"                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "medical_record_id" UUID NOT NULL REFERENCES "medical_records"("id") ON DELETE CASCADE,
    "doctor_id"         UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "pharmacist_id"     UUID REFERENCES "users"("id") ON DELETE SET NULL,
    "status"            VARCHAR(20) DEFAULT 'pending'
                        CHECK ("status" IN ('pending','prepared','dispensed','cancelled')),
    "notes"             TEXT,
    "dispensed_at"      TIMESTAMP WITH TIME ZONE,
    "created_at"        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updated_at"        TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX "idx_prescriptions_medical_record_id" ON "prescriptions"("medical_record_id");
CREATE INDEX "idx_prescriptions_doctor_id" ON "prescriptions"("doctor_id");

-- Prescription Items (Detail obat per resep)
CREATE TABLE "prescription_items" (
    "id"              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "prescription_id" UUID NOT NULL REFERENCES "prescriptions"("id") ON DELETE CASCADE,
    "pharmacy_item_id" UUID NOT NULL REFERENCES "pharmacy_items"("id") ON DELETE RESTRICT,
    "quantity"        INTEGER NOT NULL CHECK ("quantity" > 0),
    "dosage"          VARCHAR(255) NOT NULL,
    "frequency"       VARCHAR(100),
    "duration_days"   INTEGER,
    "notes"           TEXT,
    "created_at"      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX "idx_prescription_items_prescription_id" ON "prescription_items"("prescription_id");

-- =============================================
-- 9. BILLING TRANSACTIONS TABLE
-- Invoice oleh Kasir
-- =============================================
CREATE TABLE "billing_transactions" (
    "id"               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "medical_record_id" UUID REFERENCES "medical_records"("id") ON DELETE SET NULL,
    "patient_id"       UUID NOT NULL REFERENCES "patients"("id") ON DELETE CASCADE,
    "cashier_id"       UUID REFERENCES "users"("id") ON DELETE SET NULL,
    "invoice_number"   VARCHAR(50) NOT NULL UNIQUE,
    "doctor_fee"       DECIMAL(12,2) NOT NULL DEFAULT 0,
    "medicine_cost"    DECIMAL(12,2) NOT NULL DEFAULT 0,
    "admin_fee"        DECIMAL(12,2) NOT NULL DEFAULT 0,
    "discount"         DECIMAL(12,2) NOT NULL DEFAULT 0,
    "tax"              DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total"            DECIMAL(12,2) NOT NULL DEFAULT 0,
    "payment_method"   VARCHAR(20) DEFAULT 'cash'
                       CHECK ("payment_method" IN ('cash','debit','credit','bpjs','transfer')),
    "status"           VARCHAR(20) DEFAULT 'unpaid'
                       CHECK ("status" IN ('unpaid','paid','refunded','cancelled')),
    "paid_at"          TIMESTAMP WITH TIME ZONE,
    "notes"            TEXT,
    "created_at"       TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updated_at"       TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX "idx_billing_patient_id" ON "billing_transactions"("patient_id");
CREATE INDEX "idx_billing_invoice" ON "billing_transactions"("invoice_number");
CREATE INDEX "idx_billing_status" ON "billing_transactions"("status");

-- =============================================
-- 10. STOCK LEDGER (Audit trail stok obat)
-- =============================================
CREATE TABLE "stock_ledger" (
    "id"              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "pharmacy_item_id" UUID NOT NULL REFERENCES "pharmacy_items"("id") ON DELETE CASCADE,
    "user_id"         UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "type"            VARCHAR(10) NOT NULL CHECK ("type" IN ('in', 'out', 'adjust')),
    "quantity"        INTEGER NOT NULL,
    "reference_type"  VARCHAR(50),
    "reference_id"    UUID,
    "notes"           TEXT,
    "created_at"      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX "idx_stock_ledger_item" ON "stock_ledger"("pharmacy_item_id");
CREATE INDEX "idx_stock_ledger_date" ON "stock_ledger"("created_at");
`;

export const migrationDown = `-- =============================================
-- Klinik ERP: 000001_init.down.sql
-- Rollback Migration
-- Pastikan urutan drop benar (Child table dulu)
-- =============================================

DROP TABLE IF EXISTS "stock_ledger" CASCADE;
DROP TABLE IF EXISTS "billing_transactions" CASCADE;
DROP TABLE IF EXISTS "prescription_items" CASCADE;
DROP TABLE IF EXISTS "prescriptions" CASCADE;
DROP TABLE IF EXISTS "pharmacy_items" CASCADE;
DROP TABLE IF EXISTS "medical_records" CASCADE;
DROP TABLE IF EXISTS "appointments" CASCADE;
DROP TABLE IF EXISTS "staff_profiles" CASCADE;
DROP TABLE IF EXISTS "patients" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;
DROP TABLE IF EXISTS "roles" CASCADE;

DROP EXTENSION IF EXISTS "uuid-ossp";
`;

export const golangMiddleware = `package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

type Claims struct {
	UserID string \`json:"user_id"\`
	Role   string \`json:"role"\`
	jwt.RegisteredClaims
}

// JWTAuth extracts and validates JWT token from Authorization header
func JWTAuth(secretKey string) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Authorization header is required",
			})
			c.Abort()
			return
		}

		// Extract Bearer token
		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		if tokenString == authHeader {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Bearer token is required",
			})
			c.Abort()
			return
		}

		// Parse and validate token
		claims := &Claims{}
		token, err := jwt.ParseWithClaims(tokenString, claims,
			func(token *jwt.Token) (interface{}, error) {
				return []byte(secretKey), nil
			},
		)

		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Invalid or expired token",
			})
			c.Abort()
			return
		}

		// Set user info in context
		c.Set("user_id", claims.UserID)
		c.Set("role", claims.Role)
		c.Next()
	}
}

// AuthorizeRole restricts access to specific roles
func AuthorizeRole(allowedRoles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		userRole, exists := c.Get("role")
		if !exists {
			c.JSON(http.StatusForbidden, gin.H{
				"error": "Role not found in token",
			})
			c.Abort()
			return
		}

		roleStr, ok := userRole.(string)
		if !ok {
			c.JSON(http.StatusForbidden, gin.H{
				"error": "Invalid role format",
			})
			c.Abort()
			return
		}

		// Check if user's role is in the allowed list
		for _, allowed := range allowedRoles {
			if roleStr == allowed {
				c.Next()
				return
			}
		}

		c.JSON(http.StatusForbidden, gin.H{
			"error":    "Insufficient permissions",
			"required": allowedRoles,
			"current":  roleStr,
		})
		c.Abort()
	}
}`;

export const golangMain = `package main

import (
	"database/sql"
	"log"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	_ "github.com/lib/pq"
	
	"klinik-erp/internal/middleware"
	"klinik-erp/internal/handler"
)

func main() {
	// Database connection
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgres://postgres:postgres@db:5432/klinik_erp?sslmode=disable"
	}

	db, err := sql.Open("postgres", dbURL)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer db.Close()

	// Run migrations automatically
	runMigrations(db)

	// Setup Gin router
	r := gin.Default()

	// CORS
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "PATCH"},
		AllowHeaders:     []string{"Origin", "Authorization", "Content-Type"},
		AllowCredentials: true,
	}))

	// Public routes
	r.POST("/api/auth/login", handler.Login)
	r.POST("/api/auth/register", handler.Register)

	// Protected routes
	api := r.Group("/api")
	api.Use(middleware.JWTAuth(os.Getenv("JWT_SECRET")))
	{
		// Patients - Admin, Dokter, Perawat, Kasir
		patients := api.Group("/patients")
		patients.Use(middleware.AuthorizeRole("Admin", "Dokter", "Perawat", "Kasir"))
		{
			patients.GET("/", handler.GetPatients)
			patients.GET("/:id", handler.GetPatient)
			patients.POST("/", handler.CreatePatient)
			patients.PUT("/:id", handler.UpdatePatient)
		}

		// Appointments - Admin, Dokter, Perawat, Pasien
		appointments := api.Group("/appointments")
		appointments.Use(middleware.AuthorizeRole("Admin", "Dokter", "Perawat", "Pasien"))
		{
			appointments.GET("/", handler.GetAppointments)
			appointments.POST("/", handler.CreateAppointment)
			appointments.PUT("/:id", handler.UpdateAppointment)
		}

		// Medical Records - Dokter, Perawat only
		records := api.Group("/medical-records")
		records.Use(middleware.AuthorizeRole("Dokter", "Perawat"))
		{
			records.GET("/", handler.GetMedicalRecords)
			records.GET("/:id", handler.GetMedicalRecord)
			records.POST("/", middleware.AuthorizeRole("Dokter"), handler.CreateMedicalRecord)
			records.PUT("/:id", middleware.AuthorizeRole("Dokter"), handler.UpdateMedicalRecord)
		}

		// Pharmacy - Apoteker, Admin
		pharmacy := api.Group("/pharmacy")
		pharmacy.Use(middleware.AuthorizeRole("Apoteker", "Admin"))
		{
			pharmacy.GET("/items", handler.GetPharmacyItems)
			pharmacy.POST("/items", handler.CreatePharmacyItem)
			pharmacy.PUT("/items/:id", handler.UpdatePharmacyItem)
			pharmacy.GET("/stock-ledger", handler.GetStockLedger)
		}

		// Prescriptions
		prescriptions := api.Group("/prescriptions")
		{
			prescriptions.GET("/", middleware.AuthorizeRole("Dokter", "Apoteker", "Admin"),
				handler.GetPrescriptions)
			prescriptions.POST("/", middleware.AuthorizeRole("Dokter"),
				handler.CreatePrescription)
			prescriptions.PATCH("/:id/dispense", middleware.AuthorizeRole("Apoteker"),
				handler.DispensePrescription)
		}

		// Billing - Kasir, Admin
		billing := api.Group("/billing")
		billing.Use(middleware.AuthorizeRole("Kasir", "Admin"))
		{
			billing.GET("/", handler.GetBillingTransactions)
			billing.POST("/", handler.CreateBilling)
			billing.PATCH("/:id/pay", handler.ProcessPayment)
		}

		// Users - Admin only
		users := api.Group("/users")
		users.Use(middleware.AuthorizeRole("Admin"))
		{
			users.GET("/", handler.GetUsers)
			users.POST("/", handler.CreateUser)
			users.PUT("/:id", handler.UpdateUser)
			users.DELETE("/:id", handler.DeleteUser)
		}
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("Server starting on port %s", port)
	r.Run(":" + port)
}

func runMigrations(db *sql.DB) {
	driver, err := postgres.WithInstance(db, &postgres.Config{})
	if err != nil {
		log.Fatal("Migration driver error:", err)
	}

	m, err := migrate.NewWithDatabaseInstance(
		"file://db/migrations",
		"postgres", driver,
	)
	if err != nil {
		log.Fatal("Migration init error:", err)
	}

	if err := m.Up(); err != nil && err != migrate.ErrNoChange {
		log.Fatal("Migration error:", err)
	}

	log.Println("✅ Database migrations applied successfully")
}`;

export const dockerCompose = `version: '3.8'

services:
  # ===== PostgreSQL Database =====
  db:
    image: postgres:16-alpine
    container_name: klinik-db
    restart: unless-stopped
    environment:
      POSTGRES_DB: klinik_erp
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  # ===== Golang Backend =====
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: klinik-backend
    restart: unless-stopped
    environment:
      DATABASE_URL: postgres://postgres:postgres@db:5432/klinik_erp?sslmode=disable
      JWT_SECRET: klinik-erp-super-secret-key-2024
      PORT: "8080"
      GIN_MODE: release
    ports:
      - "8080:8080"
    depends_on:
      db:
        condition: service_healthy
    volumes:
      - ./backend/db/migrations:/app/db/migrations

  # ===== React Frontend =====
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: klinik-frontend
    restart: unless-stopped
    ports:
      - "3000:80"
    depends_on:
      - backend
    environment:
      VITE_API_URL: http://localhost:8080/api

volumes:
  postgres_data:`;

export const dockerfileBackend = `# ===== Multi-stage Build for Go Backend =====

# Stage 1: Build
FROM golang:1.22-alpine AS builder

WORKDIR /app

# Install dependencies
RUN apk add --no-cache git ca-certificates

# Copy go modules first (cache layer)
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build binary
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo \\
    -o /app/server ./cmd/main.go

# Stage 2: Runtime
FROM alpine:3.19

WORKDIR /app

# Install CA certificates & timezone data
RUN apk --no-cache add ca-certificates tzdata

# Copy binary from builder
COPY --from=builder /app/server .

# Copy migrations
COPY --from=builder /app/db/migrations ./db/migrations

# Expose port
EXPOSE 8080

# Run
CMD ["./server"]`;

export const projectStructure = `klinik-erp/
├── docker-compose.yml
│
├── backend/
│   ├── Dockerfile
│   ├── go.mod
│   ├── go.sum
│   ├── cmd/
│   │   └── main.go                    # Entry point + migration runner
│   │
│   ├── internal/
│   │   ├── config/
│   │   │   └── config.go              # Environment configuration
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.go                # JWT + Role-based middleware
│   │   │   └── cors.go                # CORS configuration
│   │   │
│   │   ├── handler/                   # HTTP Handlers (Controller)
│   │   │   ├── auth_handler.go
│   │   │   ├── patient_handler.go
│   │   │   ├── appointment_handler.go
│   │   │   ├── medical_record_handler.go
│   │   │   ├── pharmacy_handler.go
│   │   │   ├── prescription_handler.go
│   │   │   ├── billing_handler.go
│   │   │   └── user_handler.go
│   │   │
│   │   ├── service/                   # Business Logic
│   │   │   ├── auth_service.go
│   │   │   ├── patient_service.go
│   │   │   └── ...
│   │   │
│   │   ├── repository/               # Data Access Layer
│   │   │   ├── patient_repo.go
│   │   │   ├── user_repo.go
│   │   │   └── ...
│   │   │
│   │   └── model/                     # Domain Models
│   │       ├── user.go
│   │       ├── patient.go
│   │       ├── medical_record.go
│   │       └── ...
│   │
│   └── db/
│       └── migrations/
│           ├── 000001_init.up.sql
│           └── 000001_init.down.sql
│
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   ├── vite.config.ts
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── api/                       # Axios instances
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── store/                     # State management
│   │   └── types/
│   │
│   └── public/
│
└── README.md`;
