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
// CreateBranch godoc
// @Summary Create branch
// @Description Create a new branch
// @Tags Branches
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body models.Branch true "Branch payload"
// @Success 201 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 403 {object} map[string]interface{}
// @Router /branches [post]
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

// GetBranches godoc
// @Summary List branches
// @Description Get all branches
// @Tags Branches
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Router /branches [get]
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

// GetBranchByID godoc
// @Summary Get branch by ID
// @Description Get a single branch by its ID
// @Tags Branches
// @Produce json
// @Param id path string true "Branch ID"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Router /branches/{id} [get]
func GetBranchByID(c *gin.Context) {
	idParam := c.Param("id")

	objectID, err := primitive.ObjectIDFromHex(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid branch id",
		})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	collection := config.DB.Collection("branches")

	var branch models.Branch
	err = collection.FindOne(ctx, bson.M{"_id": objectID}).Decode(&branch)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "branch not found",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": branch,
	})
}

// UpdateBranch godoc
// @Summary Update branch
// @Description Update branch by ID
// @Tags Branches
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Branch ID"
// @Param request body models.Branch true "Branch payload"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 403 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Router /branches/{id} [put]
func UpdateBranch(c *gin.Context) {
	idParam := c.Param("id")

	objectID, err := primitive.ObjectIDFromHex(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid branch id",
		})
		return
	}

	var input models.Branch
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid request body",
		})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	collection := config.DB.Collection("branches")

	update := bson.M{
		"$set": bson.M{
			"name":     input.Name,
			"location": input.Location,
			"phone":    input.Phone,
		},
	}

	result, err := collection.UpdateOne(ctx, bson.M{"_id": objectID}, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to update branch",
		})
		return
	}

	if result.MatchedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "branch not found",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "branch updated successfully",
	})
}

// DeleteBranch godoc
// @Summary Delete branch
// @Description Hard delete branch by ID
// @Tags Branches
// @Produce json
// @Security BearerAuth
// @Param id path string true "Branch ID"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 403 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Router /branches/{id} [delete]
func DeleteBranch(c *gin.Context) {
	idParam := c.Param("id")

	objectID, err := primitive.ObjectIDFromHex(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid branch id",
		})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	collection := config.DB.Collection("branches")

	result, err := collection.DeleteOne(ctx, bson.M{"_id": objectID})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to delete branch",
		})
		return
	}

	if result.DeletedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "branch not found",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "branch deleted successfully",
	})
}