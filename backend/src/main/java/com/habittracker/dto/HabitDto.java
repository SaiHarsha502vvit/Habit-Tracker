package com.habittracker.dto;

import com.habittracker.model.Habit;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.util.Set;

/**
 * Data Transfer Object for Habit entity.
 * Enhanced with Phase 1 features.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HabitDto {

    private Long id;

    @NotBlank(message = "Habit name must not be blank")
    @Size(min = 3, max = 100, message = "Habit name must be between 3 and 100 characters")
    private String name;

    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;

    private String createdAt; // LocalDate as string in YYYY-MM-DD format
    private String updatedAt; // LocalDateTime as string

    // Phase 1 Enhancement: Category support
    private Long categoryId;
    private CategoryDto category; // Full category details for display

    // Phase 1 Enhancement: Tags support
    private Set<String> tags;

    // Phase 1 Enhancement: Priority support
    @Builder.Default
    private Habit.Priority priority = Habit.Priority.MEDIUM;

    // Existing Pomodoro/Timer-related fields
    @Builder.Default
    private Habit.HabitType habitType = Habit.HabitType.STANDARD;

    @Min(value = 1, message = "Timer duration must be at least 1 minute")
    @Max(value = 480, message = "Timer duration must not exceed 8 hours (480 minutes)")
    private Integer timerDurationMinutes; // Only used for TIMED habits

    // Phase 1 Enhancement: Timer presets
    private Habit.TimerPreset timerPreset;

    // Phase 1 Enhancement: Additional metadata
    @Builder.Default
    private boolean isArchived = false;

    @Builder.Default
    private int streakCount = 0;

    // User information (for display purposes, not for creation)
    private String username; // Read-only field for display
}
