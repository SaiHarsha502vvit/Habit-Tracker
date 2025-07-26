package com.habittracker.controller;

import com.habittracker.dto.HabitDto;
import com.habittracker.dto.HabitLogDto;
import com.habittracker.service.HabitService;
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
     * Create a new habit.
     */
    @PostMapping("/habits")
    @Operation(summary = "Create a new habit", description = "Creates a new habit with the provided name and description")
    @ApiResponse(responseCode = "201", description = "Habit created successfully")
    @ApiResponse(responseCode = "400", description = "Invalid input data")
    public ResponseEntity<HabitDto> createHabit(@Valid @RequestBody HabitDto habitDto) {
        log.info("POST /api/habits - Creating habit: {}", habitDto.getName());

        HabitDto createdHabit = habitService.createHabit(habitDto);

        return ResponseEntity.status(HttpStatus.CREATED).body(createdHabit);
    }

    /**
     * Get all habits.
     */
    @GetMapping("/habits")
    @Operation(summary = "Get all habits", description = "Retrieves all existing habits")
    @ApiResponse(responseCode = "200", description = "Habits retrieved successfully")
    public ResponseEntity<List<HabitDto>> getAllHabits() {
        log.info("GET /api/habits - Fetching all habits");

        List<HabitDto> habits = habitService.getAllHabits();

        return ResponseEntity.ok(habits);
    }

    /**
     * Delete a habit and all its associated logs.
     */
    @DeleteMapping("/habits/{habitId}")
    @Operation(summary = "Delete a habit", description = "Deletes a habit and all its associated logs")
    @ApiResponse(responseCode = "204", description = "Habit deleted successfully")
    @ApiResponse(responseCode = "404", description = "Habit not found")
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
}
