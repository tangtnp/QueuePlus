package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type BlacklistedToken struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Token     string             `bson:"token" json:"token"`
	ExpiresAt time.Time          `bson:"expiresAt" json:"expiresAt"`
	CreatedAt time.Time          `bson:"createdAt" json:"createdAt"`
}