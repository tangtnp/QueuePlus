package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Queue struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	QueueNumber string             `bson:"queueNumber" json:"queueNumber"`
	CustomerName string            `bson:"customerName" json:"customerName"`
	UserID      primitive.ObjectID `bson:"userId" json:"userId"`
	BranchID    primitive.ObjectID `bson:"branchId" json:"branchId"`
	ServiceID   primitive.ObjectID `bson:"serviceId" json:"serviceId"`
	Status      string             `bson:"status" json:"status"`
	CreatedAt   time.Time          `bson:"createdAt" json:"createdAt"`
	UpdatedAt   time.Time          `bson:"updatedAt" json:"updatedAt"`
}