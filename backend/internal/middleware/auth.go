package middleware

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

// Remove global jwtSecret

func AdminOnly() gin.HandlerFunc {
	return func(c *gin.Context) {
		roleObj, _ := c.Get("role")
		role := strings.ToLower(fmt.Sprintf("%v", roleObj))
		if role != "admin" {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "admin only"})
			return
		}
		c.Next()
	}
}

func ReceptionistOnly() gin.HandlerFunc {
	return func(c *gin.Context) {
		roleObj, _ := c.Get("role")
		role := strings.ToLower(fmt.Sprintf("%v", roleObj))
		if role != "resepsionis" && role != "admin" {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "receptionist only"})
			return
		}
		c.Next()
	}
}

func CashierOnly() gin.HandlerFunc {
	return func(c *gin.Context) {
		roleObj, _ := c.Get("role")
		role := strings.ToLower(fmt.Sprintf("%v", roleObj))
		if role != "kasir" && role != "admin" {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "cashier only"})
			return
		}
		c.Next()
	}
}

func PatientOnly() gin.HandlerFunc {
	return func(c *gin.Context) {
		roleObj, _ := c.Get("role")
		role := strings.ToLower(fmt.Sprintf("%v", roleObj))
		if role != "pasien" && role != "admin" {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "patient only"})
			return
		}
		c.Next()
	}
}

func ApotecerOnly() gin.HandlerFunc {
	return func(c *gin.Context) {
		roleObj, _ := c.Get("role")
		role := strings.ToLower(fmt.Sprintf("%v", roleObj))
		if role != "apoteker" && role != "admin" {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "apoteker only"})
			return
		}
		c.Next()
	}
}

func DoctorOnly() gin.HandlerFunc {
	return func(c *gin.Context) {
		roleObj, _ := c.Get("role")
		role := strings.ToLower(fmt.Sprintf("%v", roleObj))
		if role != "dokter" && role != "admin" {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "dokter only"})
			return
		}
		c.Next()
	}
}

func NurseOnly() gin.HandlerFunc {
	return func(c *gin.Context) {
		roleObj, _ := c.Get("role")
		role := strings.ToLower(fmt.Sprintf("%v", roleObj))
		if role != "perawat" && role != "admin" {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "nurse only"})
			return
		}
		c.Next()
	}
}

// AuthMiddleware is a simple authentication middleware example.
func AuthMiddleware(secretKey string) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if !strings.HasPrefix(authHeader, "Bearer ") {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "missing or invalid token"})
			return
		}
		tokenString := strings.TrimPrefix(authHeader, "Bearer ")

		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			return []byte(secretKey), nil
		})
		if err != nil || !token.Valid {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
			return
		}
		if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
			if role, ok := claims["role"].(string); ok {
				c.Set("role", role)
			}
			if userID, ok := claims["user_id"]; ok {
				c.Set("userID", userID)
			}
		}
		c.Next()
	}
}

func ProtectedEndpoint(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "You are authorized to access this endpoint."})
}
