package user

import (
	"database/sql"
	"fmt"
	"net/http"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	muser "github.com/ryuarno/klinikos/internal/model/user"
	"github.com/ryuarno/klinikos/internal/utils"
	"golang.org/x/crypto/bcrypt"
	"os"
	"path/filepath"
)

type UserHandler struct {
	DB        *sql.DB
	JWTSecret string
	Logger    *utils.ActivityLogger
}

// -- Validator helpers --
func ValidRole(role string) bool {
	validRoles := map[string]bool{
		"admin":       true,
		"dokter":      true,
		"apoteker":    true,
		"kasir":       true,
		"resepsionis": true,
		"perawat":     true,
		"pasien":      true,
	}
	return validRoles[strings.ToLower(role)]
}

func ValidEmail(email *string) bool {
	if email == nil {
		return true
	}
	if len(*email) < 5 || len(*email) > 100 {
		return false
	}
	re := regexp.MustCompile(`^[^@\s]+@[^@\s]+\.[^@\s]+$`)
	return re.MatchString(*email)
}

func ValidPassword(password string) bool {
	return len(password) >= 6
}

// -- User Handlers --

// Handler to create a new user
func (h *UserHandler) CreateUserHandler(c *gin.Context) {
	var input muser.CreateUserInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if !ValidRole(input.Role) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid role"})
		return
	}
	if !ValidEmail(input.Email) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid email"})
		return
	}
	if !ValidPassword(input.Password) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Password too short"})
		return
	}
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}
	var id int
	err = h.DB.QueryRow(
		`INSERT INTO users (username, password_hash, full_name, email, phone, nip, specialization, license_number, role, is_active, profile_picture_url, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, TRUE, $10, NOW(), NOW()) RETURNING id`,
		input.Username, string(hashedPassword), input.FullName, input.Email, input.Phone, input.NIP, input.Specialization, input.LicenseNumber, input.Role, input.ProfilePictureURL,
	).Scan(&id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user: " + err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "User created", "data": id})
}

// Handler to update a user
func (h *UserHandler) UpdateUserHandler(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	var input muser.UpdateUserInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	h.performUpdate(c, id, input)
}

// Handler to delete a user
func (h *UserHandler) DeleteUserHandler(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}
	_, err = h.DB.Exec("DELETE FROM users WHERE id = $1", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete user"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "User deleted"})
}

// Handler to get a user by ID
func (h *UserHandler) GetUserHandler(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}
	var u muser.User
	err = h.DB.QueryRow(
		`SELECT id, username, full_name, email, phone, nip, specialization, license_number, role, is_active, profile_picture_url, created_at, updated_at
         FROM users WHERE id = $1`, id).
		Scan(&u.ID, &u.Username, &u.FullName, &u.Email, &u.Phone, &u.NIP, &u.Specialization, &u.LicenseNumber, &u.Role, &u.IsActive, &u.ProfilePictureURL, &u.CreatedAt, &u.UpdatedAt)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": muser.ToUserResponse(u)})
}

// Handler to list all users
func (h *UserHandler) ListUsersHandler(c *gin.Context) {
	rows, err := h.DB.Query(
		`SELECT id, username, full_name, email, phone, nip, specialization, license_number, role, is_active, profile_picture_url, created_at, updated_at FROM users`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get users"})
		return
	}
	defer rows.Close()
	var users []muser.User
	for rows.Next() {
		var u muser.User
		if err := rows.Scan(&u.ID, &u.Username, &u.FullName, &u.Email, &u.Phone, &u.NIP, &u.Specialization, &u.LicenseNumber, &u.Role, &u.IsActive, &u.ProfilePictureURL, &u.CreatedAt, &u.UpdatedAt); err == nil {
			users = append(users, u)
		}
	}
	c.JSON(http.StatusOK, gin.H{"data": muser.ToUserResponses(users)})
}

