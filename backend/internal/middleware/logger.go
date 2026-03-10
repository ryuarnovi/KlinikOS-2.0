package middleware

import (
	"log"
	"time"

	"github.com/gin-gonic/gin"
)

// LoggerMiddleware logs the incoming HTTP request and the time it took to process.
func LoggerMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		path := c.Request.URL.Path
		method := c.Request.Method

		c.Next() // process request

		status := c.Writer.Status()
		duration := time.Since(start)
		log.Printf("%s %s - %d (%v)", method, path, status, duration)
	}
}
