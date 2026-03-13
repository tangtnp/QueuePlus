package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

type ExternalPost struct {
	UserID int    `json:"userId"`
	ID     int    `json:"id"`
	Title  string `json:"title"`
	Body   string `json:"body"`
}

type TransformedPost struct {
	ID      int    `json:"id"`
	Title   string `json:"title"`
	Summary string `json:"summary"`
}

// GetExternalPosts godoc
// @Summary External posts
// @Description Fetch posts from an external API and transform the response
// @Tags External
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Failure 502 {object} map[string]interface{}
// @Router /external/posts [get]
func GetExternalPosts(c *gin.Context) {

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	client := &http.Client{}

	req, err := http.NewRequestWithContext(ctx,
		http.MethodGet,
		"https://jsonplaceholder.typicode.com/posts",
		nil,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to create request",
		})
		return
	}

	resp, err := client.Do(req)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{
			"error": "failed to call external API",
		})
		return
	}
	defer resp.Body.Close()

	var posts []ExternalPost

	if err := json.NewDecoder(resp.Body).Decode(&posts); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to decode external data",
		})
		return
	}

	var transformed []TransformedPost

	for _, p := range posts {

		summary := p.Body
		if len(summary) > 60 {
			summary = summary[:60] + "..."
		}

		transformed = append(transformed, TransformedPost{
			ID:      p.ID,
			Title:   p.Title,
			Summary: summary,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"source": "jsonplaceholder",
		"count":  len(transformed),
		"data":   transformed,
	})
}