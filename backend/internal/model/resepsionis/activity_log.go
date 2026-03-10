package resepsionis

import "time"

type UserFK struct {
	ID       int    `json:"id"`
	FullName string `json:"full_name"`
}

type ActivityLog struct {
	ID          int       `json:"id" db:"id"`
	UserID      int       `json:"user_id" db:"user_id"`
	Action      string    `json:"action" db:"action"`
	Entity      string    `json:"entity" db:"entity"`
	EntityID    int       `json:"entity_id" db:"entity_id"`
	Description string    `json:"description" db:"description"`
	IPAddress   string    `json:"ip_address" db:"ip_address"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`

	// Optional relation
	User *UserFK `json:"user,omitempty"`
}

type CreateActivityLogRequest struct {
	UserID      int    `json:"user_id" binding:"required"`
	Action      string `json:"action" binding:"required"`
	Entity      string `json:"entity"`
	EntityID    int    `json:"entity_id"`
	Description string `json:"description"`
	IPAddress   string `json:"ip_address"`
}

type ActivityLogResponse struct {
	ID          int       `json:"id"`
	UserID      int       `json:"user_id"`
	UserName    string    `json:"user_name,omitempty"`
	Action      string    `json:"action"`
	Entity      string    `json:"entity"`
	EntityID    int       `json:"entity_id"`
	Description string    `json:"description"`
	IPAddress   string    `json:"ip_address"`
	CreatedAt   time.Time `json:"created_at"`
}

func ToActivityLogResponse(log ActivityLog) ActivityLogResponse {
	resp := ActivityLogResponse{
		ID:          log.ID,
		UserID:      log.UserID,
		Action:      log.Action,
		Entity:      log.Entity,
		EntityID:    log.EntityID,
		Description: log.Description,
		IPAddress:   log.IPAddress,
		CreatedAt:   log.CreatedAt,
	}
	if log.User != nil {
		resp.UserName = log.User.FullName
	}
	return resp
}

func ToActivityLogResponses(logs []ActivityLog) []ActivityLogResponse {
	var responses []ActivityLogResponse
	for _, log := range logs {
		responses = append(responses, ToActivityLogResponse(log))
	}
	return responses
}
