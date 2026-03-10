package patient

import (
	"database/sql"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	mpatient "github.com/ryuarno/klinikos/internal/model/patient"
)

type QueueHandler struct {
	DB *sql.DB
}

// Create queue
func (h *QueueHandler) CreateQueueHandler(c *gin.Context) {
	var input mpatient.CreateQueueInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if input.QueueNumber == "" {
		input.QueueNumber = "Q" + strconv.FormatInt(time.Now().Unix(), 10)[7:]
	}
	if input.QueueDate == "" {
		input.QueueDate = time.Now().Format("2006-01-02")
	}

	queueDate, err := time.Parse("2006-01-02", input.QueueDate)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid queue_date format (YYYY-MM-DD)"})
		return
	}
	var id int
	err = h.DB.QueryRow(
		`INSERT INTO queues (patient_id, queue_number, queue_date, status, created_by, created_at)
         VALUES ($1, $2, $3, 'waiting', $4, NOW()) RETURNING id`,
		input.PatientID, input.QueueNumber, queueDate, input.CreatedBy,
	).Scan(&id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create queue"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "Queue created", "data": id})
}

// Update queue
func (h *QueueHandler) UpdateQueueHandler(c *gin.Context) {
	id := c.Param("id")
	var input mpatient.UpdateQueueInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	set := []string{}
	args := []interface{}{}
	idx := 1
	if input.Status != nil {
		set = append(set, fmt.Sprintf("status = $%d", idx))
		args = append(args, *input.Status)
		idx++
	}
	if input.CalledAt != nil {
		set = append(set, fmt.Sprintf("called_at = $%d", idx))
		args = append(args, *input.CalledAt)
		idx++
	}
	if input.CompletedAt != nil {
		set = append(set, fmt.Sprintf("completed_at = $%d", idx))
		args = append(args, *input.CompletedAt)
		idx++
	}
	if len(set) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No data to update"})
		return
	}
	query := "UPDATE queues SET " + joinComma(set) + fmt.Sprintf(" WHERE id = $%d", idx)
	args = append(args, id)
	_, err := h.DB.Exec(query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update queue"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Queue updated"})
}

// Delete queue
func (h *QueueHandler) DeleteQueueHandler(c *gin.Context) {
	id := c.Param("id")
	_, err := h.DB.Exec("DELETE FROM queues WHERE id = $1", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete queue"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Queue deleted"})
}

// Get queue by ID (dengan relasi patient & user)
func (h *QueueHandler) GetQueueHandler(c *gin.Context) {
	id := c.Param("id")
	var q mpatient.Queue
	var patientName sql.NullString
	var userName sql.NullString

	err := h.DB.QueryRow(
		`SELECT q.id, q.patient_id, q.queue_number, q.queue_date, q.status, q.created_by, q.called_at, q.completed_at, q.created_at,
                p.full_name, u.full_name
           FROM queues q
           LEFT JOIN patients p ON q.patient_id = p.id
           LEFT JOIN users u ON q.created_by = u.id
         WHERE q.id = $1`, id).
		Scan(&q.ID, &q.PatientID, &q.QueueNumber, &q.QueueDate, &q.Status, &q.CreatedBy, &q.CalledAt, &q.CompletedAt, &q.CreatedAt,
			&patientName, &userName)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Queue not found"})
		return
	}
	// Set relasi FK
	q.Patient = &mpatient.PatientFK{
		ID:       q.PatientID,
		FullName: nil,
	}
	if patientName.Valid {
		q.Patient.FullName = &patientName.String
	}
	if q.CreatedBy != nil {
		q.Users = &mpatient.User{
			ID:       *q.CreatedBy,
			FullName: nil,
		}
		if userName.Valid {
			q.Users.FullName = &userName.String
		}
	}
	c.JSON(http.StatusOK, gin.H{"data": mpatient.ToQueueResponse(q)})
}

// List all queues (dengan relasi patient & user)
func (h *QueueHandler) ListQueuesHandler(c *gin.Context) {
	rows, err := h.DB.Query(
		`SELECT q.id, q.patient_id, q.queue_number, q.queue_date, q.status, q.created_by, q.called_at, q.completed_at, q.created_at,
                p.full_name, u.full_name
           FROM queues q
           LEFT JOIN patients p ON q.patient_id = p.id
           LEFT JOIN users u ON q.created_by = u.id`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get queues"})
		return
	}
	defer rows.Close()
	var queues []mpatient.Queue
	for rows.Next() {
		var q mpatient.Queue
		var patientName sql.NullString
		var userName sql.NullString
		if err := rows.Scan(&q.ID, &q.PatientID, &q.QueueNumber, &q.QueueDate, &q.Status, &q.CreatedBy, &q.CalledAt, &q.CompletedAt, &q.CreatedAt,
			&patientName, &userName); err == nil {
			q.Patient = &mpatient.PatientFK{
				ID:       q.PatientID,
				FullName: nil,
			}
			if patientName.Valid {
				q.Patient.FullName = &patientName.String
			}
			if q.CreatedBy != nil {
				q.Users = &mpatient.User{
					ID:       *q.CreatedBy,
					FullName: nil,
				}
				if userName.Valid {
					q.Users.FullName = &userName.String
				}
			}
			queues = append(queues, q)
		}
	}
	c.JSON(http.StatusOK, gin.H{"data": mpatient.ToQueueResponses(queues)})
}
