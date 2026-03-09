package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/tangtnp/queueplus/backend/internal/handlers"
)

func SetupRoutes(r *gin.Engine) {
	api := r.Group("/api/v1")
	{
		api.GET("/health", handlers.HealthCheck)
	}
}