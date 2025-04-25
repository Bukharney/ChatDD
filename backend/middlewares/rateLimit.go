package middlewares

import (
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

var (
	loginAttempts = make(map[string][]time.Time)
	mu            sync.Mutex
)

const (
	maxAttempts = 5
	window      = 15 * time.Minute
)

// isRateLimited checks if a given IP has exceeded login attempts within a time window
func isRateLimited(key string) bool {
	now := time.Now()
	mu.Lock()
	defer mu.Unlock()

	attempts := loginAttempts[key]

	// Filter out old attempts
	var recent []time.Time
	for _, t := range attempts {
		if now.Sub(t) < window {
			recent = append(recent, t)
		}
	}

	// Add current attempt
	loginAttempts[key] = append(recent, now)

	return len(recent) >= maxAttempts
}

func RateLimit() gin.HandlerFunc {
	return func(c *gin.Context) {
		ip := c.ClientIP()

		key := "login:" + ip
		if isRateLimited(key) {
			c.JSON(http.StatusTooManyRequests, gin.H{
				"error": "Too many login attempts. Please try again later.",
			})
			c.Abort()
			return
		}

		c.Next()
	}
}
