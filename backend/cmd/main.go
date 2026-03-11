package main

import (
	"database/sql"
	"github.com/gin-gonic/gin"
	"github.com/ryuarno/klinikos/internal/config"
	"github.com/ryuarno/klinikos/internal/db"
	"github.com/ryuarno/klinikos/internal/handler/drug"
	"github.com/ryuarno/klinikos/internal/handler/hris"
	"github.com/ryuarno/klinikos/internal/handler/icd"
	"github.com/ryuarno/klinikos/internal/handler/patient"
	"github.com/ryuarno/klinikos/internal/handler/payment"
	"github.com/ryuarno/klinikos/internal/handler/resepsionis"
	"github.com/ryuarno/klinikos/internal/handler/user"
	"github.com/ryuarno/klinikos/internal/middleware"
	"github.com/ryuarno/klinikos/internal/utils"
	"log"
	"os"
	"path/filepath"
	"strings"
)

func main() {
	cfg := config.Load()
	database := db.Connect(cfg.Dsn)
	defer database.Close()

	r := gin.Default()
	r.Use(middleware.CORSMiddleware())
	r.Use(middleware.LoggerMiddleware())

	// Serving uploads
	r.Static("/api/uploads", "./uploads")

	// Logger
	logger := utils.NewActivityLogger(database)

	// Inisialisasi handler
	userHandler := &user.UserHandler{DB: database, JWTSecret: cfg.JWTSecret, Logger: logger}
	patientHandler := &patient.PatientHandler{DB: database}
	drugHandler := &drug.DrugHandler{DB: database}
	prescriptionHandler := &patient.PrescriptionHandler{DB: database, Logger: logger}
	prescriptionItemHandler := &patient.PrescriptionItemHandler{DB: database}
	queueHandler := &patient.QueueHandler{DB: database, Logger: logger}
	medicalRecordHandler := &patient.MedicalRecordHandler{DB: database, Logger: logger}
	paymentHandler := &payment.PaymentHandler{DB: database, Logger: logger}
	activityLogHandler := &resepsionis.ActivityLogHandler{DB: database}
	referralHandler := &patient.ReferralHandler{DB: database, Logger: logger}
	icdHandler := &icd.ICDHandler{DB: database}
	hrisHandler := &hris.HRISHandler{DB: database}

	// Run auto migrations
	RunAutoMigrations(database, "migrations")

	api := r.Group("/api")
	{
		// Public routes
		api.POST("/login", userHandler.LoginHandler)
		api.POST("/register", userHandler.RegisterHandler)

		// Semua route di bawah butuh JWT token
		protected := api.Group("")
		protected.Use(middleware.AuthMiddleware(cfg.JWTSecret))
		{
			// ── User Profile (Self) ───────────────────────────────────
			protected.GET("/users/me", userHandler.GetMeHandler)
			protected.PUT("/users/me", userHandler.UpdateMeHandler)
			protected.POST("/users/me/upload", userHandler.UploadProfilePictureHandler)
			protected.GET("/users/staff", userHandler.ListStaffHandler)

			// ── Admin only ────────────────────────────────────────────
			admin := protected.Group("")
			admin.Use(middleware.AdminOnly())
			{
				admin.POST("/users", userHandler.CreateUserHandler)
				admin.GET("/users", userHandler.ListUsersHandler)
				admin.GET("/users/:id", userHandler.GetUserHandler)
				admin.PUT("/users/:id", userHandler.UpdateUserHandler)
				admin.DELETE("/users/:id", userHandler.DeleteUserHandler)
			}

			// ── Patients: semua role bisa akses ──────────────────────
			protected.GET("/patients", patientHandler.ListPatientsHandler)
			protected.GET("/patients/:id", patientHandler.GetPatientHandler)
			protected.POST("/patients", patientHandler.CreatePatientHandler)
			protected.PUT("/patients/:id", patientHandler.UpdatePatientHandler)
			protected.DELETE("/patients/:id", patientHandler.DeletePatientHandler)
 
			// ── Referrals: semua role bisa akses ──────────────────────
			protected.GET("/referrals", referralHandler.ListReferralsHandler)
			protected.POST("/referrals", referralHandler.CreateReferralHandler)
			protected.PUT("/referrals/:id", referralHandler.UpdateReferralHandler)
			protected.DELETE("/referrals/:id", referralHandler.DeleteReferralHandler)

			// ── Queues: semua role bisa akses ─────────────────────────
			protected.GET("/queues", queueHandler.ListQueuesHandler)
			protected.GET("/queues/:id", queueHandler.GetQueueHandler)
			protected.POST("/queues", queueHandler.CreateQueueHandler)
			protected.PUT("/queues/:id", queueHandler.UpdateQueueHandler)
			protected.DELETE("/queues/:id", queueHandler.DeleteQueueHandler)

			// ── Medical Records: dokter + admin ───────────────────────
			protected.GET("/medical-records", medicalRecordHandler.ListMedicalRecordsHandler)
			protected.GET("/medical-records/:id", medicalRecordHandler.GetMedicalRecordHandler)
			protected.POST("/medical-records", medicalRecordHandler.CreateMedicalRecordHandler)
			protected.PUT("/medical-records/:id", medicalRecordHandler.UpdateMedicalRecordHandler)
			protected.DELETE("/medical-records/:id", medicalRecordHandler.DeleteMedicalRecordHandler)

			// ── Prescriptions: perawat + apoteker ────────────────────
			protected.POST("/prescriptions", prescriptionHandler.CreatePrescriptionHandler)
			protected.GET("/prescriptions", prescriptionHandler.ListPrescriptionsHandler)
			protected.PUT("/prescriptions/:id", prescriptionHandler.UpdatePrescriptionHandler)
			protected.DELETE("/prescriptions/:id", prescriptionHandler.DeletePrescriptionHandler)
			protected.POST("/prescription_items", prescriptionItemHandler.CreatePrescriptionItemHandler)
			protected.GET("/prescription_items", prescriptionItemHandler.ListPrescriptionItemsHandler)

			// ── Pharmacy: apoteker + admin ────────────────────────────
			protected.GET("/pharmacy/items", drugHandler.ListDrugsHandler)
			protected.GET("/pharmacy/items/:sku", drugHandler.GetDrugHandler)
			protected.POST("/pharmacy/items", drugHandler.CreateDrugHandler)
			protected.PUT("/pharmacy/items/:id", drugHandler.UpdateDrugHandler)
			protected.DELETE("/pharmacy/items/:id", drugHandler.DeleteDrugHandler)
			protected.GET("/pharmacy/low-stock", drugHandler.GetDrugsLowStockHandler)

			// ── Billing: kasir + resepsionis ──────────────────────────
			protected.GET("/billing", paymentHandler.ListPaymentsHandler)
			protected.POST("/billing", paymentHandler.CreatePaymentHandler)
			protected.PUT("/billing/:id", paymentHandler.UpdatePaymentHandler)
			protected.PATCH("/billing/:id/pay", paymentHandler.UpdatePaymentHandler)
			protected.DELETE("/billing/:id", paymentHandler.DeletePaymentHandler)
			protected.POST("/payment/midtrans", paymentHandler.CreateMidtransSnapHandler)
			protected.POST("/payment/midtrans/webhook", paymentHandler.MidtransWebhookHandler)

			// ── Self-service (pasien) ─────────────────────────────────
			protected.GET("/billing/self", patientHandler.ListPatientPaymentsHandler)

			// ── Activity Logs: resepsionis + admin ────────────────────
			protected.GET("/activity-logs", activityLogHandler.ListActivityLogsHandler)
			protected.GET("/activity-logs/search", activityLogHandler.SearchActivityLogsHandler)
			protected.GET("/activity-logs/:id", activityLogHandler.GetActivityLogHandler)
			protected.POST("/activity-logs", activityLogHandler.CreateActivityLogHandler)
			protected.DELETE("/activity-logs/:id", activityLogHandler.DeleteActivityLogHandler)

			// ── ICD Reference ─────────────────────────────────────────
			protected.GET("/icd/icd10", icdHandler.SearchICD10Handler)
			protected.GET("/icd/icd9cm", icdHandler.SearchICD9CMHandler)

			// ── HRIS (Scheduling & Shifts) ────────────────────────────
			protected.GET("/hris/schedules", hrisHandler.ListSchedulesHandler)
			protected.POST("/hris/schedules", hrisHandler.CreateScheduleHandler)
			protected.PUT("/hris/schedules/:id", hrisHandler.UpdateScheduleHandler)
			protected.DELETE("/hris/schedules/:id", hrisHandler.DeleteScheduleHandler)
			protected.GET("/hris/shifts", hrisHandler.ListShiftsHandler)
			protected.POST("/hris/shifts", hrisHandler.CreateShiftHandler)
			protected.PUT("/hris/shifts/:id", hrisHandler.UpdateShiftHandler)
			protected.DELETE("/hris/shifts/:id", hrisHandler.DeleteShiftHandler)
		}
	}

	r.Run(":" + cfg.Port)
}

