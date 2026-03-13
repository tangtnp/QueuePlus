// @title QueuePlus API
// @version 1.0
// @description QueuePlus backend API for queue management system.
// @description This API provides authentication, branch management, service management, and queue operations.
// @contact.name Tang Tanathorn
// @contact.email tangtnp@example.com
// @license.name MIT
// @host localhost:8080
// @BasePath /api/v1
// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization

package main

import (
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"

	_ "github.com/tangtnp/queueplus/backend/docs"

	"github.com/tangtnp/queueplus/backend/config"
	"github.com/tangtnp/queueplus/backend/internal/middleware"
	"github.com/tangtnp/queueplus/backend/internal/routes"
)

func main() {
	_ = godotenv.Load()

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	config.ConnectDB()

	r := gin.Default()
	r.Use(middleware.IPBlockerMiddleware())

	routes.SetupRoutes(r)

	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	log.Printf("server running at http://localhost:%s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatal(err)
	}
}