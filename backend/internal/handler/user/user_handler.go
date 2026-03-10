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
	"golang.org/x/crypto/bcrypt"
)

type UserHandler struct {
	DB        *sql.DB
	JWTSecret string
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
		`INSERT INTO users (username, password_hash, full_name, email, phone, role, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, TRUE, NOW(), NOW()) RETURNING id`,
		input.Username, string(hashedPassword), input.FullName, input.Email, input.Phone, input.Role,
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
	// Build query dynamically
	args := []interface{}{}
	set := []string{}
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
	if input.Role != nil {
		if !ValidRole(*input.Role) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid role"})
			return
		}
		set = append(set, fmt.Sprintf("role = $%d", idx))
		args = append(args, *input.Role)
		idx++
	}
	if input.IsActive != nil {
		set = append(set, fmt.Sprintf("is_active = $%d", idx))
		args = append(args, *input.IsActive)
		idx++
	}
	if input.Password != nil {
		if !ValidPassword(*input.Password) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Password too short"})
			return
		}
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(*input.Password), bcrypt.DefaultCost)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
			return
		}
		set = append(set, fmt.Sprintf("password_hash = $%d", idx))
		args = append(args, string(hashedPassword))
		idx++
	}
	set = append(set, "updated_at = NOW()")
	query := "UPDATE users SET " + joinComma(set) + fmt.Sprintf(" WHERE id = $%d", idx)
	args = append(args, id)

	_, err = h.DB.Exec(query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "User updated"})
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
		`SELECT id, username, full_name, email, phone, role, is_active, created_at, updated_at
         FROM users WHERE id = $1`, id).
		Scan(&u.ID, &u.Username, &u.FullName, &u.Email, &u.Phone, &u.Role, &u.IsActive, &u.CreatedAt, &u.UpdatedAt)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": muser.ToUserResponse(u)})
}

// Handler to list all users
func (h *UserHandler) ListUsersHandler(c *gin.Context) {
	rows, err := h.DB.Query(
		`SELECT id, username, full_name, email, phone, role, is_active, created_at, updated_at FROM users`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get users"})
		return
	}
	defer rows.Close()
	var users []muser.User
	for rows.Next() {
		var u muser.User
		if err := rows.Scan(&u.ID, &u.Username, &u.FullName, &u.Email, &u.Phone, &u.Role, &u.IsActive, &u.CreatedAt, &u.UpdatedAt); err == nil {
			users = append(users, u)
		}
	}
	c.JSON(http.StatusOK, gin.H{"data": muser.ToUserResponses(users)})
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
		`INSERT INTO users (username, password_hash, full_name, email, phone, role, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, TRUE, NOW(), NOW()) 
		 RETURNING id, username, role, is_active`,
		input.Username, string(hashedPassword), input.FullName, input.Email, input.Phone, input.Role,
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