func RunAutoMigrations(db *sql.DB, migrationsDir string) {
	files, err := os.ReadDir(migrationsDir)
	if err != nil {
		log.Printf("Warning: migrations directory not found: %v", err)
		return
	}
	log.Printf("Starting auto-migrations from %s...", migrationsDir)
	for _, file := range files {
		if !file.IsDir() && strings.HasSuffix(file.Name(), ".sql") {
			log.Printf("Checking migration: %s", file.Name())
			sqlBytes, err := os.ReadFile(filepath.Join(migrationsDir, file.Name()))
			if err != nil {
				log.Printf("Warning: failed to read migration %s: %v", file.Name(), err)
				continue
			}
			if _, err := db.Exec(string(sqlBytes)); err != nil {
				log.Printf("Migration %s failed: %v", file.Name(), err)
			} else {
				log.Printf("Migration %s successfully applied", file.Name())
			}
		}
	}

	// Fallback to ensure users table has staff fields if migrations skipped
	_, _ = db.Exec("ALTER TABLE users ADD COLUMN IF NOT EXISTS nip VARCHAR(50)")
	_, _ = db.Exec("ALTER TABLE users ADD COLUMN IF NOT EXISTS specialization VARCHAR(100)")
	_, _ = db.Exec("ALTER TABLE users ADD COLUMN IF NOT EXISTS license_number VARCHAR(100)")
	_, _ = db.Exec("ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_picture_url TEXT")
	log.Println("Internal schema check for users table completed.")
}
