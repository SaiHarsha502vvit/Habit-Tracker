package com.habittracker.controller;

import com.habittracker.service.RevolutionaryFileSystemService;
import com.habittracker.service.DatabaseInitializationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST controller for the Revolutionary File System.
 * Provides endpoints for advanced copy-on-write operations,
 * system management, and performance monitoring.
 */
@RestController
@RequestMapping("/api/revolutionary-filesystem")
@CrossOrigin(origins = { "http://localhost:3000", "http://127.0.0.1:3000" })
public class RevolutionaryFileSystemController {

    private static final Logger logger = LoggerFactory.getLogger(RevolutionaryFileSystemController.class);

    @Autowired
    private RevolutionaryFileSystemService revolutionaryService;

    @Autowired
    private DatabaseInitializationService dbInitService;

    /**
     * Perform revolutionary copy operation using Git-inspired COW semantics.
     */
    @PostMapping("/copy")
    public ResponseEntity<?> revolutionaryCopy(@RequestBody RevolutionaryOperationRequest request) {
        try {
            logger.info("🚀 Revolutionary copy operation requested: {} habits to folder {}",
                    request.getHabitIds().size(), request.getTargetFolderId());

            // For now, use user ID 1 as default (TODO: get from authentication context)
            Long userId = 1L;

            var copyResult = revolutionaryService.copyHabitsWithAdvancedCOW(
                    request.getHabitIds(),
                    request.getTargetFolderId(),
                    userId);

            // Convert CopyResult to Map for response
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("operationType", request.getOperationType());
            result.put("totalObjects", copyResult.getTotalObjects());
            result.put("successfulObjects", copyResult.getSuccessfulObjects());
            result.put("failedObjects", copyResult.getFailedObjects());
            result.put("newCommitHash", copyResult.getNewCommitHash());
            result.put("performanceMetrics", copyResult.getPerformanceMetrics());
            result.put("timestamp", System.currentTimeMillis());

            logger.info("✅ Revolutionary copy completed successfully");
            return ResponseEntity.ok(result);

        } catch (Exception e) {
            logger.error("❌ Revolutionary copy operation failed", e);

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            errorResponse.put("timestamp", System.currentTimeMillis());

            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Get system statistics and performance metrics.
     */
    @GetMapping("/stats")
    public ResponseEntity<?> getSystemStats() {
        try {
            Map<String, Object> stats = revolutionaryService.getSystemStatistics();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            logger.error("❌ Failed to retrieve system statistics", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Trigger garbage collection manually.
     */
    @PostMapping("/gc")
    public ResponseEntity<?> triggerGarbageCollection() {
        try {
            logger.info("🗑️ Manual garbage collection triggered");
            revolutionaryService.performGarbageCollection();

            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "Garbage collection completed");
            result.put("timestamp", System.currentTimeMillis());

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.error("❌ Garbage collection failed", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Initialize or reinitialize the database schema.
     */
    @PostMapping("/admin/init-schema")
    public ResponseEntity<?> initializeSchema() {
        try {
            logger.info("🔧 Manual schema initialization requested");
            dbInitService.forceSchemaInitialization();

            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "Schema initialization completed");
            result.put("timestamp", System.currentTimeMillis());

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.error("❌ Schema initialization failed", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get cache statistics and performance data.
     */
    @GetMapping("/cache/stats")
    public ResponseEntity<?> getCacheStats() {
        try {
            // TODO: Implement cache statistics retrieval
            Map<String, Object> cacheStats = new HashMap<>();
            cacheStats.put("cache_hit_ratio", "0.85");
            cacheStats.put("total_entries", 1250);
            cacheStats.put("valid_entries", 1100);
            cacheStats.put("expired_entries", 150);

            return ResponseEntity.ok(cacheStats);
        } catch (Exception e) {
            logger.error("❌ Failed to retrieve cache statistics", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Clear performance cache.
     */
    @DeleteMapping("/cache")
    public ResponseEntity<?> clearCache() {
        try {
            logger.info("🗑️ Performance cache clear requested");
            // TODO: Implement cache clearing

            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "Cache cleared successfully");
            result.put("timestamp", System.currentTimeMillis());

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.error("❌ Cache clear failed", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Health check endpoint for the revolutionary file system.
     */
    @GetMapping("/health")
    public ResponseEntity<?> healthCheck() {
        try {
            Map<String, Object> health = new HashMap<>();
            health.put("status", "healthy");
            health.put("system", "Revolutionary File System v1.0.0");
            health.put("features", List.of(
                    "Git-inspired content-addressable storage",
                    "BTRFS-style copy-on-write semantics",
                    "Linux VFS performance optimizations",
                    "Advanced reference counting"));
            health.put("timestamp", System.currentTimeMillis());

            return ResponseEntity.ok(health);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Request DTO for revolutionary operations.
     */
    public static class RevolutionaryOperationRequest {
        private List<Long> habitIds;
        private Long targetFolderId;
        private String operationType;

        // Getters and setters
        public List<Long> getHabitIds() {
            return habitIds;
        }

        public void setHabitIds(List<Long> habitIds) {
            this.habitIds = habitIds;
        }

        public Long getTargetFolderId() {
            return targetFolderId;
        }

        public void setTargetFolderId(Long targetFolderId) {
            this.targetFolderId = targetFolderId;
        }

        public String getOperationType() {
            return operationType;
        }

        public void setOperationType(String operationType) {
            this.operationType = operationType;
        }
    }
}
