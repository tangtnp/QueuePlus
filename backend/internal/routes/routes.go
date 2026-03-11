package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/tangtnp/queueplus/backend/internal/handlers"
)

func SetupRoutes(r *gin.Engine) {
	api := r.Group("/api/v1")
	{
		api.GET("/health", handlers.HealthCheck)

		api.POST("/branches", handlers.CreateBranch)
		api.GET("/branches", handlers.GetBranches)
		api.GET("/branches/:id", handlers.GetBranchByID)
		api.PUT("/branches/:id", handlers.UpdateBranch)
		api.DELETE("/branches/:id", handlers.DeleteBranch)
	}
}