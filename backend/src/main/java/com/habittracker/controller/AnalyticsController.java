package com.habittracker.controller;

import com.habittracker.service.HabitService;
import com.habittracker.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controller for basic analytics dashboard.
 */
@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:5173" }, allowCredentials = "true")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Analytics Controller", description = "APIs for habit analytics and insights")
public class AnalyticsController {

    private final HabitService habitService;
    private final UserService userService;

    /**
     * Get analytics data with optional date range.
     */
    @GetMapping
    @Operation(summary = "Get analytics data", description = "Retrieves analytics data with optional date range")
    @ApiResponse(responseCode = "200", description = "Analytics data retrieved successfully")
    public ResponseEntity<Map<String, Object>> getAnalytics(@RequestParam(defaultValue = "week") String range) {
        log.info("GET /api/analytics - Fetching analytics data for range: {}", range);

        boolean isAuthenticated = userService.isUserAuthenticated();
        long totalHabits = habitService.getUserHabitCount();

        Map<String, Object> analytics = Map.of(
                "totalHabits", totalHabits,
                "completedToday", 0L, // Placeholder for Phase 1
                "currentStreak", 0L, // Placeholder for Phase 1
                "weeklyProgress", 0.0, // Placeholder for Phase 1
                "range", range,
                "isAuthenticated", isAuthenticated,
                "lastUpdated", System.currentTimeMillis());

        return ResponseEntity.ok(analytics);
    }

    /**
     * Get basic dashboard statistics.
     */
    @GetMapping("/dashboard")
    @Operation(summary = "Get dashboard statistics", description = "Retrieves basic analytics for the dashboard")
    @ApiResponse(responseCode = "200", description = "Analytics retrieved successfully")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        log.info("GET /api/analytics/dashboard - Fetching dashboard statistics");

        boolean isAuthenticated = userService.isUserAuthenticated();
        long totalHabits = habitService.getUserHabitCount();

        Map<String, Object> stats = Map.of(
                "totalActiveHabits", totalHabits,
                "isAuthenticated", isAuthenticated,
                "timestamp", System.currentTimeMillis(),
                "features", Map.of(
                        "categoriesEnabled", true,
                        "timerPresetsEnabled", true,
                        "tagsEnabled", true,
                        "prioritiesEnabled", true,
                        "streakTrackingEnabled", true));

        return ResponseEntity.ok(stats);
    }

    /**
     * Get analytics summary.
     */
    @GetMapping("/summary")
    @Operation(summary = "Get analytics summary", description = "Retrieves summary analytics for the current user")
    @ApiResponse(responseCode = "200", description = "Summary retrieved successfully")
    public ResponseEntity<Map<String, Object>> getAnalyticsSummary() {
        log.info("GET /api/analytics/summary - Fetching analytics summary");

        long totalHabits = habitService.getUserHabitCount();

        // Basic analytics (can be enhanced in future phases)
        Map<String, Object> summary = Map.of(
                "totalHabits", totalHabits,
                "weeklyGoal", totalHabits * 7, // Simple weekly goal calculation
                "monthlyTarget", totalHabits * 30, // Simple monthly target
                "lastUpdated", System.currentTimeMillis());

        return ResponseEntity.ok(summary);
    }

    /**
     * Health check for analytics service.
     */
    @GetMapping("/health")
    @Operation(summary = "Analytics service health check", description = "Checks if analytics service is running")
    @ApiResponse(responseCode = "200", description = "Service is healthy")
    public ResponseEntity<String> healthCheck() {
        log.info("GET /api/analytics/health - Health check");
        return ResponseEntity.ok("Analytics service is running");
    }
}
