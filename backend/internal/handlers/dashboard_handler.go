package handlers

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/tangtnp/queueplus/backend/config"
	"go.mongodb.org/mongo-driver/bson"
)

func GetQueueStats(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	queueCollection := config.DB.Collection("queues")

	// 1) total queues
	totalQueues, err := queueCollection.CountDocuments(ctx, bson.M{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to count total queues",
		})
		return
	}

	// 2) count by status
	statusPipeline := mongoPipeline(
		bson.M{
			"$group": bson.M{
				"_id":   "$status",
				"count": bson.M{"$sum": 1},
			},
		},
	)

	statusCursor, err := queueCollection.Aggregate(ctx, statusPipeline)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to aggregate status stats",
		})
		return
	}
	defer statusCursor.Close(ctx)

	var statusStats []bson.M
	if err := statusCursor.All(ctx, &statusStats); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to decode status stats",
		})
		return
	}

	// 3) count by branch
	branchPipeline := mongoPipeline(
		bson.M{
			"$group": bson.M{
				"_id":   "$branchId",
				"count": bson.M{"$sum": 1},
			},
		},
		bson.M{
			"$lookup": bson.M{
				"from":         "branches",
				"localField":   "_id",
				"foreignField": "_id",
				"as":           "branch",
			},
		},
		bson.M{
			"$unwind": bson.M{
				"path":                       "$branch",
				"preserveNullAndEmptyArrays": true,
			},
		},
		bson.M{
			"$project": bson.M{
				"_id":        0,
				"branchId":   "$_id",
				"branchName": "$branch.name",
				"count":      1,
			},
		},
	)

	branchCursor, err := queueCollection.Aggregate(ctx, branchPipeline)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to aggregate branch stats",
		})
		return
	}
	defer branchCursor.Close(ctx)

	var branchStats []bson.M
	if err := branchCursor.All(ctx, &branchStats); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to decode branch stats",
		})
		return
	}

	// 4) daily totals
	dailyPipeline := mongoPipeline(
		bson.M{
			"$group": bson.M{
				"_id": bson.M{
					"year":  bson.M{"$year": "$createdAt"},
					"month": bson.M{"$month": "$createdAt"},
					"day":   bson.M{"$dayOfMonth": "$createdAt"},
				},
				"count": bson.M{"$sum": 1},
			},
		},
		bson.M{
			"$sort": bson.M{
				"_id.year":  1,
				"_id.month": 1,
				"_id.day":   1,
			},
		},
	)

	dailyCursor, err := queueCollection.Aggregate(ctx, dailyPipeline)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to aggregate daily stats",
		})
		return
	}
	defer dailyCursor.Close(ctx)

	var dailyStats []bson.M
	if err := dailyCursor.All(ctx, &dailyStats); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to decode daily stats",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"summary": gin.H{
			"totalQueues": totalQueues,
		},
		"statusStats": statusStats,
		"branchStats": branchStats,
		"dailyStats":  dailyStats,
	})
}

func mongoPipeline(stages ...bson.M) []bson.M {
	return stages
}