package handlers

import (
	"context"
	"fmt"
	"net/http"
	"time"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/tangtnp/queueplus/backend/config"
	"github.com/tangtnp/queueplus/backend/internal/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type CreateQueueInput struct {
	CustomerName string `json:"customerName"`
	UserID     string `json:"userId"`
	BranchID     string `json:"branchId"`
	ServiceID    string `json:"serviceId"`
}

type UpdateQueueStatusInput struct {
	Status string `json:"status"`
}

// CreateQueue godoc
// @Summary Create queue
// @Description Create a new queue for a customer under a branch and service
// @Tags Queues
// @Accept json
// @Produce json
// @Param request body handlers.CreateQueueInput true "Queue payload"
// @Success 201 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Router /queues [post]
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

	userObjectID, err := primitive.ObjectIDFromHex(input.UserID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid userId",
		})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

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
		UserID:       userObjectID,
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

// GetQueues godoc
// @Summary List queues
// @Description Get queues with filtering, pagination, and sorting
// @Tags Queues
// @Produce json
// @Param branchId query string false "Branch ID"
// @Param serviceId query string false "Service ID"
// @Param status query string false "Queue status"
// @Param page query int false "Page number"
// @Param limit query int false "Items per page"
// @Param sortBy query string false "Sort field"
// @Param sortOrder query string false "asc or desc"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Router /queues [get]
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

	page := 1
	limit := 10

	if pageQuery := c.Query("page"); pageQuery != "" {
		if parsedPage, err := strconv.Atoi(pageQuery); err == nil && parsedPage > 0 {
			page = parsedPage
		}
	}

	if limitQuery := c.Query("limit"); limitQuery != "" {
		if parsedLimit, err := strconv.Atoi(limitQuery); err == nil && parsedLimit > 0 && parsedLimit <= 100 {
			limit = parsedLimit
		}
	}

	skip := (page - 1) * limit

	sortBy := c.DefaultQuery("sortBy", "createdAt")
	sortOrder := c.DefaultQuery("sortOrder", "desc")

	sortDirection := -1
	if sortOrder == "asc" {
		sortDirection = 1
	}

	totalCount, err := collection.CountDocuments(ctx, filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to count queues",
		})
		return
	}

	findOptions := options.Find().
		SetSkip(int64(skip)).
		SetLimit(int64(limit)).
		SetSort(bson.D{{Key: sortBy, Value: sortDirection}})

	cursor, err := collection.Find(ctx, filter, findOptions)
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

	totalPages := int((totalCount + int64(limit) - 1) / int64(limit))

	c.JSON(http.StatusOK, gin.H{
		"pagination": gin.H{
			"page":       page,
			"limit":      limit,
			"totalCount": totalCount,
			"totalPages": totalPages,
			"hasNext":    page < totalPages,
			"hasPrev":    page > 1,
		},
		"filters": gin.H{
			"branchId":  branchID,
			"serviceId": serviceID,
			"status":    status,
			"sortBy":    sortBy,
			"sortOrder": sortOrder,
		},
		"data": queues,
	})
}

// GetQueueByID godoc
// @Summary Get queue by ID
// @Description Get a single queue by ID
// @Tags Queues
// @Produce json
// @Param id path string true "Queue ID"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Router /queues/{id} [get]
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

// UpdateQueueStatus godoc
// @Summary Update queue status
// @Description Update queue status such as waiting, serving, done, or cancelled
// @Tags Queues
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Queue ID"
// @Param request body handlers.UpdateQueueStatusInput true "Queue status payload"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 403 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Router /queues/{id}/status [patch]
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
		"completed": true,
		"cancelled": true,
		"called" : true,
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

// GetMyQueues godoc
// @Summary Get my queues
// @Description Get queues that belong to the currently authenticated customer
// @Tags Queues
// @Produce json
// @Security BearerAuth
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 403 {object} map[string]interface{}
// @Router /my/queues [get]
func GetMyQueues(c *gin.Context) {
	userIDValue, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "user not found in context",
		})
		return
	}

	userID, ok := userIDValue.(string)
	if !ok || userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "invalid user id in context",
		})
		return
	}

	uid, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid user id format",
		})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	collection := config.DB.Collection("queues")

	filter := bson.M{
		"userId": uid,
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
			"error": "decode error",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": queues,
	})
}
