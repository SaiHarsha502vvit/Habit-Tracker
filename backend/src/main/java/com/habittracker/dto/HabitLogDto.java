package com.habittracker.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

/**
 * Data Transfer Object for HabitLog entity.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HabitLogDto {

    private Long id;
    private Long habitId;
    private String completionDate; // LocalDate as string in YYYY-MM-DD format
}
