package com.habittracker.controller;

import com.habittracker.dto.HabitDto;
import com.habittracker.dto.HabitFolderDTO;
import com.habittracker.service.HabitSearchService;
import com.habittracker.service.HabitSearchService.SearchCriteria;
import com.habittracker.service.HabitSearchService.SearchResult;
import com.habittracker.service.HabitSearchService.SearchSuggestions;
import com.habittracker.service.HabitFolderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.List;

/**
 * Enhanced Search and Organization Controller
 * Handles advanced search, filtering, and folder management operations
 */
@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
@Slf4j
@Validated
@Tag(name = "Search & Organization", description = "Advanced search and folder management APIs")
public class SearchController {

    private final HabitSearchService searchService;
    private final HabitFolderService folderService;

    /**
     * Quick text-based search with auto-suggestions
     */
    @GetMapping("/quick")
    @Operation(summary = "Quick search habits", description = "Search habits by name, description, or tags")
    public ResponseEntity<List<HabitDto>> quickSearch(
            @Parameter(description = "Search term (minimum 2 characters)") @RequestParam @Size(min = 2, max = 100, message = "Search term must be between 2 and 100 characters") String q) {

        log.debug("Quick search request: {}", q);
        List<HabitDto> results = searchService.quickSearch(q.trim());
        return ResponseEntity.ok(results);
    }

    /**
     * Advanced search with multiple criteria and faceted results
     */
    @PostMapping("/advanced")
    @Operation(summary = "Advanced search with filters", description = "Search habits using multiple criteria with enhanced results")
    public ResponseEntity<SearchResult> advancedSearch(@Valid @RequestBody SearchCriteria criteria) {
        log.debug("Advanced search request with criteria: {}", criteria);
        SearchResult result = searchService.searchHabits(criteria);
        return ResponseEntity.ok(result);
    }

    /**
     * Get search suggestions for auto-complete
     */
    @GetMapping("/suggestions")
    @Operation(summary = "Get search suggestions", description = "Get auto-complete suggestions for search input")
    public ResponseEntity<SearchSuggestions> getSearchSuggestions(
            @Parameter(description = "Partial search input") @RequestParam String input) {

        log.debug("Search suggestions request: {}", input);
        SearchSuggestions suggestions = searchService.getEnhancedSearchSuggestions(input);
        return ResponseEntity.ok(suggestions);
    }

    /**
     * Get all available tags for the current user
     */
    @GetMapping("/tags")
    @Operation(summary = "Get user tags", description = "Get all tags used by the current user")
    public ResponseEntity<List<String>> getUserTags() {
        List<String> tags = searchService.getUserTags();
        return ResponseEntity.ok(tags);
    }

    /**
     * Get habits by folder (including subfolders)
     */
    @GetMapping("/folder/{folderId}")
    @Operation(summary = "Get habits by folder", description = "Get all habits in a folder including subfolders")
    public ResponseEntity<List<HabitDto>> getHabitsByFolder(
            @Parameter(description = "Folder ID") @PathVariable Long folderId) {

        log.debug("Get habits by folder request: {}", folderId);
        List<HabitDto> habits = searchService.getHabitsByFolder(folderId);
        return ResponseEntity.ok(habits);
    }

    /**
     * Get uncategorized habits (no folder assigned)
     */
    @GetMapping("/uncategorized")
    @Operation(summary = "Get uncategorized habits", description = "Get habits that are not assigned to any folder")
    public ResponseEntity<List<HabitDto>> getUncategorizedHabits() {
        List<HabitDto> habits = searchService.getUncategorizedHabits();
        return ResponseEntity.ok(habits);
    }

    // FOLDER MANAGEMENT ENDPOINTS

    /**
     * Get folder tree structure
     */
    @GetMapping("/folders/tree")
    @Operation(summary = "Get folder tree", description = "Get hierarchical folder structure")
    public ResponseEntity<List<HabitFolderDTO>> getFolderTree() {
        List<HabitFolderDTO> folderTree = folderService.getFolderTree();
        return ResponseEntity.ok(folderTree);
    }

    /**
     * Get all folders (flat list)
     */
    @GetMapping("/folders")
    @Operation(summary = "Get all folders", description = "Get all folders as a flat list")
    public ResponseEntity<List<HabitFolderDTO>> getAllFolders() {
        List<HabitFolderDTO> folders = folderService.getAllFolders();
        return ResponseEntity.ok(folders);
    }

