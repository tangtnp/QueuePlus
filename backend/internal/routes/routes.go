package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/tangtnp/queueplus/backend/internal/handlers"
	"github.com/tangtnp/queueplus/backend/internal/middleware"
)

func SetupRoutes(r *gin.Engine) {
	api := r.Group("/api/v1")
	{
		api.GET("/health", handlers.HealthCheck)

		api.POST("/auth/register", handlers.Register)
		api.POST("/auth/login", handlers.Login)
		api.POST("/auth/logout", middleware.AuthMiddleware(), handlers.Logout)
		api.GET("/auth/me", middleware.AuthMiddleware(), handlers.GetMe)

		// public or customer-accessible
		api.GET("/branches", handlers.GetBranches)
		api.GET("/branches/:id", handlers.GetBranchByID)

		api.GET("/services", handlers.GetServices)
		api.GET("/services/:id", handlers.GetServiceByID)

		api.POST("/queues", handlers.CreateQueue)
		api.GET("/queues", handlers.GetQueues)
		api.GET("/queues/:id", handlers.GetQueueByID)

		// admin only
		admin := api.Group("/")
		admin.Use(middleware.AuthMiddleware(), middleware.RequireRoles("admin"))
		{
			admin.POST("/branches", handlers.CreateBranch)
			admin.PUT("/branches/:id", handlers.UpdateBranch)
			admin.DELETE("/branches/:id", handlers.DeleteBranch)

			admin.POST("/services", handlers.CreateService)
			admin.PUT("/services/:id", handlers.UpdateService)
			admin.DELETE("/services/:id", handlers.DeleteService)
		}

		// staff and admin
		staffOrAdmin := api.Group("/")
		staffOrAdmin.Use(middleware.AuthMiddleware(), middleware.RequireRoles("staff", "admin"))
		{
			staffOrAdmin.PATCH("/queues/:id/status", handlers.UpdateQueueStatus)
		}
	}
}