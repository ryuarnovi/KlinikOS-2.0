package resepsionis

import (
	"database/sql"
	"fmt"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	mresepsionis "github.com/ryuarno/klinikos/internal/model/resepsionis"
)

type ActivityLogHandler struct {
	DB *sql.DB
}

// List all activity logs
func (h *ActivityLogHandler) ListActivityLogsHandler(c *gin.Context) {
	rows, err := h.DB.Query(`
		SELECT al.id, al.user_id, al.action, al.entity, al.entity_id, al.description, al.ip_address, al.created_at, u.full_name
		FROM activity_logs al
		LEFT JOIN users u ON al.user_id = u.id
		ORDER BY al.created_at DESC`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch activity logs: " + err.Error()})
		return
	}
	defer rows.Close()

	var logs []mresepsionis.ActivityLog
	for rows.Next() {
		var al mresepsionis.ActivityLog
		var fullName sql.NullString
		if err := rows.Scan(&al.ID, &al.UserID, &al.Action, &al.Entity, &al.EntityID, &al.Description, &al.IPAddress, &al.CreatedAt, &fullName); err != nil {
			continue
		}
		if fullName.Valid {
			al.User = &mresepsionis.UserFK{ID: al.UserID, FullName: fullName.String}
		}
		logs = append(logs, al)
	}
	c.JSON(http.StatusOK, gin.H{"data": mresepsionis.ToActivityLogResponses(logs)})
}

// Get activity log by ID
func (h *ActivityLogHandler) GetActivityLogHandler(c *gin.Context) {
	idStr := c.Param("id")
	id, _ := strconv.Atoi(idStr)

	var al mresepsionis.ActivityLog
	var fullName sql.NullString
	err := h.DB.QueryRow(`
		SELECT al.id, al.user_id, al.action, al.entity, al.entity_id, al.description, al.ip_address, al.created_at, u.full_name
		FROM activity_logs al
		LEFT JOIN users u ON al.user_id = u.id
		WHERE al.id = $1`, id).
		Scan(&al.ID, &al.UserID, &al.Action, &al.Entity, &al.EntityID, &al.Description, &al.IPAddress, &al.CreatedAt, &fullName)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Activity log not found"})
		return
	}
	if fullName.Valid {
		al.User = &mresepsionis.UserFK{ID: al.UserID, FullName: fullName.String}
	}
	c.JSON(http.StatusOK, gin.H{"data": mresepsionis.ToActivityLogResponse(al)})
}

// Search activity logs
func (h *ActivityLogHandler) SearchActivityLogsHandler(c *gin.Context) {
	action := c.Query("action")
	entity := c.Query("entity")

	query := `SELECT al.id, al.user_id, al.action, al.entity, al.entity_id, al.description, al.ip_address, al.created_at, u.full_name
		FROM activity_logs al
		LEFT JOIN users u ON al.user_id = u.id WHERE 1=1`
	var args []interface{}
	idx := 1

	if action != "" {
		query += fmt.Sprintf(" AND al.action = $%d", idx)
		args = append(args, action)
		idx++
	}
	if entity != "" {
		query += fmt.Sprintf(" AND al.entity = $%d", idx)
		args = append(args, entity)
		idx++
	}

	rows, err := h.DB.Query(query+" ORDER BY al.created_at DESC", args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Search failed"})
		return
	}
	defer rows.Close()

	var logs []mresepsionis.ActivityLog
	for rows.Next() {
		var al mresepsionis.ActivityLog
		var fullName sql.NullString
		if err := rows.Scan(&al.ID, &al.UserID, &al.Action, &al.Entity, &al.EntityID, &al.Description, &al.IPAddress, &al.CreatedAt, &fullName); err == nil {
			if fullName.Valid {
				al.User = &mresepsionis.UserFK{ID: al.UserID, FullName: fullName.String}
			}
			logs = append(logs, al)
		}
	}
	c.JSON(http.StatusOK, gin.H{"data": mresepsionis.ToActivityLogResponses(logs)})
}

// Create a new activity log
func (h *ActivityLogHandler) CreateActivityLogHandler(c *gin.Context) {
	var input mresepsionis.CreateActivityLogRequest
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	query := `INSERT INTO activity_logs (user_id, action, entity, entity_id, description, ip_address, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING id`
	var id int
	err := h.DB.QueryRow(query, input.UserID, input.Action, input.Entity, input.EntityID, input.Description, input.IPAddress).Scan(&id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create activity log"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "Log created", "data": id})
}

// Update activity log (if needed)
func (h *ActivityLogHandler) UpdateActivityLogHandler(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{"message": "Logs should be immutable"})
}

// Delete activity log (if needed)
func (h *ActivityLogHandler) DeleteActivityLogHandler(c *gin.Context) {
	id := c.Param("id")
	_, err := h.DB.Exec("DELETE FROM activity_logs WHERE id = $1", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete log"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Log deleted"})
}