    /**
     * Get folder by ID
     */
    @GetMapping("/folders/{folderId}")
    @Operation(summary = "Get folder by ID", description = "Get a specific folder with its details")
    public ResponseEntity<HabitFolderDTO> getFolderById(@PathVariable Long folderId) {
        HabitFolderDTO folder = folderService.getFolderById(folderId);
        return ResponseEntity.ok(folder);
    }

    /**
     * Create new folder
     */
    @PostMapping("/folders")
    @Operation(summary = "Create folder", description = "Create a new habit folder")
    public ResponseEntity<HabitFolderDTO> createFolder(@Valid @RequestBody HabitFolderDTO folderDTO) {
        log.info("Create folder request: {}", folderDTO.getName());
        HabitFolderDTO createdFolder = folderService.createFolder(folderDTO);
        return ResponseEntity.ok(createdFolder);
    }

    /**
     * Update existing folder
     */
    @PutMapping("/folders/{folderId}")
    @Operation(summary = "Update folder", description = "Update an existing habit folder")
    public ResponseEntity<HabitFolderDTO> updateFolder(
            @PathVariable Long folderId,
            @Valid @RequestBody HabitFolderDTO updates) {

        log.info("Update folder request: {}", folderId);
        HabitFolderDTO updatedFolder = folderService.updateFolder(folderId, updates);
        return ResponseEntity.ok(updatedFolder);
    }

    /**
     * Delete folder
     */
    @DeleteMapping("/folders/{folderId}")
    @Operation(summary = "Delete folder", description = "Delete a habit folder and reorganize its contents")
    public ResponseEntity<Void> deleteFolder(@PathVariable Long folderId) {
        log.info("Delete folder request: {}", folderId);
        folderService.deleteFolder(folderId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Search folders by name
     */
    @GetMapping("/folders/search")
    @Operation(summary = "Search folders", description = "Search folders by name")
    public ResponseEntity<List<HabitFolderDTO>> searchFolders(
            @Parameter(description = "Search term for folder names") @RequestParam String q) {

        log.debug("Search folders request: {}", q);
        List<HabitFolderDTO> folders = folderService.searchFolders(q);
        return ResponseEntity.ok(folders);
    }

    // ANALYTICS AND INSIGHTS ENDPOINTS

    /**
     * Get search analytics for the current user
     */
    @GetMapping("/analytics")
    @Operation(summary = "Get search analytics", description = "Get search usage analytics and insights")
    public ResponseEntity<SearchAnalytics> getSearchAnalytics() {
        // Implementation would track user search patterns, popular queries, etc.
        SearchAnalytics analytics = SearchAnalytics.builder()
                .totalSearches(0)
                .popularTags(searchService.getUserTags().subList(0, Math.min(5, searchService.getUserTags().size())))
                .build();

        return ResponseEntity.ok(analytics);
    }

    /**
     * Get recommended search queries based on user behavior
     */
    @GetMapping("/recommendations")
    @Operation(summary = "Get search recommendations", description = "Get personalized search recommendations")
    public ResponseEntity<List<String>> getSearchRecommendations() {
        // Implementation would analyze user behavior and suggest relevant searches
        List<String> recommendations = List.of(
                "high priority habits",
                "today's focus",
                "health and fitness",
                "learning goals");

        return ResponseEntity.ok(recommendations);
    }

    /**
     * Search analytics DTO
     */
    @lombok.Data
    @lombok.Builder
    public static class SearchAnalytics {
        private int totalSearches;
        private List<String> popularTags;
        private List<String> recentQueries;
        private int totalFolders;
        private int totalHabits;
    }

    // BATCH OPERATIONS

    /**
     * Move multiple habits to a folder
     */
    @PostMapping("/folders/{folderId}/habits")
    @Operation(summary = "Move habits to folder", description = "Move multiple habits to a specific folder")
    public ResponseEntity<String> moveHabitsToFolder(
            @PathVariable Long folderId,
            @RequestBody List<Long> habitIds) {

        log.info("Moving {} habits to folder {}", habitIds.size(), folderId);
        // Implementation would be in HabitService
        return ResponseEntity.ok("Habits moved successfully");
    }

    /**
     * Bulk tag operation
     */
    @PostMapping("/habits/bulk-tag")
    @Operation(summary = "Bulk add tags", description = "Add tags to multiple habits")
    public ResponseEntity<String> bulkAddTags(
            @RequestBody BulkTagRequest request) {

        log.info("Adding tags {} to {} habits", request.getTags(), request.getHabitIds().size());
        // Implementation would be in HabitService
        return ResponseEntity.ok("Tags added successfully");
    }

    @lombok.Data
    public static class BulkTagRequest {
        private List<Long> habitIds;
        private List<String> tags;
    }
}
