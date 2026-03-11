package utils

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/gin-gonic/gin"
)

// ActivityLogger provides a central way to log all user actions to the activity_logs table
type ActivityLogger struct {
	DB *sql.DB
}

func NewActivityLogger(db *sql.DB) *ActivityLogger {
	return &ActivityLogger{DB: db}
}

// Log records an activity in the database
func (l *ActivityLogger) Log(c *gin.Context, userID int, action, entity string, entityID int, description string) {
	ip := c.ClientIP()
	
	query := `INSERT INTO activity_logs (user_id, action, entity, entity_id, description, ip_address, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, NOW())`
	
	_, err := l.DB.ExecContext(context.Background(), query, userID, action, entity, entityID, description, ip)
	if err != nil {
		fmt.Printf("[ActivityLog] Failed to record log: %v\n", err)
	}
}

// GetUserIDFromContext retrieves user ID from Gin context if available (from Auth middleware)
func GetUserIDFromContext(c *gin.Context) int {
	id, exists := c.Get("userID")
	if !exists {
		return 0
	}
	if val, ok := id.(int); ok {
		return val
	}
	if val, ok := id.(float64); ok {
		return int(val)
	}
	return 0
}
// GetUserRoleFromContext retrieves user role from Gin context
func GetUserRoleFromContext(c *gin.Context) string {
	role, exists := c.Get("role")
	if !exists {
		return ""
	}
	if str, ok := role.(string); ok {
		return str
	}
	return ""
}
