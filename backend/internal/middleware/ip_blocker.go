package middleware

import (
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

type ipInfo struct {
	RequestCount int
	BlockedUntil time.Time
	LastRequest  time.Time
}

var (
	ipRequests   = make(map[string]*ipInfo)
	ipMutex      sync.Mutex
)

const (
	maxRequestsPerWindow = 50
	windowDuration       = 30 * time.Second
	ipBlockDuration        = 1 * time.Minute
)

func IPBlockerMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {

		ip := c.ClientIP()
		now := time.Now()

		ipMutex.Lock()

		info, exists := ipRequests[ip]

		if !exists {
			ipRequests[ip] = &ipInfo{
				RequestCount: 1,
				LastRequest:  now,
			}
			ipMutex.Unlock()
			c.Next()
			return
		}

		if now.Before(info.BlockedUntil) {
			ipMutex.Unlock()

			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
				"error": "IP temporarily blocked",
			})
			return
		}

		if now.Sub(info.LastRequest) > windowDuration {
			info.RequestCount = 0
		}

		info.RequestCount++
		info.LastRequest = now

		if info.RequestCount > maxRequestsPerWindow {
			info.BlockedUntil = now.Add(ipBlockDuration)

			ipMutex.Unlock()

			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
				"error": "Too many requests. IP blocked temporarily",
			})
			return
		}

		ipMutex.Unlock()
		c.Next()
	}
}