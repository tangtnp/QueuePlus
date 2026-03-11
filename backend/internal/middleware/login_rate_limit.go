package middleware

import (
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

type loginAttemptInfo struct {
	Count        int
	BlockedUntil time.Time
	LastAttempt  time.Time
}

var (
	loginAttempts   = make(map[string]*loginAttemptInfo)
	loginAttemptsMu sync.Mutex
)

const (
	maxLoginAttempts = 10
	blockDuration    = 30 * time.Second
	resetAfter       = 5 * time.Minute
)

func LoginRateLimitMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		ip := c.ClientIP()
		now := time.Now()

		loginAttemptsMu.Lock()

		info, exists := loginAttempts[ip]
		if !exists {
			loginAttempts[ip] = &loginAttemptInfo{
				Count:       0,
				LastAttempt: now,
			}
			loginAttemptsMu.Unlock()
			c.Next()
			return
		}

		if !info.BlockedUntil.IsZero() && now.Before(info.BlockedUntil) {
			blockedUntil := info.BlockedUntil
			remainingSecs := int(time.Until(info.BlockedUntil).Seconds())
			loginAttemptsMu.Unlock()

			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
				"error":         "too many login attempts, try again later",
				"blockedUntil":  blockedUntil.UTC(),
				"remainingSecs": remainingSecs,
			})
			return
		}

		if now.Sub(info.LastAttempt) > resetAfter {
			info.Count = 0
			info.BlockedUntil = time.Time{}
		}

		info.LastAttempt = now
		loginAttemptsMu.Unlock()

		c.Next()
	}
}

func RegisterLoginFailure(ip string) {
	now := time.Now()

	loginAttemptsMu.Lock()
	defer loginAttemptsMu.Unlock()

	info, exists := loginAttempts[ip]
	if !exists {
		loginAttempts[ip] = &loginAttemptInfo{
			Count:       1,
			LastAttempt: now,
		}
		return
	}

	if now.Sub(info.LastAttempt) > resetAfter {
		info.Count = 0
		info.BlockedUntil = time.Time{}
	}

	info.Count++
	info.LastAttempt = now

	if info.Count >= maxLoginAttempts {
		info.BlockedUntil = now.Add(blockDuration)
	}
}

func ResetLoginAttempts(ip string) {
	loginAttemptsMu.Lock()
	defer loginAttemptsMu.Unlock()

	delete(loginAttempts, ip)
}