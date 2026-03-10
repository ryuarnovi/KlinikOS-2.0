package user

import (
	"time"
)

type User struct {
	ID           int       `json:"id" db:"id"`
	Username     string    `json:"username" db:"username"`
	PasswordHash string    `json:"-" db:"password_hash"`
	FullName     string    `json:"full_name" db:"full_name"`
	Email        *string   `json:"email,omitempty" db:"email"`
	Phone        *string   `json:"phone,omitempty" db:"phone"`
	Role         string    `json:"role" db:"role"`
	IsActive     bool      `json:"is_active" db:"is_active"`
	CreatedAt    time.Time `json:"created_at" db:"created_at"`
	UpdatedAt    time.Time `json:"updated_at" db:"updated_at"`
}

type CreateUserInput struct {
	Username string  `json:"username" binding:"required"`
	FullName string  `json:"full_name" binding:"required"`
	Email    *string `json:"email" binding:"omitempty,email"`
	Phone    *string `json:"phone" binding:"omitempty"`
	Password string  `json:"password" binding:"required,min=6"`
	Role     string  `json:"role" binding:"required"`
}

type UpdateUserInput struct {
	FullName *string `json:"full_name"`
	Email    *string `json:"email" binding:"omitempty,email"`
	Phone    *string `json:"phone"`
	Password *string `json:"password"`
	Role     *string `json:"role"`
	IsActive *bool   `json:"is_active"`
}

type LoginInput struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type ChangePasswordInput struct {
	OldPassword string `json:"old_password" binding:"required"`
	NewPassword string `json:"new_password" binding:"required,min=6"`
}

type UserResponse struct {
	ID        int       `json:"id"`
	Username  string    `json:"username"`
	FullName  string    `json:"full_name"`
	Email     *string   `json:"email,omitempty"`
	Phone     *string   `json:"phone,omitempty"`
	Role      string    `json:"role"`
	IsActive  bool      `json:"is_active"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func ToUserResponse(u User) UserResponse {
	return UserResponse{
		ID:        u.ID,
		Username:  u.Username,
		FullName:  u.FullName,
		Email:     u.Email,
		Phone:     u.Phone,
		Role:      u.Role,
		IsActive:  u.IsActive,
		CreatedAt: u.CreatedAt,
		UpdatedAt: u.UpdatedAt,
	}
}

func ToUserResponses(users []User) []UserResponse {
	responses := make([]UserResponse, len(users))
	for i, u := range users {
		responses[i] = ToUserResponse(u)
	}
	return responses
}
