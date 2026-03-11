package handlers

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/tangtnp/queueplus/backend/config"
	"github.com/tangtnp/queueplus/backend/internal/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type CreateQueueInput struct {
	CustomerName string `json:"customerName"`
	BranchID     string `json:"branchId"`
	ServiceID    string `json:"serviceId"`
}

type UpdateQueueStatusInput struct {
	Status string `json:"status"`
}

func CreateQueue(c *gin.Context) {
	var input CreateQueueInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid request body",
		})
		return
	}

	if input.CustomerName == "" || input.BranchID == "" || input.ServiceID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "customerName, branchId, and serviceId are required",
		})
		return
	}

	branchObjectID, err := primitive.ObjectIDFromHex(input.BranchID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid branchId",
		})
		return
	}

	serviceObjectID, err := primitive.ObjectIDFromHex(input.ServiceID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid serviceId",
		})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	branchCollection := config.DB.Collection("branches")
	branchCount, err := branchCollection.CountDocuments(ctx, bson.M{"_id": branchObjectID})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to validate branch",
		})
		return
	}
	if branchCount == 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "branch not found",
		})
		return
	}

	serviceCollection := config.DB.Collection("services")
	var service models.Service
	err = serviceCollection.FindOne(ctx, bson.M{
		"_id":      serviceObjectID,
		"branchId": branchObjectID,
	}).Decode(&service)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "service not found in this branch",
		})
		return
	}

	queueCollection := config.DB.Collection("queues")

	todayStart := time.Now().UTC().Truncate(24 * time.Hour)
	tomorrowStart := todayStart.Add(24 * time.Hour)

	countToday, err := queueCollection.CountDocuments(ctx, bson.M{
		"branchId": branchObjectID,
		"createdAt": bson.M{
			"$gte": todayStart,
			"$lt":  tomorrowStart,
		},
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to generate queue number",
		})
		return
	}

	queueNumber := fmt.Sprintf("A%03d", countToday+1)
	now := time.Now().UTC()

	queue := models.Queue{
		QueueNumber:  queueNumber,
		CustomerName: input.CustomerName,
		BranchID:     branchObjectID,
		ServiceID:    serviceObjectID,
		Status:       "waiting",
		CreatedAt:    now,
		UpdatedAt:    now,
	}

	result, err := queueCollection.InsertOne(ctx, queue)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to create queue",
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":     "queue created successfully",
		"id":          result.InsertedID,
		"queueNumber": queueNumber,
		"status":      "waiting",
	})
}

func GetQueues(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	collection := config.DB.Collection("queues")

	filter := bson.M{}

	branchID := c.Query("branchId")
	if branchID != "" {
		objectID, err := primitive.ObjectIDFromHex(branchID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "invalid branchId",
			})
			return
		}
		filter["branchId"] = objectID
	}

	serviceID := c.Query("serviceId")
	if serviceID != "" {
		objectID, err := primitive.ObjectIDFromHex(serviceID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "invalid serviceId",
			})
			return
		}
		filter["serviceId"] = objectID
	}

	status := c.Query("status")
	if status != "" {
		filter["status"] = status
	}

	cursor, err := collection.Find(ctx, filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to fetch queues",
		})
		return
	}
	defer cursor.Close(ctx)

	var queues []models.Queue
	if err := cursor.All(ctx, &queues); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to decode queues",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": queues,
	})
}

func GetQueueByID(c *gin.Context) {
	idParam := c.Param("id")

	objectID, err := primitive.ObjectIDFromHex(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid queue id",
		})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	collection := config.DB.Collection("queues")

	var queue models.Queue
	err = collection.FindOne(ctx, bson.M{"_id": objectID}).Decode(&queue)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "queue not found",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": queue,
	})
}

func UpdateQueueStatus(c *gin.Context) {
	idParam := c.Param("id")

	queueObjectID, err := primitive.ObjectIDFromHex(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid queue id",
		})
		return
	}

	var input UpdateQueueStatusInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid request body",
		})
		return
	}

	validStatuses := map[string]bool{
		"waiting":   true,
		"serving":   true,
		"done":      true,
		"cancelled": true,
	}

	if !validStatuses[input.Status] {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid status",
		})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	collection := config.DB.Collection("queues")

	update := bson.M{
		"$set": bson.M{
			"status":    input.Status,
			"updatedAt": time.Now().UTC(),
		},
	}

	result, err := collection.UpdateOne(ctx, bson.M{"_id": queueObjectID}, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to update queue status",
		})
		return
	}

	if result.MatchedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "queue not found",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "queue status updated successfully",
		"status":  input.Status,
	})
}