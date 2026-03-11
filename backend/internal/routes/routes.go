package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/tangtnp/queueplus/backend/internal/handlers"
)

func SetupRoutes(r *gin.Engine) {
	api := r.Group("/api/v1")
	{
		api.GET("/health", handlers.HealthCheck)

		api.POST("/auth/register", handlers.Register)
		api.POST("/auth/login", handlers.Login)

		api.POST("/branches", handlers.CreateBranch)
		api.GET("/branches", handlers.GetBranches)
		api.GET("/branches/:id", handlers.GetBranchByID)
		api.PUT("/branches/:id", handlers.UpdateBranch)
		api.DELETE("/branches/:id", handlers.DeleteBranch)

		api.POST("/services", handlers.CreateService)
		api.GET("/services", handlers.GetServices)
		api.GET("/services/:id", handlers.GetServiceByID)
		api.PUT("/services/:id", handlers.UpdateService)
		api.DELETE("/services/:id", handlers.DeleteService)

		api.POST("/queues", handlers.CreateQueue)
		api.GET("/queues", handlers.GetQueues)
		api.GET("/queues/:id", handlers.GetQueueByID)
		api.PATCH("/queues/:id/status", handlers.UpdateQueueStatus)
	}
}