// GetMeHandler returns current logged in user info
func (h *UserHandler) GetMeHandler(c *gin.Context) {
	userID := utils.GetUserIDFromContext(c)
	if userID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var u muser.User
	err := h.DB.QueryRow(
		`SELECT id, username, full_name, email, phone, nip, specialization, license_number, role, is_active, profile_picture_url, created_at, updated_at
         FROM users WHERE id = $1`, userID).
		Scan(&u.ID, &u.Username, &u.FullName, &u.Email, &u.Phone, &u.NIP, &u.Specialization, &u.LicenseNumber, &u.Role, &u.IsActive, &u.ProfilePictureURL, &u.CreatedAt, &u.UpdatedAt)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": muser.ToUserResponse(u)})
}

// UpdateMeHandler allows a user to update their own profile
func (h *UserHandler) UpdateMeHandler(c *gin.Context) {
	userID := utils.GetUserIDFromContext(c)
	if userID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var input muser.UpdateUserInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// For UpdateMe, we don't allow changing role or is_active
	input.Role = nil
	input.IsActive = nil

	// Call UpdateUser internal logic or just re-implement a restricted one
	h.performUpdate(c, userID, input)
}

func (h *UserHandler) performUpdate(c *gin.Context, id int, input muser.UpdateUserInput) {
	var set []string
	var args []interface{}
	idx := 1

	if input.FullName != nil {
		set = append(set, fmt.Sprintf("full_name = $%d", idx))
		args = append(args, *input.FullName)
		idx++
	}
	if input.Email != nil {
		if !ValidEmail(input.Email) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid email"})
			return
		}
		set = append(set, fmt.Sprintf("email = $%d", idx))
		args = append(args, *input.Email)
		idx++
	}
	if input.Phone != nil {
		set = append(set, fmt.Sprintf("phone = $%d", idx))
		args = append(args, *input.Phone)
		idx++
	}
	if input.Password != nil && *input.Password != "" {
		if !ValidPassword(*input.Password) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Password too short"})
			return
		}
		hashed, _ := bcrypt.GenerateFromPassword([]byte(*input.Password), bcrypt.DefaultCost)
		set = append(set, fmt.Sprintf("password_hash = $%d", idx))
		args = append(args, string(hashed))
		idx++
	}
	if input.NIP != nil {
		set = append(set, fmt.Sprintf("nip = $%d", idx))
		args = append(args, *input.NIP)
		idx++
	}
	if input.Specialization != nil {
		set = append(set, fmt.Sprintf("specialization = $%d", idx))
		args = append(args, *input.Specialization)
		idx++
	}
	if input.LicenseNumber != nil {
		set = append(set, fmt.Sprintf("license_number = $%d", idx))
		args = append(args, *input.LicenseNumber)
		idx++
	}
	if input.Role != nil {
		set = append(set, fmt.Sprintf("role = $%d", idx))
		args = append(args, *input.Role)
		idx++
	}
	if input.IsActive != nil {
		set = append(set, fmt.Sprintf("is_active = $%d", idx))
		args = append(args, *input.IsActive)
		idx++
	}
	if input.ProfilePictureURL != nil {
		set = append(set, fmt.Sprintf("profile_picture_url = $%d", idx))
		args = append(args, *input.ProfilePictureURL)
		idx++
	}

	if len(set) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No data to update"})
		return
	}

	set = append(set, "updated_at = NOW()")
	query := "UPDATE users SET " + joinComma(set) + fmt.Sprintf(" WHERE id = $%d", idx)
	args = append(args, id)

	_, err := h.DB.Exec(query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user: " + err.Error()})
		return
	}

	// Event log
	h.Logger.Log(c, id, "UPDATE", "users", id, "Memperbarui profil user")

	c.JSON(http.StatusOK, gin.H{"message": "Profile updated"})
}

