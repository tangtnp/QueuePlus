package handlers

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/tangtnp/queueplus/backend/config"
	"github.com/tangtnp/queueplus/backend/internal/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type CreateServiceInput struct {
	Name         string   `json:"name"`
	Description  string   `json:"description"`
	DurationMins int      `json:"durationMins"`
	BranchID     string   `json:"branchId"`
	Tags         []string `json:"tags"`
}

func CreateService(c *gin.Context) {
	var input CreateServiceInput

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid request body",
		})
		return
	}

	if input.Name == "" || input.BranchID == "" || input.DurationMins <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "name, branchId, and durationMins are required",
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

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	branchCollection := config.DB.Collection("branches")
	count, err := branchCollection.CountDocuments(ctx, bson.M{"_id": branchObjectID})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to validate branch",
		})
		return
	}

	if count == 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "branch not found",
		})
		return
	}

	service := models.Service{
		Name:         input.Name,
		Description:  input.Description,
		DurationMins: input.DurationMins,
		BranchID:     branchObjectID,
		Tags:         input.Tags,
		IsDeleted:    false,
		DeletedAt:    nil,
	}

	serviceCollection := config.DB.Collection("services")
	result, err := serviceCollection.InsertOne(ctx, service)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to create service",
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "service created successfully",
		"id":      result.InsertedID,
	})
}

func GetServices(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	collection := config.DB.Collection("services")

	filter := bson.M{
		"isDeleted": bson.M{"$ne": true},
	}

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

	cursor, err := collection.Find(ctx, filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to fetch services",
		})
		return
	}
	defer cursor.Close(ctx)

	var services []models.Service
	if err := cursor.All(ctx, &services); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to decode services",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": services,
	})
}

func GetServiceByID(c *gin.Context) {
	idParam := c.Param("id")

	objectID, err := primitive.ObjectIDFromHex(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid service id",
		})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	collection := config.DB.Collection("services")

	var service models.Service
	err = collection.FindOne(ctx, bson.M{
		"_id":       objectID,
		"isDeleted": bson.M{"$ne": true},
	}).Decode(&service)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "service not found",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": service,
	})
}

func UpdateService(c *gin.Context) {
	idParam := c.Param("id")

	serviceObjectID, err := primitive.ObjectIDFromHex(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid service id",
		})
		return
	}

	var input CreateServiceInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid request body",
		})
		return
	}

	if input.Name == "" || input.BranchID == "" || input.DurationMins <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "name, branchId, and durationMins are required",
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

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	branchCollection := config.DB.Collection("branches")
	count, err := branchCollection.CountDocuments(ctx, bson.M{"_id": branchObjectID})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to validate branch",
		})
		return
	}

	if count == 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "branch not found",
		})
		return
	}

	collection := config.DB.Collection("services")

	update := bson.M{
		"$set": bson.M{
			"name":         input.Name,
			"description":  input.Description,
			"durationMins": input.DurationMins,
			"branchId":     branchObjectID,
			"tags":         input.Tags,
		},
	}

	result, err := collection.UpdateOne(
		ctx,
		bson.M{
			"_id":       serviceObjectID,
			"isDeleted": bson.M{"$ne": true},
		},
		update,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to update service",
		})
		return
	}

	if result.MatchedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "service not found or already deleted",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "service updated successfully",
	})
}

func DeleteService(c *gin.Context) {
	idParam := c.Param("id")

	objectID, err := primitive.ObjectIDFromHex(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid service id",
		})
		return
	}

	now := time.Now().UTC()

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	collection := config.DB.Collection("services")

	result, err := collection.UpdateOne(
		ctx,
		bson.M{
			"_id":       objectID,
			"isDeleted": bson.M{"$ne": true},
		},
		bson.M{
			"$set": bson.M{
				"isDeleted": true,
				"deletedAt": now,
			},
		},
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to soft delete service",
		})
		return
	}

	if result.MatchedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "service not found or already deleted",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "service soft deleted successfully",
	})
}

func HardDeleteService(c *gin.Context) {
	idParam := c.Param("id")

	objectID, err := primitive.ObjectIDFromHex(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid service id",
		})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	collection := config.DB.Collection("services")

	result, err := collection.DeleteOne(ctx, bson.M{"_id": objectID})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to hard delete service",
		})
		return
	}

	if result.DeletedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "service not found",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "service hard deleted successfully",
	})
}

func SearchServicesByTags(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	collection := config.DB.Collection("services")

	tags := c.QueryArray("tags")
	if len(tags) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "at least one tags query param is required",
		})
		return
	}

	filter := bson.M{
		"isDeleted": bson.M{"$ne": true},
		"tags": bson.M{
			"$all": tags,
		},
	}

	cursor, err := collection.Find(ctx, filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to search services by tags",
		})
		return
	}
	defer cursor.Close(ctx)

	var services []models.Service
	if err := cursor.All(ctx, &services); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to decode services",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"filters": gin.H{
			"tags": tags,
		},
		"count": len(services),
		"data":  services,
	})
}