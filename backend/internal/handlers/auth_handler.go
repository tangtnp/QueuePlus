package handlers

import (
	"context"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/tangtnp/queueplus/backend/config"
	"github.com/tangtnp/queueplus/backend/internal/models"
	"github.com/tangtnp/queueplus/backend/internal/utils"
	"github.com/tangtnp/queueplus/backend/internal/middleware"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"golang.org/x/crypto/bcrypt"
)

type RegisterInput struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
	Role     string `json:"role"`
}

type LoginInput struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func Register(c *gin.Context) {
	var input RegisterInput

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid request body",
		})
		return
	}

	input.Email = strings.TrimSpace(strings.ToLower(input.Email))
	input.Name = strings.TrimSpace(input.Name)

	if input.Name == "" || input.Email == "" || input.Password == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "name, email, and password are required",
		})
		return
	}

	if input.Role == "" {
		input.Role = "customer"
	}

	validRoles := map[string]bool{
		"customer": true,
		"staff":    true,
		"admin":    true,
	}
	if !validRoles[input.Role] {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid role",
		})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	userCollection := config.DB.Collection("users")

	existingCount, err := userCollection.CountDocuments(ctx, bson.M{"email": input.Email})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to check existing user",
		})
		return
	}
	if existingCount > 0 {
		c.JSON(http.StatusConflict, gin.H{
			"error": "email already exists",
		})
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to hash password",
		})
		return
	}

	now := time.Now().UTC()

	user := models.User{
		Name:      input.Name,
		Email:     input.Email,
		Password:  string(hashedPassword),
		Role:      input.Role,
		CreatedAt: now,
		UpdatedAt: now,
	}

	result, err := userCollection.InsertOne(ctx, user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to register user",
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "user registered successfully",
		"id":      result.InsertedID,
		"email":   user.Email,
		"role":    user.Role,
	})
}

func Login(c *gin.Context) {
	var input LoginInput

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid request body",
		})
		return
	}

	input.Email = strings.TrimSpace(strings.ToLower(input.Email))

	if input.Email == "" || input.Password == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "email and password are required",
		})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	userCollection := config.DB.Collection("users")

	var user models.User
	err := userCollection.FindOne(ctx, bson.M{"email": input.Email}).Decode(&user)
	if err != nil {
		middleware.RegisterLoginFailure(c.ClientIP())

		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "invalid email or password",
		})
		return
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password))
	if err != nil {
		middleware.RegisterLoginFailure(c.ClientIP())

		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "invalid email or password",
		})
		return
	}

	middleware.ResetLoginAttempts(c.ClientIP())

	token, err := utils.GenerateJWT(user.ID.Hex(), user.Email, user.Role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to generate token",
		})
		return
	}

	isProd := os.Getenv("APP_ENV") == "production"

	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie(
		"access_token",
		token,
		60*60*24,
		"/",
		"",
		isProd,
		true,
	)

	c.JSON(http.StatusOK, gin.H{
		"message": "login successful",
		"user": gin.H{
			"id":    user.ID.Hex(),
			"name":  user.Name,
			"email": user.Email,
			"role":  user.Role,
		},
	})
}

func Logout(c *gin.Context) {
	tokenString, err := c.Cookie("access_token")
	if err == nil && tokenString != "" {
		claims, parseErr := utils.ParseJWT(tokenString)
		if parseErr == nil && claims.ExpiresAt != nil {
			ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
			defer cancel()

			blacklistCollection := config.DB.Collection("blacklisted_tokens")

			_, _ = blacklistCollection.InsertOne(ctx, bson.M{
				"token":     tokenString,
				"expiresAt": claims.ExpiresAt.Time,
				"createdAt": time.Now().UTC(),
			})
		}
	}

	isProd := os.Getenv("APP_ENV") == "production"

	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie(
		"access_token",
		"",
		-1,
		"/",
		"",
		isProd,
		true,
	)

	c.JSON(http.StatusOK, gin.H{
		"message": "logout successful",
	})
}

func GetMe(c *gin.Context) {
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

	objectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "invalid user id format",
		})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	userCollection := config.DB.Collection("users")

	var user models.User
	err = userCollection.FindOne(ctx, bson.M{"_id": objectID}).Decode(&user)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "user not found",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"user": gin.H{
			"id":        user.ID.Hex(),
			"name":      user.Name,
			"email":     user.Email,
			"role":      user.Role,
			"createdAt": user.CreatedAt,
			"updatedAt": user.UpdatedAt,
		},
	})
}