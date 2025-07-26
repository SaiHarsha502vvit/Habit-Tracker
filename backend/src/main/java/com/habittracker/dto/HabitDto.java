package com.habittracker.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

/**
 * Data Transfer Object for Habit entity.
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
}
