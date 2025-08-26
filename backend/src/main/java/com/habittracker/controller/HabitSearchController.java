package com.habittracker.controller;

import com.habittracker.dto.HabitDto;
import com.habittracker.model.Habit;
import com.habittracker.service.HabitSearchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * REST controller for advanced habit search and filtering
 */
@RestController
@RequestMapping("/api/habits/search")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Habit Search", description = "Advanced search and filtering of habits")
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:3000", "https://habit-tracker-ui.vercel.app" })
public class HabitSearchController {

    private final HabitSearchService searchService;

    /**
     * Quick text search
     */
    @Operation(summary = "Quick search habits", description = "Search habits by name, description, or tags")
    @GetMapping("/quick")
    public ResponseEntity<List<HabitDto>> quickSearch(
            @Parameter(description = "Search term") @RequestParam(required = false) String q) {

        log.debug("Quick search with term: {}", q);

        try {
            List<HabitDto> habits = searchService.quickSearch(q);
            return ResponseEntity.ok(habits);
        } catch (Exception e) {
            log.error("Error in quick search: {}", e.getMessage(), e);
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * Advanced search with multiple filters
     */
    @Operation(summary = "Advanced habit search", description = "Search habits with multiple criteria and filters")
    @GetMapping("/advanced")
    public ResponseEntity<List<HabitDto>> advancedSearch(
            @Parameter(description = "Search term (name, description, tags)") @RequestParam(required = false) String q,

            @Parameter(description = "Category ID filter") @RequestParam(required = false) Long categoryId,

            @Parameter(description = "Priority filter (HIGH, MEDIUM, LOW)") @RequestParam(required = false) String priority,

            @Parameter(description = "Habit type filter (STANDARD, TIMED)") @RequestParam(required = false) String habitType,

            @Parameter(description = "Folder ID filter") @RequestParam(required = false) Long folderId,

            @Parameter(description = "Tags to filter by (comma-separated)") @RequestParam(required = false) List<String> tags,

            @Parameter(description = "Tag match mode: true=ALL tags, false=ANY tag") @RequestParam(defaultValue = "false") Boolean tagMatchAll,

            @Parameter(description = "Created after date (YYYY-MM-DD)") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate createdAfter,

            @Parameter(description = "Created before date (YYYY-MM-DD)") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate createdBefore,

            @Parameter(description = "Sort by field (name, created, priority, category)") @RequestParam(defaultValue = "name") String sortBy,

            @Parameter(description = "Sort direction (asc, desc)") @RequestParam(defaultValue = "asc") String sortDirection) {

        log.debug("Advanced search with criteria - term: {}, category: {}, priority: {}",
                q, categoryId, priority);

        try {
            HabitSearchService.SearchCriteria criteria = new HabitSearchService.SearchCriteria();
            criteria.setSearchTerm(q);
            criteria.setCategoryId(categoryId);

            // Parse priority enum
            if (priority != null) {
                try {
                    criteria.setPriority(Habit.Priority.valueOf(priority.toUpperCase()));
                } catch (IllegalArgumentException e) {
                    log.warn("Invalid priority value: {}", priority);
                }
            }

            // Parse habit type enum
            if (habitType != null) {
                try {
                    criteria.setHabitType(Habit.HabitType.valueOf(habitType.toUpperCase()));
                } catch (IllegalArgumentException e) {
                    log.warn("Invalid habit type value: {}", habitType);
                }
            }

            criteria.setFolderId(folderId);
            criteria.setTags(tags);
            criteria.setTagMatchAll(tagMatchAll);
            criteria.setCreatedAfter(createdAfter);
            criteria.setCreatedBefore(createdBefore);
            criteria.setSortBy(sortBy);
            criteria.setSortDirection(sortDirection);

            HabitSearchService.SearchResult searchResult = searchService.searchHabits(criteria);
            List<HabitDto> habits = searchResult.getResults();
            return ResponseEntity.ok(habits);
        } catch (Exception e) {
            log.error("Error in advanced search: {}", e.getMessage(), e);
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * Get habits by folder
     */
    @Operation(summary = "Get habits by folder", description = "Retrieve all habits in a folder (including subfolders)")
    @GetMapping("/folder/{folderId}")
    public ResponseEntity<List<HabitDto>> getHabitsByFolder(
            @Parameter(description = "Folder ID") @PathVariable Long folderId) {

        log.debug("Getting habits by folder: {}", folderId);

        try {
            List<HabitDto> habits = searchService.getHabitsByFolder(folderId);
            return ResponseEntity.ok(habits);
        } catch (Exception e) {
            log.error("Error getting habits by folder {}: {}", folderId, e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * Get uncategorized habits
     */
    @Operation(summary = "Get uncategorized habits", description = "Retrieve habits that are not assigned to any folder")
    @GetMapping("/uncategorized")
    public ResponseEntity<List<HabitDto>> getUncategorizedHabits() {
        log.debug("Getting uncategorized habits");

        try {
            List<HabitDto> habits = searchService.getUncategorizedHabits();
            return ResponseEntity.ok(habits);
        } catch (Exception e) {
            log.error("Error getting uncategorized habits: {}", e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * Get user's tags
     */
    @Operation(summary = "Get user tags", description = "Get all unique tags used by the current user")
    @GetMapping("/tags")
    public ResponseEntity<List<String>> getUserTags() {
        log.debug("Getting user tags");

        try {
            List<String> tags = searchService.getUserTags();
            return ResponseEntity.ok(tags);
        } catch (Exception e) {
            log.error("Error getting user tags: {}", e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * Get search suggestions
     */
    @Operation(summary = "Get search suggestions", description = "Get search suggestions based on partial input")
    @GetMapping("/suggestions")
    public ResponseEntity<HabitSearchService.SearchSuggestions> getSearchSuggestions(
            @Parameter(description = "Partial input for suggestions") @RequestParam String q) {

        log.debug("Getting search suggestions for: {}", q);

        try {
            HabitSearchService.SearchSuggestions suggestions = searchService.getSearchSuggestions(q);
            return ResponseEntity.ok(suggestions);
        } catch (Exception e) {
            log.error("Error getting search suggestions: {}", e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }
}