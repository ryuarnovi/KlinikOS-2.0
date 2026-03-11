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
	Phone          *string   `json:"phone,omitempty" db:"phone"`
	NIP            *string   `json:"nip,omitempty" db:"nip"`
	Specialization *string   `json:"specialization,omitempty" db:"specialization"`
	LicenseNumber  *string   `json:"license_number,omitempty" db:"license_number"`
	Role           string    `json:"role" db:"role"`
	ProfilePictureURL *string   `json:"profile_picture_url,omitempty" db:"profile_picture_url"`
	IsActive     bool      `json:"is_active" db:"is_active"`
	CreatedAt    time.Time `json:"created_at" db:"created_at"`
	UpdatedAt    time.Time `json:"updated_at" db:"updated_at"`
}

type CreateUserInput struct {
	Username string  `json:"username" binding:"required"`
	FullName string  `json:"full_name" binding:"required"`
	Email    *string `json:"email" binding:"omitempty,email"`
	Phone    *string `json:"phone" binding:"omitempty"`
	Password       string  `json:"password" binding:"required,min=6"`
	NIP            *string `json:"nip" binding:"omitempty"`
	Specialization *string `json:"specialization" binding:"omitempty"`
	LicenseNumber  *string `json:"license_number" binding:"omitempty"`
	Role           string  `json:"role" binding:"required"`
	ProfilePictureURL *string `json:"profile_picture_url" binding:"omitempty"`
}

type UpdateUserInput struct {
	FullName *string `json:"full_name"`
	Email    *string `json:"email" binding:"omitempty,email"`
	Phone    *string `json:"phone"`
	Password       *string `json:"password"`
	NIP            *string `json:"nip"`
	Specialization *string `json:"specialization"`
	LicenseNumber  *string `json:"license_number"`
	Role           *string `json:"role"`
	IsActive *bool   `json:"is_active"`
	ProfilePictureURL *string `json:"profile_picture_url"`
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
	Phone          *string   `json:"phone,omitempty"`
	NIP            *string   `json:"nip,omitempty"`
	Specialization *string   `json:"specialization,omitempty"`
	LicenseNumber  *string   `json:"license_number,omitempty"`
	Role           string    `json:"role"`
	IsActive  bool      `json:"is_active"`
	ProfilePictureURL *string   `json:"profile_picture_url,omitempty"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func ToUserResponse(u User) UserResponse {
	return UserResponse{
		ID:        u.ID,
		Username:  u.Username,
		FullName:  u.FullName,
		Email:     u.Email,
		Phone:          u.Phone,
		NIP:            u.NIP,
		Specialization: u.Specialization,
		LicenseNumber:  u.LicenseNumber,
		Role:           u.Role,
		IsActive:  u.IsActive,
		ProfilePictureURL: u.ProfilePictureURL,
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
