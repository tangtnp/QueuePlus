package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type Branch struct {
	ID       primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Name     string             `bson:"name" json:"name"`
	Location string             `bson:"location" json:"location"`
	Phone    string             `bson:"phone" json:"phone"`
}