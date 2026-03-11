package handlers

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/tangtnp/queueplus/backend/config"
	"github.com/tangtnp/queueplus/backend/internal/models"
	"go.mongodb.org/mongo-driver/bson"
)

func CreateBranch(c *gin.Context) {
	var branch models.Branch

	if err := c.ShouldBindJSON(&branch); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid request body",
		})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	collection := config.DB.Collection("branches")

	result, err := collection.InsertOne(ctx, branch)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to create branch",
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "branch created successfully",
		"id":      result.InsertedID,
	})
}

func GetBranches(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	collection := config.DB.Collection("branches")

	cursor, err := collection.Find(ctx, bson.M{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to fetch branches",
		})
		return
	}
	defer cursor.Close(ctx)

	var branches []models.Branch
	if err := cursor.All(ctx, &branches); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to decode branches",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": branches,
	})
}