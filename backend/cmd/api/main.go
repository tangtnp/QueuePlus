package main

import (
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/tangtnp/queueplus/backend/config"
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
	routes.SetupRoutes(r)

	log.Printf("server running at http://localhost:%s", port)

	if err := r.Run(":" + port); err != nil {
		log.Fatal(err)
	}
}