// UploadProfilePictureHandler handles profile picture upload
func (h *UserHandler) UploadProfilePictureHandler(c *gin.Context) {
	userID := utils.GetUserIDFromContext(c)
	if userID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	file, err := c.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to get image: " + err.Error()})
		return
	}

	// Create directory if not exists
	uploadPath := "./uploads"
	if err := os.MkdirAll(uploadPath, os.ModePerm); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create upload directory"})
		return
	}

	// Filename: user_{id}_{timestamp}.ext
	ext := filepath.Ext(file.Filename)
	filename := fmt.Sprintf("user_%d_%d%s", userID, time.Now().Unix(), ext)
	filePath := filepath.Join(uploadPath, filename)

	if err := c.SaveUploadedFile(file, filePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save image"})
		return
	}

	// Update DB
	photoURL := "/api/uploads/" + filename
	_, err = h.DB.Exec("UPDATE users SET profile_picture_url = $1, updated_at = NOW() WHERE id = $2", photoURL, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update profile picture in database"})
		return
	}

	h.Logger.Log(c, userID, "UPDATE", "users", userID, "Mengunggah foto profil")

	c.JSON(http.StatusOK, gin.H{
		"message": "Photo uploaded successfully",
		"url":     photoURL,
	})
}

// Helper to join comma
func joinComma(strs []string) string {
	out := ""
	for i, s := range strs {
		if i > 0 {
			out += ", "
		}
		out += s
	}
	return out
}

// Remove global jwtSecret

// Handler to login user (pakai username)
func (h *UserHandler) LoginHandler(c *gin.Context) {
	var input struct {
		Username string `json:"username" binding:"required"`
		Password string `json:"password" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	var u struct {
		ID           int
		Username     string
		PasswordHash string
		Role         string
		IsActive     bool
	}

	err := h.DB.QueryRow(
		"SELECT id, username, password_hash, role, is_active FROM users WHERE username = $1", input.Username).
		Scan(&u.ID, &u.Username, &u.PasswordHash, &u.Role, &u.IsActive)
	if err != nil || !u.IsActive {
		c.JSON(401, gin.H{"error": "Invalid credentials"})
		return
	}

	if bcrypt.CompareHashAndPassword([]byte(u.PasswordHash), []byte(input.Password)) != nil {
		c.JSON(401, gin.H{"error": "Invalid credentials"})
		return
	}

	// Generate JWT token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id":  u.ID,
		"username": u.Username,
		"role":     u.Role,
		"exp":      time.Now().Add(time.Hour * 24).Unix(),
	})
	tokenString, err := token.SignedString([]byte(h.JWTSecret))
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to generate token"})
		return
	}

	c.JSON(200, gin.H{
		"message": "Login success",
		"data": gin.H{
			"token": tokenString,
			"user": gin.H{
				"id":        u.ID,
				"username":  u.Username,
				"role":      u.Role,
				"is_active": u.IsActive,
			},
		},
	})
}

// Handler to register a new user (public)
func (h *UserHandler) RegisterHandler(c *gin.Context) {
	var input muser.CreateUserInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if !ValidRole(input.Role) {
		input.Role = "pasien" // default to pasien if invalid
	}
	if !ValidEmail(input.Email) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid email"})
		return
	}
	if !ValidPassword(input.Password) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Password too short"})
		return
	}
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}
	var u struct {
		ID       int
		Username string
		Role     string
		IsActive bool
	}
	err = h.DB.QueryRow(
		`INSERT INTO users (username, password_hash, full_name, email, phone, nip, specialization, license_number, role, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, TRUE, NOW(), NOW()) 
		 RETURNING id, username, role, is_active`,
		input.Username, string(hashedPassword), input.FullName, input.Email, input.Phone, input.NIP, input.Specialization, input.LicenseNumber, input.Role,
	).Scan(&u.ID, &u.Username, &u.Role, &u.IsActive)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to register user: " + err.Error()})
		return
	}

	// Auto login after register: Generate JWT token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id":  u.ID,
		"username": u.Username,
		"role":     u.Role,
		"exp":      time.Now().Add(time.Hour * 24).Unix(),
	})
	tokenString, err := token.SignedString([]byte(h.JWTSecret))
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to generate token"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "User registered",
		"data": gin.H{
			"token": tokenString,
			"user": gin.H{
				"id":        u.ID,
				"username":  u.Username,
				"role":      u.Role,
				"is_active": u.IsActive,
			},
		},
	})
}
