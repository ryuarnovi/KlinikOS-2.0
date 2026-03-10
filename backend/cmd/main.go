package main

import (
	"github.com/gin-gonic/gin"
	"github.com/ryuarno/klinikos/internal/config"
	"github.com/ryuarno/klinikos/internal/db"
	"github.com/ryuarno/klinikos/internal/handler/drug"
	"github.com/ryuarno/klinikos/internal/handler/patient"
	"github.com/ryuarno/klinikos/internal/handler/payment"
	"github.com/ryuarno/klinikos/internal/handler/resepsionis"
	"github.com/ryuarno/klinikos/internal/handler/user"
	"github.com/ryuarno/klinikos/internal/middleware"
)

func main() {
	cfg := config.Load()
	database := db.Connect(cfg.Dsn)
	defer database.Close()

	r := gin.Default()
	r.Use(middleware.CORSMiddleware())
	r.Use(middleware.LoggerMiddleware())

	// Inisialisasi handler
	userHandler := &user.UserHandler{DB: database, JWTSecret: cfg.JWTSecret}
	patientHandler := &patient.PatientHandler{DB: database}
	drugHandler := &drug.DrugHandler{DB: database}
	prescriptionHandler := &patient.PrescriptionHandler{DB: database}
	prescriptionItemHandler := &patient.PrescriptionItemHandler{DB: database}
	queueHandler := &patient.QueueHandler{DB: database}
	medicalRecordHandler := &patient.MedicalRecordHandler{DB: database}
	paymentHandler := &payment.PaymentHandler{DB: database}
	activityLogHandler := &resepsionis.ActivityLogHandler{DB: database}
	referralHandler := &patient.ReferralHandler{DB: database}

	api := r.Group("/api")
	{
		// Public routes
		api.POST("/login", userHandler.LoginHandler)
		api.POST("/register", userHandler.RegisterHandler)

		// Semua route di bawah butuh JWT token
		protected := api.Group("")
		protected.Use(middleware.AuthMiddleware(cfg.JWTSecret))
		{
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
		}
	}

	r.Run(":" + cfg.Port)
}
