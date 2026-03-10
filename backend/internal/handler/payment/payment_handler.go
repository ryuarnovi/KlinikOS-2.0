package payment

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"reflect"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/ryuarno/klinikos/internal/model/patient"
	"github.com/veritrans/go-midtrans"
)

// PaymentHandler is the DI struct for payment feature
type PaymentHandler struct {
	DB *sql.DB
}

// Helper untuk join string dengan koma
func joinComma(set []string) string {
	return strings.Join(set, ", ")
}

// CREATE payment
func (h *PaymentHandler) CreatePaymentHandler(c *gin.Context) {
	var input patient.CreatePaymentInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	query := `INSERT INTO payments 
		(payment_code, patient_id, medical_record_id, prescription_id, total_amount, payment_method, paid_amount, change_amount, status, processed_by, payment_date, doctor_fee, medicine_cost, admin_fee, discount, tax, notes)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'unpaid', $9, NOW(), $10, $11, $12, $13, $14, $15)`

	var id int
	err := h.DB.QueryRowContext(
		context.Background(),
		query+` RETURNING id`,
		input.PaymentCode,
		input.PatientID,
		input.MedicalRecordID,
		input.PrescriptionID,
		input.TotalAmount,
		input.PaymentMethod,
		input.PaidAmount,
		0, // change_amount default 0
		input.ProcessedBy,
		input.DoctorFee,
		input.MedicineCost,
		input.AdminFee,
		input.Discount,
		input.Tax,
		input.Notes,
	).Scan(&id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create payment: " + err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "Payment created", "data": id})
}

// LIST all payments (with join to patient, prescription, user)
func (h *PaymentHandler) ListPaymentsHandler(c *gin.Context) {
	rows, err := h.DB.Query(`
		SELECT p.id, p.payment_code, p.patient_id, p.medical_record_id, p.prescription_id, p.payment_date, p.total_amount, 
		       p.payment_method, p.paid_amount, p.change_amount, p.status, p.processed_by,
               p.doctor_fee, p.medicine_cost, p.admin_fee, p.discount, p.tax, p.notes,
			   pa.full_name, pr.prescription_code, u.full_name
		  FROM payments p
		  LEFT JOIN patients pa ON p.patient_id = pa.id
		  LEFT JOIN prescriptions pr ON p.prescription_id = pr.id
		  LEFT JOIN users u ON p.processed_by = u.id
		ORDER BY p.payment_date DESC`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch payments"})
		return
	}
	defer rows.Close()

	var payments []patient.Payment
	for rows.Next() {
		var pay patient.Payment
		var patientName, prescriptionCode, userName sql.NullString
		err := rows.Scan(
			&pay.ID, &pay.PaymentCode, &pay.PatientID, &pay.MedicalRecordID, &pay.PrescriptionID, &pay.PaymentDate, &pay.TotalAmount, &pay.PaymentMethod, &pay.PaidAmount, &pay.ChangeAmount, &pay.Status, &pay.ProcessedBy,
            &pay.DoctorFee, &pay.MedicineCost, &pay.AdminFee, &pay.Discount, &pay.Tax, &pay.Notes,
			&patientName, &prescriptionCode, &userName,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to scan payment"})
			return
		}
		pay.Patient = &patient.PatientFK{
			ID:       pay.PatientID,
			FullName: nil,
		}
		if patientName.Valid {
			pay.Patient.FullName = &patientName.String
		}
		if pay.PrescriptionID != nil {
			pay.Prescription = &patient.PrescriptionFK{
				ID:               *pay.PrescriptionID,
				PrescriptionCode: nil,
			}
			if prescriptionCode.Valid {
				pay.Prescription.PrescriptionCode = &prescriptionCode.String
			}
		}
		if pay.ProcessedBy != nil {
			pay.Processor = &patient.UserFK{
				ID:       *pay.ProcessedBy,
				FullName: nil,
			}
			if userName.Valid {
				pay.Processor.FullName = &userName.String
			}
		}
		payments = append(payments, pay)
	}
	c.JSON(http.StatusOK, gin.H{"data": patient.ToPaymentResponses(payments)})
}

// UPDATE payment (tanpa banyak if)
func (h *PaymentHandler) UpdatePaymentHandler(c *gin.Context) {
	id := c.Param("id")
	var input patient.UpdatePaymentInput
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
	query := "UPDATE payments SET " + joinComma(set) + fmt.Sprintf(" WHERE id = $%d", idx)
	args = append(args, id)

	res, err := h.DB.ExecContext(context.Background(), query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update payment"})
		return
	}
	affected, err := res.RowsAffected()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to determine update result"})
		return
	}
	if affected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Payment not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Payment updated"})
}

