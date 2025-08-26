package com.habittracker.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO for search results containing habits and related information
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SearchResultDto {
    
    private List<HabitDto> habits;
    private List<CategoryDto> categories;
    private int totalHabits;
    private int totalCategories;
    private String query;
    private long searchTimeMs;
}
