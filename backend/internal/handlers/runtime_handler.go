package handlers

import (
	"net/http"
	"runtime"
	"time"

	"github.com/gin-gonic/gin"
)

// GetRuntimeMonitor godoc
// @Summary Runtime monitor
// @Description Get Go runtime metrics such as goroutines, memory usage, and GC stats
// @Tags Monitor
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Router /monitor/runtime [get]
func GetRuntimeMonitor(c *gin.Context) {
	var mem runtime.MemStats
	runtime.ReadMemStats(&mem)

	uptime := time.Since(appStartTime)

	c.JSON(http.StatusOK, gin.H{
		"status": "ok",
		"runtime": gin.H{
			"goroutines":     runtime.NumGoroutine(),
			"goVersion":      runtime.Version(),
			"os":             runtime.GOOS,
			"arch":           runtime.GOARCH,
			"cpuCount":       runtime.NumCPU(),
			"uptimeSeconds":  int(uptime.Seconds()),
			"uptimeReadable": uptime.String(),
		},
		"memory": gin.H{
			"allocMB":      bytesToMB(mem.Alloc),
			"totalAllocMB": bytesToMB(mem.TotalAlloc),
			"sysMB":        bytesToMB(mem.Sys),
			"heapAllocMB":  bytesToMB(mem.HeapAlloc),
			"heapSysMB":    bytesToMB(mem.HeapSys),
			"heapObjects":  mem.HeapObjects,
		},
		"gc": gin.H{
			"numGC":        mem.NumGC,
			"lastGCUnixNs": mem.LastGC,
			"nextGCMB":     bytesToMB(mem.NextGC),
		},
		"timestamp": time.Now().UTC(),
	})
}

func bytesToMB(b uint64) float64 {
	return float64(b) / 1024.0 / 1024.0
}