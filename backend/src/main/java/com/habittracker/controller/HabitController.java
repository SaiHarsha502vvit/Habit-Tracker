package com.habittracker.controller;

import com.habittracker.dto.HabitDto;
import com.habittracker.dto.HabitLogDto;
import com.habittracker.model.Habit;
import com.habittracker.service.HabitService;
import com.habittracker.exception.ResourceNotFoundException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * REST Controller for habit-related operations.
 * Enhanced with Phase 1 features while maintaining backward compatibility.
 */
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:5173" }, allowCredentials = "true")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Habit Controller", description = "APIs for managing habits and habit logs")
public class HabitController {

    private final HabitService habitService;

    /**
     * Create a new habit with enhanced Phase 1 features.
     */
    @PostMapping("/habits")
    @Operation(summary = "Create a new habit", description = "Creates a new habit with enhanced features like categories, tags, and timer presets")
    @ApiResponse(responseCode = "201", description = "Habit created successfully")
    @ApiResponse(responseCode = "400", description = "Invalid input data")
    public ResponseEntity<HabitDto> createHabit(@Valid @RequestBody HabitDto habitDto) {
        log.info("POST /api/habits - Creating habit: {}", habitDto.getName());

        HabitDto createdHabit = habitService.createHabit(habitDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdHabit);
    }

    /**
     * Get all active habits for the current user.
     */
    @GetMapping("/habits")
    @Operation(summary = "Get all active habits", description = "Retrieves all active habits for the current user (or all public habits if not authenticated)")
    @ApiResponse(responseCode = "200", description = "Habits retrieved successfully")
    public ResponseEntity<List<HabitDto>> getAllHabits() {
        log.info("GET /api/habits - Fetching all active habits");

        List<HabitDto> habits = habitService.getAllHabits();
        return ResponseEntity.ok(habits);
    }

    /**
     * Get habits by category.
     */
    @GetMapping("/habits/category/{categoryId}")
    @Operation(summary = "Get habits by category", description = "Retrieves all habits in a specific category")
    @ApiResponse(responseCode = "200", description = "Habits retrieved successfully")
    @ApiResponse(responseCode = "404", description = "Category not found")
    public ResponseEntity<List<HabitDto>> getHabitsByCategory(@PathVariable Long categoryId) {
        log.info("GET /api/habits/category/{} - Fetching habits by category", categoryId);

        List<HabitDto> habits = habitService.getHabitsByCategory(categoryId);
        return ResponseEntity.ok(habits);
    }

    /**
     * Get habits by priority.
     */
    @GetMapping("/habits/priority/{priority}")
    @Operation(summary = "Get habits by priority", description = "Retrieves all habits with a specific priority level")
    @ApiResponse(responseCode = "200", description = "Habits retrieved successfully")
    public ResponseEntity<List<HabitDto>> getHabitsByPriority(@PathVariable Habit.Priority priority) {
        log.info("GET /api/habits/priority/{} - Fetching habits by priority", priority);

        List<HabitDto> habits = habitService.getHabitsByPriority(priority);
        return ResponseEntity.ok(habits);
    }

    /**
     * Get habits by tags.
     */
    @GetMapping("/habits/tags")
    @Operation(summary = "Get habits by tags", description = "Retrieves all habits containing specified tags")
    @ApiResponse(responseCode = "200", description = "Habits retrieved successfully")
    public ResponseEntity<List<HabitDto>> getHabitsByTags(@RequestParam List<String> tags) {
        log.info("GET /api/habits/tags - Fetching habits by tags: {}", tags);

        List<HabitDto> habits = habitService.getHabitsByTags(tags);
        return ResponseEntity.ok(habits);
    }

    /**
     * Update an existing habit.
     */
    @PutMapping("/habits/{habitId}")
    @Operation(summary = "Update a habit", description = "Updates an existing habit with new information")
    @ApiResponse(responseCode = "200", description = "Habit updated successfully")
    @ApiResponse(responseCode = "404", description = "Habit not found")
    @ApiResponse(responseCode = "403", description = "Permission denied")
    public ResponseEntity<HabitDto> updateHabit(@PathVariable Long habitId,
            @Valid @RequestBody HabitDto habitDto) {
        log.info("PUT /api/habits/{} - Updating habit", habitId);

        HabitDto updatedHabit = habitService.updateHabit(habitId, habitDto);
        return ResponseEntity.ok(updatedHabit);
    }

