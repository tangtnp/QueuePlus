package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
)
// HealthCheck godoc
// @Summary Health check
// @Description Check whether QueuePlus backend is running
// @Tags Monitor
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Router /health [get]
func HealthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status":  "ok",
		"message": "Queue+ backend is running",
	})
}