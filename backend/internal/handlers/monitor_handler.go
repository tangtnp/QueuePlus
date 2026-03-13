package handlers

import (
	"net/http"
	"runtime"
	"time"

	"github.com/gin-gonic/gin"
)

var appStartTime = time.Now()

// GetSystemMonitor godoc
// @Summary System monitor
// @Description Get basic system information from the running server
// @Tags Monitor
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Router /monitor/system [get]
func GetSystemMonitor(c *gin.Context) {
	var mem runtime.MemStats
	runtime.ReadMemStats(&mem)

	uptime := time.Since(appStartTime)

	c.JSON(http.StatusOK, gin.H{
		"status": "ok",
		"system": gin.H{
			"goVersion":      runtime.Version(),
			"os":             runtime.GOOS,
			"arch":           runtime.GOARCH,
			"cpuCount":       runtime.NumCPU(),
			"goroutines":     runtime.NumGoroutine(),
			"uptimeSeconds":  int(uptime.Seconds()),
			"uptimeReadable": uptime.String(),
		},
		"memory": gin.H{
			"allocBytes":      mem.Alloc,
			"totalAllocBytes": mem.TotalAlloc,
			"sysBytes":        mem.Sys,
			"heapAllocBytes":  mem.HeapAlloc,
			"heapSysBytes":    mem.HeapSys,
			"heapObjects":     mem.HeapObjects,
			"numGC":           mem.NumGC,
		},
		"timestamp": time.Now().UTC(),
	})
}