    /**
     * Archive a habit (soft delete).
     */
    @PutMapping("/habits/{habitId}/archive")
    @Operation(summary = "Archive a habit", description = "Archives a habit instead of permanently deleting it")
    @ApiResponse(responseCode = "204", description = "Habit archived successfully")
    @ApiResponse(responseCode = "404", description = "Habit not found")
    @ApiResponse(responseCode = "403", description = "Permission denied")
    public ResponseEntity<Void> archiveHabit(@PathVariable Long habitId) {
        log.info("PUT /api/habits/{}/archive - Archiving habit", habitId);

        habitService.archiveHabit(habitId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Delete a habit and all its associated logs (maintained for backward
     * compatibility).
     */
    @DeleteMapping("/habits/{habitId}")
    @Operation(summary = "Delete a habit", description = "Permanently deletes a habit and all its associated logs")
    @ApiResponse(responseCode = "204", description = "Habit deleted successfully")
    @ApiResponse(responseCode = "404", description = "Habit not found")
    @ApiResponse(responseCode = "403", description = "Permission denied")
    public ResponseEntity<Void> deleteHabit(@PathVariable Long habitId) {
        log.info("DELETE /api/habits/{} - Deleting habit", habitId);

        habitService.deleteHabit(habitId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Log a habit completion for a specific date.
     */
    @PostMapping("/habits/{habitId}/logs")
    @Operation(summary = "Log habit completion", description = "Logs a completion for a specific habit on a given date")
    @ApiResponse(responseCode = "201", description = "New completion logged successfully")
    @ApiResponse(responseCode = "200", description = "Completion already exists for this date")
    @ApiResponse(responseCode = "404", description = "Habit not found")
    @ApiResponse(responseCode = "403", description = "Permission denied")
    public ResponseEntity<HabitLogDto> logHabitCompletion(
            @PathVariable Long habitId,
            @RequestBody Map<String, String> request) {

        String completionDateStr = request.get("completionDate");
        LocalDate completionDate = LocalDate.parse(completionDateStr);

        log.info("POST /api/habits/{}/logs - Logging completion for date: {}", habitId, completionDate);

        // Check if log already exists for idempotency
        try {
            List<LocalDate> existingLogs = habitService.getCompletionLogsForYear(habitId, completionDate.getYear());
            boolean logExists = existingLogs.contains(completionDate);

            HabitLogDto logDto = habitService.logHabitCompletion(habitId, completionDate);

            // Return 200 if log already existed, 201 if newly created
            if (logExists) {
                return ResponseEntity.ok(logDto);
            } else {
                return ResponseEntity.status(HttpStatus.CREATED).body(logDto);
            }
        } catch (Exception e) {
            // If habit doesn't exist, service will throw ResourceNotFoundException
            HabitLogDto logDto = habitService.logHabitCompletion(habitId, completionDate);
            return ResponseEntity.status(HttpStatus.CREATED).body(logDto);
        }
    }

    /**
     * Get completion logs for a habit within a specific year.
     */
    @GetMapping("/habits/{habitId}/logs")
    @Operation(summary = "Get habit completion logs", description = "Retrieves all completion dates for a habit in a given year")
    @ApiResponse(responseCode = "200", description = "Completion logs retrieved successfully")
    @ApiResponse(responseCode = "404", description = "Habit not found")
    @ApiResponse(responseCode = "403", description = "Permission denied")
    public ResponseEntity<List<String>> getCompletionLogs(
            @PathVariable Long habitId,
            @RequestParam int year) {

        log.info("GET /api/habits/{}/logs?year={} - Fetching completion logs", habitId, year);

        List<LocalDate> completionDates = habitService.getCompletionLogsForYear(habitId, year);

        // Convert LocalDate to String format (YYYY-MM-DD)
        List<String> completionDateStrings = completionDates.stream()
                .map(LocalDate::toString)
                .collect(Collectors.toList());

        return ResponseEntity.ok(completionDateStrings);
    }

    /**
     * Get basic statistics for the current user.
     */
    @GetMapping("/habits/stats")
    @Operation(summary = "Get habit statistics", description = "Retrieves basic statistics about user's habits")
    @ApiResponse(responseCode = "200", description = "Statistics retrieved successfully")
    public ResponseEntity<Map<String, Object>> getHabitStats() {
        log.info("GET /api/habits/stats - Fetching habit statistics");

        long totalHabits = habitService.getUserHabitCount();

        Map<String, Object> stats = Map.of(
                "totalActiveHabits", totalHabits,
                "timestamp", System.currentTimeMillis());

        return ResponseEntity.ok(stats);
    }

    /**
     * Get available timer presets.
     */
    @GetMapping("/habits/timer-presets")
    @Operation(summary = "Get timer presets", description = "Retrieves all available timer presets")
    @ApiResponse(responseCode = "200", description = "Timer presets retrieved successfully")
    public ResponseEntity<Map<String, Object>> getTimerPresets() {
        log.info("GET /api/habits/timer-presets - Fetching timer presets");

        Map<String, Object> presets = Map.of(
                "CUSTOM", Map.of("workMinutes", 0, "description", "Custom timer duration"),
                "POMODORO_CLASSIC",
                Map.of("workMinutes", 25, "shortBreakMinutes", 5, "longBreakMinutes", 15, "description",
                        "Classic Pomodoro (25min work, 5min break)"),
                "POMODORO_SHORT",
                Map.of("workMinutes", 15, "shortBreakMinutes", 3, "longBreakMinutes", 10, "description",
                        "Short Pomodoro (15min work, 3min break)"),
                "DEEP_WORK",
                Map.of("workMinutes", 90, "shortBreakMinutes", 20, "longBreakMinutes", 30, "description",
                        "Deep Work (90min work, 20min break)"),
                "FOCUS_SPRINT", Map.of("workMinutes", 45, "shortBreakMinutes", 10, "longBreakMinutes", 25,
                        "description", "Focus Sprint (45min work, 10min break)"));

        return ResponseEntity.ok(presets);
    }

    /**
     * Move habit to a folder
     */
    @PostMapping("/habits/{habitId}/move")
    @Operation(summary = "Move habit to folder", description = "Move a habit to a specific folder or to root")
    @ApiResponse(responseCode = "200", description = "Habit moved successfully")
    @ApiResponse(responseCode = "404", description = "Habit not found")
    @ApiResponse(responseCode = "400", description = "Invalid request")
    public ResponseEntity<HabitDto> moveHabitToFolder(
            @PathVariable Long habitId,
            @RequestParam(required = false) Long folderId) {
        
        log.info("POST /api/habits/{}/move - Moving to folder: {}", habitId, folderId);
        
        try {
            HabitDto movedHabit = habitService.moveHabitToFolder(habitId, folderId);
            return ResponseEntity.ok(movedHabit);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Copy habit to a folder
     */
    @PostMapping("/habits/{habitId}/copy")
    @Operation(summary = "Copy habit to folder", description = "Create a copy of a habit in a specific folder or root")
    @ApiResponse(responseCode = "201", description = "Habit copied successfully")
    @ApiResponse(responseCode = "404", description = "Habit not found")
    @ApiResponse(responseCode = "400", description = "Invalid request")
    public ResponseEntity<HabitDto> copyHabitToFolder(
            @PathVariable Long habitId,
            @RequestParam(required = false) Long folderId) {
        
        log.info("POST /api/habits/{}/copy - Copying to folder: {}", habitId, folderId);
        
        try {
            HabitDto copiedHabit = habitService.copyHabitToFolder(habitId, folderId);
            return ResponseEntity.status(HttpStatus.CREATED).body(copiedHabit);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
