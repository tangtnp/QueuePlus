package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Service struct {
	ID           primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Name         string             `bson:"name" json:"name"`
	Description  string             `bson:"description" json:"description"`
	DurationMins int                `bson:"durationMins" json:"durationMins"`
	BranchID     primitive.ObjectID `bson:"branchId" json:"branchId"`
	IsDeleted    bool               `bson:"isDeleted" json:"isDeleted"`
	DeletedAt    *time.Time         `bson:"deletedAt,omitempty" json:"deletedAt,omitempty"`
}