// DELETE payment
func (h *PaymentHandler) DeletePaymentHandler(c *gin.Context) {
	id := c.Param("id")
	res, err := h.DB.ExecContext(context.Background(), "DELETE FROM payments WHERE id = $1", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete payment"})
		return
	}
	affected, err := res.RowsAffected()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to determine delete result"})
		return
	}
	if affected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Payment not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Payment deleted"})
}

// MIDTRANS: CHECK TRANSACTION STATUS
// Handler untuk cek status pembayaran Midtrans tanpa library
func (h *PaymentHandler) MidtransPaymentStatusHandler(c *gin.Context) {
	orderID := c.Param("order_id")
	serverKey := os.Getenv("MIDTRANS_SERVER_KEY")
	env := os.Getenv("MIDTRANS_ENV")
	var baseURL string
	if strings.ToLower(env) == "production" {
		baseURL = "https://api.midtrans.com/v2/"
	} else {
		baseURL = "https://api.sandbox.midtrans.com/v2/"
	}

	url := baseURL + orderID + "/status"
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create request"})
		return
	}
	req.SetBasicAuth(serverKey, "")
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to call Midtrans"})
		return
	}
	defer resp.Body.Close()
	body, _ := ioutil.ReadAll(resp.Body)

	if resp.StatusCode != 200 {
		c.JSON(resp.StatusCode, gin.H{"error": string(body)})
		return
	}

	var result map[string]interface{}
	if err := json.Unmarshal(body, &result); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse response"})
		return
	}
	c.JSON(http.StatusOK, result)
}

// MIDTRANS: CREATE SNAP
func (h *PaymentHandler) CreateMidtransSnapHandler(c *gin.Context) {
	var input struct {
		OrderID     string  `json:"order_id" binding:"required"`
		GrossAmount float64 `json:"gross_amount" binding:"required"`
		Customer    struct {
			FirstName string `json:"first_name"`
			Email     string `json:"email"`
		} `json:"customer"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	client := midtrans.NewClient()
	client.ServerKey = os.Getenv("MIDTRANS_SERVER_KEY")
	client.ClientKey = os.Getenv("MIDTRANS_CLIENT_KEY")
	env := os.Getenv("MIDTRANS_ENV")
	if strings.ToLower(env) == "production" {
		client.APIEnvType = midtrans.Production
	} else {
		client.APIEnvType = midtrans.Sandbox
	}

	snapReq := &midtrans.SnapReq{
		TransactionDetails: midtrans.TransactionDetails{
			OrderID:  input.OrderID,
			GrossAmt: int64(input.GrossAmount),
		},
		CustomerDetail: &midtrans.CustDetail{
			FName: input.Customer.FirstName,
			Email: input.Customer.Email,
		},
	}
	snapGateway := midtrans.SnapGateway{Client: client}
	snapResp, err := snapGateway.GetToken(snapReq)
	if err != nil {
		errMsg := err.Error()
		// Log detail for debugging
		fmt.Printf("[Midtrans] GetToken error for order %s: %s\n", input.OrderID, errMsg)
		c.JSON(http.StatusBadGateway, gin.H{
			"error":   "Midtrans payment gateway error",
			"detail":  errMsg,
			"hint":    "Periksa Server Key Midtrans dan pastikan order_id belum pernah digunakan",
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"snap_token":   snapResp.Token,
		"redirect_url": snapResp.RedirectURL,
	})
}

// MIDTRANS WEBHOOK HANDLER
// Security Note: Untuk produksi, lakukan validasi signature dari docs Midtrans
func (h *PaymentHandler) MidtransWebhookHandler(c *gin.Context) {
	var notif map[string]interface{}
	if err := c.BindJSON(&notif); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	orderID, _ := notif["order_id"].(string)
	transactionStatus, _ := notif["transaction_status"].(string)

	var status string
	switch transactionStatus {
	case "settlement", "capture":
		status = "paid"
	case "pending":
		status = "unpaid"
	case "cancel", "deny", "expire":
		status = "cancelled"
	default:
		status = "unpaid"
	}
	_, err := h.DB.ExecContext(context.Background(), "UPDATE payments SET status = $1 WHERE payment_code = $2", status, orderID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update payment status"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Payment status updated"})
}
