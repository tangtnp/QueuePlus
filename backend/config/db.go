package config

import (
	"context"
	"log"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var DB *mongo.Database

func ConnectDB() {
	uri := os.Getenv("MONGO_URI")
	dbName := os.Getenv("DB_NAME")

	if uri == "" {
		log.Fatal("MONGO_URI is not set")
	}
	if dbName == "" {
		log.Fatal("DB_NAME is not set")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, options.Client().ApplyURI(uri))
	if err != nil {
		log.Fatal("failed to connect mongo:", err)
	}

	if err := client.Ping(ctx, nil); err != nil {
		log.Fatal("failed to ping mongo:", err)
	}

	DB = client.Database(dbName)
	log.Println("connected to MongoDB:", dbName)
}