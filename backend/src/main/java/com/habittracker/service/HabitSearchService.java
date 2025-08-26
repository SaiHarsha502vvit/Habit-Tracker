package com.habittracker.service;

import com.habittracker.dto.HabitDto;
import com.habittracker.model.Habit;
import com.habittracker.model.User;
import com.habittracker.repository.HabitRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for advanced habit search and filtering functionality
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class HabitSearchService {

    private final HabitRepository habitRepository;
    private final UserService userService;
    private final HabitService habitService;

    /**
     * Search criteria DTO
     */
    public static class SearchCriteria {
        private String searchTerm;
        private Long categoryId;
        private Habit.Priority priority;
        private Habit.HabitType habitType;
        private Long folderId;
        private List<String> tags;
        private Boolean tagMatchAll = false; // true = must have ALL tags, false = must have ANY tag
        private LocalDate createdAfter;
        private LocalDate createdBefore;
        private Boolean isCompleted;
        private String sortBy = "name"; // name, created, priority, category
        private String sortDirection = "asc"; // asc, desc

        // Constructors, getters, setters
        public SearchCriteria() {}

        public String getSearchTerm() { return searchTerm; }
        public void setSearchTerm(String searchTerm) { this.searchTerm = searchTerm; }

        public Long getCategoryId() { return categoryId; }
        public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }

        public Habit.Priority getPriority() { return priority; }
        public void setPriority(Habit.Priority priority) { this.priority = priority; }

        public Habit.HabitType getHabitType() { return habitType; }
        public void setHabitType(Habit.HabitType habitType) { this.habitType = habitType; }

        public Long getFolderId() { return folderId; }
        public void setFolderId(Long folderId) { this.folderId = folderId; }

        public List<String> getTags() { return tags; }
        public void setTags(List<String> tags) { this.tags = tags; }

        public Boolean getTagMatchAll() { return tagMatchAll; }
        public void setTagMatchAll(Boolean tagMatchAll) { this.tagMatchAll = tagMatchAll; }

        public LocalDate getCreatedAfter() { return createdAfter; }
        public void setCreatedAfter(LocalDate createdAfter) { this.createdAfter = createdAfter; }

        public LocalDate getCreatedBefore() { return createdBefore; }
        public void setCreatedBefore(LocalDate createdBefore) { this.createdBefore = createdBefore; }

        public Boolean getIsCompleted() { return isCompleted; }
        public void setIsCompleted(Boolean isCompleted) { this.isCompleted = isCompleted; }

        public String getSortBy() { return sortBy; }
        public void setSortBy(String sortBy) { this.sortBy = sortBy; }

        public String getSortDirection() { return sortDirection; }
        public void setSortDirection(String sortDirection) { this.sortDirection = sortDirection; }
    }

    /**
     * Perform advanced search with multiple criteria
     */
    public List<HabitDto> searchHabits(SearchCriteria criteria) {
        log.debug("Performing advanced search with criteria: {}", criteria.getSearchTerm());

        User currentUser = userService.getCurrentUser();
        List<Habit> habits;

        // Start with basic multi-criteria search
        habits = habitRepository.findHabitsWithFilters(
            currentUser.getId(),
            criteria.getSearchTerm(),
            criteria.getCategoryId(),
            criteria.getPriority(),
            criteria.getHabitType(),
            criteria.getFolderId()
        );

        // Apply tag filtering if specified
        if (criteria.getTags() != null && !criteria.getTags().isEmpty()) {
            habits = filterByTags(habits, criteria.getTags(), criteria.getTagMatchAll());
        }

        // Apply date range filtering if specified
        if (criteria.getCreatedAfter() != null || criteria.getCreatedBefore() != null) {
            habits = filterByDateRange(habits, criteria.getCreatedAfter(), criteria.getCreatedBefore());
        }

        // Convert to DTOs and apply sorting
        List<HabitDto> habitDTOs = habits.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());

        // Apply sorting
        habitDTOs = applySorting(habitDTOs, criteria.getSortBy(), criteria.getSortDirection());

        log.debug("Search returned {} habits", habitDTOs.size());
        return habitDTOs;
    }

    /**
     * Quick search by text only
     */
    public List<HabitDto> quickSearch(String searchTerm) {
        log.debug("Performing quick search: {}", searchTerm);

        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            return habitService.getAllHabits();
        }

        User currentUser = userService.getCurrentUser();
        List<Habit> habits = habitRepository.searchHabits(currentUser.getId(), searchTerm.trim());

        return habits.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Get habits by folder (including subfolders)
     */
    public List<HabitDto> getHabitsByFolder(Long folderId) {
        log.debug("Getting habits by folder: {}", folderId);

        List<Habit> habits = habitRepository.findByFolderIncludingSubfolders(folderId);
        return habits.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Get uncategorized habits (no folder assigned)
     */
    public List<HabitDto> getUncategorizedHabits() {
        log.debug("Getting uncategorized habits");

        User currentUser = userService.getCurrentUser();
        List<Habit> habits = habitRepository.findUncategorizedHabits(currentUser.getId());

        return habits.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Get all unique tags used by the user
     */
    public List<String> getUserTags() {
        User currentUser = userService.getCurrentUser();
        return habitRepository.findDistinctTagsByUser(currentUser.getId());
    }

    /**
     * Get search suggestions based on partial input
     */
    public SearchSuggestions getSearchSuggestions(String partialInput) {
        log.debug("Getting search suggestions for: {}", partialInput);

        SearchSuggestions suggestions = new SearchSuggestions();
        
        if (partialInput == null || partialInput.trim().length() < 2) {
            return suggestions;
        }

        User currentUser = userService.getCurrentUser();
        String searchTerm = partialInput.trim().toLowerCase();

        // Get habit name suggestions
        List<Habit> matchingHabits = habitRepository.searchHabits(currentUser.getId(), searchTerm);
        suggestions.setHabitNames(matchingHabits.stream()
                .map(Habit::getName)
                .limit(5)
                .collect(Collectors.toList()));

        // Get tag suggestions
        List<String> allTags = habitRepository.findDistinctTagsByUser(currentUser.getId());
        suggestions.setTags(allTags.stream()
                .filter(tag -> tag.toLowerCase().contains(searchTerm))
                .limit(5)
                .collect(Collectors.toList()));

        return suggestions;
    }

    /**
     * Filter habits by tags
     */
    private List<Habit> filterByTags(List<Habit> habits, List<String> tags, boolean matchAll) {
        return habits.stream()
                .filter(habit -> {
                    if (habit.getTags() == null || habit.getTags().isEmpty()) {
                        return false;
                    }
                    
                    if (matchAll) {
                        // Must have ALL specified tags
                        return habit.getTags().containsAll(tags);
                    } else {
                        // Must have at least ONE of the specified tags
                        return habit.getTags().stream().anyMatch(tags::contains);
                    }
                })
                .collect(Collectors.toList());
    }

    /**
     * Filter habits by date range
     */
    private List<Habit> filterByDateRange(List<Habit> habits, LocalDate after, LocalDate before) {
        return habits.stream()
                .filter(habit -> {
                    LocalDate created = habit.getCreatedAt();
                    
                    if (after != null && created.isBefore(after)) {
                        return false;
                    }
                    
                    if (before != null && created.isAfter(before)) {
                        return false;
                    }
                    
                    return true;
                })
                .collect(Collectors.toList());
    }

    /**
     * Apply sorting to habit DTOs
     */
    private List<HabitDto> applySorting(List<HabitDto> habits, String sortBy, String sortDirection) {
        boolean ascending = "asc".equalsIgnoreCase(sortDirection);

        return habits.stream()
                .sorted((h1, h2) -> {
                    int comparison = 0;
                    
                    switch (sortBy.toLowerCase()) {
                        case "name":
                            comparison = h1.getName().compareToIgnoreCase(h2.getName());
                            break;
                        case "created":
                            comparison = h1.getCreatedAt().compareTo(h2.getCreatedAt());
                            break;
                        case "priority":
                            comparison = comparePriority(h1.getPriority(), h2.getPriority());
                            break;
                        case "category":
                            String c1 = h1.getCategory() != null ? h1.getCategory().getName() : "";
                            String c2 = h2.getCategory() != null ? h2.getCategory().getName() : "";
                            comparison = c1.compareToIgnoreCase(c2);
                            break;
                        default:
                            comparison = h1.getName().compareToIgnoreCase(h2.getName());
                    }
                    
                    return ascending ? comparison : -comparison;
                })
                .collect(Collectors.toList());
    }

    /**
     * Compare priority levels (HIGH > MEDIUM > LOW)
     */
    private int comparePriority(Habit.Priority p1, Habit.Priority p2) {
        if (p1 == p2) return 0;
        if (p1 == null) return 1;
        if (p2 == null) return -1;
        
        // HIGH = 3, MEDIUM = 2, LOW = 1
        int val1 = p1 == Habit.Priority.HIGH ? 3 : p1 == Habit.Priority.MEDIUM ? 2 : 1;
        int val2 = p2 == Habit.Priority.HIGH ? 3 : p2 == Habit.Priority.MEDIUM ? 2 : 1;
        
        return Integer.compare(val2, val1); // Higher priority first
    }

    /**
     * Convert Habit entity to DTO (using the existing service method)
     */
    private HabitDto convertToDto(Habit habit) {
        // We'll use the existing habit service method to convert
        // This ensures consistency with the existing codebase
        return habitService.mapToDto(habit);
    }

    /**
     * Search suggestions response DTO
     */
    public static class SearchSuggestions {
        private List<String> habitNames = new ArrayList<>();
        private List<String> tags = new ArrayList<>();
        private List<String> categories = new ArrayList<>();

        public List<String> getHabitNames() { return habitNames; }
        public void setHabitNames(List<String> habitNames) { this.habitNames = habitNames; }

        public List<String> getTags() { return tags; }
        public void setTags(List<String> tags) { this.tags = tags; }

        public List<String> getCategories() { return categories; }
        public void setCategories(List<String> categories) { this.categories = categories; }
    }
}