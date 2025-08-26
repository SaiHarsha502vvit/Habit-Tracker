package com.habittracker.service;

import com.habittracker.dto.HabitDto;
import com.habittracker.model.Habit;
import com.habittracker.model.User;
import com.habittracker.repository.HabitRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * Service for advanced habit search and filtering functionality
 */
@Service
public class HabitSearchService {

    private final HabitRepository habitRepository;
    private final UserService userService;
    private final HabitService habitService;

    public HabitSearchService(HabitRepository habitRepository, UserService userService, HabitService habitService) {
        this.habitRepository = habitRepository;
        this.userService = userService;
        this.habitService = habitService;
    }

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
        public SearchCriteria() {
        }

        public String getSearchTerm() {
            return searchTerm;
        }

        public void setSearchTerm(String searchTerm) {
            this.searchTerm = searchTerm;
        }

        public Long getCategoryId() {
            return categoryId;
        }

        public void setCategoryId(Long categoryId) {
            this.categoryId = categoryId;
        }

        public Habit.Priority getPriority() {
            return priority;
        }

        public void setPriority(Habit.Priority priority) {
            this.priority = priority;
        }

        public Habit.HabitType getHabitType() {
            return habitType;
        }

        public void setHabitType(Habit.HabitType habitType) {
            this.habitType = habitType;
        }

        public Long getFolderId() {
            return folderId;
        }

        public void setFolderId(Long folderId) {
            this.folderId = folderId;
        }

        public List<String> getTags() {
            return tags;
        }

        public void setTags(List<String> tags) {
            this.tags = tags;
        }

        public Boolean getTagMatchAll() {
            return tagMatchAll;
        }

        public void setTagMatchAll(Boolean tagMatchAll) {
            this.tagMatchAll = tagMatchAll;
        }

        public LocalDate getCreatedAfter() {
            return createdAfter;
        }

        public void setCreatedAfter(LocalDate createdAfter) {
            this.createdAfter = createdAfter;
        }

        public LocalDate getCreatedBefore() {
            return createdBefore;
        }

        public void setCreatedBefore(LocalDate createdBefore) {
            this.createdBefore = createdBefore;
        }

        public Boolean getIsCompleted() {
            return isCompleted;
        }

        public void setIsCompleted(Boolean isCompleted) {
            this.isCompleted = isCompleted;
        }

        public String getSortBy() {
            return sortBy;
        }

        public void setSortBy(String sortBy) {
            this.sortBy = sortBy;
        }

        public String getSortDirection() {
            return sortDirection;
        }

        public void setSortDirection(String sortDirection) {
            this.sortDirection = sortDirection;
        }
    }

    /**
     * Enhanced search result with metadata and facets
     */
    @lombok.Data
    /**
     * SearchResult class with manual implementation
     */
    public static class SearchResult {
        private List<HabitDto> results;
        private int totalCount;
        private long executionTimeMs;
        private SearchCriteria searchCriteria;
        private SearchFacets facets;
        private List<String> suggestions;

        // Default constructor
        public SearchResult() {
        }

        // Constructor with all fields
        public SearchResult(List<HabitDto> results, int totalCount, long executionTimeMs,
                SearchCriteria searchCriteria, SearchFacets facets, List<String> suggestions) {
            this.results = results;
            this.totalCount = totalCount;
            this.executionTimeMs = executionTimeMs;
            this.searchCriteria = searchCriteria;
            this.facets = facets;
            this.suggestions = suggestions;
        }

        // Getters
        public List<HabitDto> getResults() {
            return results;
        }

        public int getTotalCount() {
            return totalCount;
        }

        public long getExecutionTimeMs() {
            return executionTimeMs;
        }

        public SearchCriteria getSearchCriteria() {
            return searchCriteria;
        }

        public SearchFacets getFacets() {
            return facets;
        }

        public List<String> getSuggestions() {
            return suggestions;
        }

        // Setters
        public void setResults(List<HabitDto> results) {
            this.results = results;
        }

        public void setTotalCount(int totalCount) {
            this.totalCount = totalCount;
        }

        public void setExecutionTimeMs(long executionTimeMs) {
            this.executionTimeMs = executionTimeMs;
        }

        public void setSearchCriteria(SearchCriteria searchCriteria) {
            this.searchCriteria = searchCriteria;
        }

        public void setFacets(SearchFacets facets) {
            this.facets = facets;
        }

        public void setSuggestions(List<String> suggestions) {
            this.suggestions = suggestions;
        }

        // Builder pattern
        public static SearchResult.Builder builder() {
            return new SearchResult.Builder();
        }

        public static class Builder {
            private List<HabitDto> results;
            private int totalCount;
            private long executionTimeMs;
            private SearchCriteria searchCriteria;
            private SearchFacets facets;
            private List<String> suggestions;

            public Builder results(List<HabitDto> results) {
                this.results = results;
                return this;
            }

            public Builder totalCount(int totalCount) {
                this.totalCount = totalCount;
                return this;
            }

            public Builder executionTimeMs(long executionTimeMs) {
                this.executionTimeMs = executionTimeMs;
                return this;
            }

            public Builder searchCriteria(SearchCriteria searchCriteria) {
                this.searchCriteria = searchCriteria;
                return this;
            }

            public Builder facets(SearchFacets facets) {
                this.facets = facets;
                return this;
            }

            public Builder suggestions(List<String> suggestions) {
                this.suggestions = suggestions;
                return this;
            }

            public SearchResult build() {
                return new SearchResult(results, totalCount, executionTimeMs, searchCriteria, facets, suggestions);
            }
        }
    }

    /**
     * Search facets for result filtering
     */
    public static class SearchFacets {
        private Map<String, Integer> categoryCounts;
        private Map<String, Integer> priorityCounts;
        private Map<String, Integer> tagCounts;
        private Map<String, Integer> folderCounts;
        private Map<String, Integer> habitTypeCounts;

        // Default constructor
        public SearchFacets() {
        }

        // Constructor with all fields
        public SearchFacets(Map<String, Integer> categoryCounts, Map<String, Integer> priorityCounts,
                Map<String, Integer> tagCounts, Map<String, Integer> folderCounts,
                Map<String, Integer> habitTypeCounts) {
            this.categoryCounts = categoryCounts;
            this.priorityCounts = priorityCounts;
            this.tagCounts = tagCounts;
            this.folderCounts = folderCounts;
            this.habitTypeCounts = habitTypeCounts;
        }

        // Getters
        public Map<String, Integer> getCategoryCounts() {
            return categoryCounts;
        }

        public Map<String, Integer> getPriorityCounts() {
            return priorityCounts;
        }

        public Map<String, Integer> getTagCounts() {
            return tagCounts;
        }

        public Map<String, Integer> getFolderCounts() {
            return folderCounts;
        }

        public Map<String, Integer> getHabitTypeCounts() {
            return habitTypeCounts;
        }

        // Setters
        public void setCategoryCounts(Map<String, Integer> categoryCounts) {
            this.categoryCounts = categoryCounts;
        }

        public void setPriorityCounts(Map<String, Integer> priorityCounts) {
            this.priorityCounts = priorityCounts;
        }

        public void setTagCounts(Map<String, Integer> tagCounts) {
            this.tagCounts = tagCounts;
        }

        public void setFolderCounts(Map<String, Integer> folderCounts) {
            this.folderCounts = folderCounts;
        }

        public void setHabitTypeCounts(Map<String, Integer> habitTypeCounts) {
            this.habitTypeCounts = habitTypeCounts;
        }

        // Builder pattern
        public static SearchFacets.Builder builder() {
            return new SearchFacets.Builder();
        }

        public static class Builder {
            private Map<String, Integer> categoryCounts;
            private Map<String, Integer> priorityCounts;
            private Map<String, Integer> tagCounts;
            private Map<String, Integer> folderCounts;
            private Map<String, Integer> habitTypeCounts;

            public Builder categoryCounts(Map<String, Integer> categoryCounts) {
                this.categoryCounts = categoryCounts;
                return this;
            }

            public Builder priorityCounts(Map<String, Integer> priorityCounts) {
                this.priorityCounts = priorityCounts;
                return this;
            }

            public Builder tagCounts(Map<String, Integer> tagCounts) {
                this.tagCounts = tagCounts;
                return this;
            }

            public Builder folderCounts(Map<String, Integer> folderCounts) {
                this.folderCounts = folderCounts;
                return this;
            }

            public Builder habitTypeCounts(Map<String, Integer> habitTypeCounts) {
                this.habitTypeCounts = habitTypeCounts;
                return this;
            }

            public SearchFacets build() {
                return new SearchFacets(categoryCounts, priorityCounts, tagCounts, folderCounts, habitTypeCounts);
            }
        }
    }

    /**
     * Perform advanced search with multiple criteria and enhanced performance
     */
    public SearchResult searchHabits(SearchCriteria criteria) {
        System.out.println("Performing advanced search with criteria: " + criteria.getSearchTerm());

        User currentUser = userService.getCurrentUser();
        long startTime = System.currentTimeMillis();

        List<Habit> habits;

        // Start with optimized multi-criteria search
        habits = habitRepository.findHabitsWithFilters(
                currentUser.getId(),
                criteria.getSearchTerm(),
                criteria.getCategoryId(),
                criteria.getPriority(),
                criteria.getHabitType(),
                criteria.getFolderId());

        // Apply tag filtering if specified with optimized algorithm
        if (criteria.getTags() != null && !criteria.getTags().isEmpty()) {
            habits = filterByTagsOptimized(habits, criteria.getTags(), criteria.getTagMatchAll());
        }

        // Apply date range filtering if specified
        if (criteria.getCreatedAfter() != null || criteria.getCreatedBefore() != null) {
            habits = filterByDateRange(habits, criteria.getCreatedAfter(), criteria.getCreatedBefore());
        }

        // Convert to DTOs with parallel processing for large datasets
        Stream<Habit> habitStream = habits.size() > 100 ? habits.parallelStream() : habits.stream();
        List<HabitDto> habitDTOs = habitStream
                .map(this::convertToDto)
                .collect(Collectors.toList());

        // Apply enhanced sorting with multiple criteria support
        habitDTOs = applyEnhancedSorting(habitDTOs, criteria);

        long executionTime = System.currentTimeMillis() - startTime;
        System.out.println("Search returned " + habitDTOs.size() + " habits in " + executionTime + "ms");

        // Return enhanced search result with metadata
        return SearchResult.builder()
                .results(habitDTOs)
                .totalCount(habitDTOs.size())
                .executionTimeMs(executionTime)
                .searchCriteria(criteria)
                .facets(generateSearchFacets(habitDTOs))
                .build();
    }

    /**
     * Quick search by text only
     */
    public List<HabitDto> quickSearch(String searchTerm) {
        System.out.println("Performing quick search: " + searchTerm);

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
        System.out.println("Getting habits by folder: " + folderId);

        List<Habit> habits = habitRepository.findByFolderIncludingSubfolders(folderId);
        return habits.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Get uncategorized habits (no folder assigned)
     */
    public List<HabitDto> getUncategorizedHabits() {
        System.out.println("Getting uncategorized habits");

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
        System.out.println("Getting search suggestions for: " + partialInput);

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
     * Optimized tag filtering using Set operations for better performance
     */
    private List<Habit> filterByTagsOptimized(List<Habit> habits, List<String> searchTags, boolean matchAll) {
        Set<String> searchTagSet = new HashSet<>(searchTags);

        return habits.parallelStream()
                .filter(habit -> {
                    if (habit.getTags() == null || habit.getTags().isEmpty()) {
                        return false;
                    }

                    Set<String> habitTagSet = new HashSet<>(habit.getTags());

                    if (matchAll) {
                        // Must have ALL specified tags - use set containsAll
                        return habitTagSet.containsAll(searchTagSet);
                    } else {
                        // Must have at least ONE of the specified tags - use set intersection
                        Set<String> intersection = new HashSet<>(habitTagSet);
                        intersection.retainAll(searchTagSet);
                        return !intersection.isEmpty();
                    }
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
     * Enhanced sorting with multiple criteria and custom comparators
     */
    private List<HabitDto> applyEnhancedSorting(List<HabitDto> habits, SearchCriteria criteria) {
        Comparator<HabitDto> comparator = buildComparator(criteria.getSortBy(), criteria.getSortDirection());

        // Add secondary sorting criteria for better UX
        if (!"name".equals(criteria.getSortBy())) {
            comparator = comparator.thenComparing(h -> h.getName(), String.CASE_INSENSITIVE_ORDER);
        }

        return habits.stream()
                .sorted(comparator)
                .collect(Collectors.toList());
    }

    /**
     * Build flexible comparator based on sort criteria
     */
    private Comparator<HabitDto> buildComparator(String sortBy, String sortDirection) {
        boolean ascending = "asc".equalsIgnoreCase(sortDirection);

        Comparator<HabitDto> baseComparator = switch (sortBy.toLowerCase()) {
            case "name" -> Comparator.comparing(h -> h.getName(), String.CASE_INSENSITIVE_ORDER);
            case "created" -> Comparator.comparing(HabitDto::getCreatedAt);
            case "updated" -> Comparator
                    .comparing(h -> h.getUpdatedAt() != null ? LocalDate.parse(h.getUpdatedAt()).atStartOfDay()
                            : LocalDate.parse(h.getCreatedAt()).atStartOfDay());
            case "priority" -> Comparator.comparingInt(this::getPriorityWeight);
            case "category" -> Comparator.comparing(h -> h.getCategory() != null ? h.getCategory().getName() : "",
                    String.CASE_INSENSITIVE_ORDER);
            case "streak" -> Comparator.comparingInt(HabitDto::getStreakCount);
            case "completion_rate" -> Comparator.comparingDouble(this::calculateCompletionRate);
            default -> Comparator.comparing(h -> h.getName(), String.CASE_INSENSITIVE_ORDER);
        };

        return ascending ? baseComparator : baseComparator.reversed();
    }

    /**
     * Get priority weight for sorting
     */
    private int getPriorityWeight(HabitDto habit) {
        if (habit.getPriority() == null)
            return 0;
        return switch (habit.getPriority()) {
            case HIGH -> 3;
            case MEDIUM -> 2;
            case LOW -> 1;
        };
    }

    /**
     * Calculate completion rate for a habit
     */
    private double calculateCompletionRate(HabitDto habit) {
        // This would need habit log data - for now return a default value
        return 0.0; // TODO: Implement with actual completion data
    }

    /**
     * Generate search facets for filtering UI
     */
    private SearchFacets generateSearchFacets(List<HabitDto> habits) {
        Map<String, Integer> categoryCounts = habits.stream()
                .filter(h -> h.getCategory() != null)
                .collect(Collectors.groupingBy(
                        h -> h.getCategory().getName(),
                        Collectors.summingInt(h -> 1)));

        Map<String, Integer> priorityCounts = habits.stream()
                .filter(h -> h.getPriority() != null)
                .collect(Collectors.groupingBy(
                        h -> h.getPriority().name(),
                        Collectors.summingInt(h -> 1)));

        Map<String, Integer> tagCounts = habits.stream()
                .filter(h -> h.getTags() != null && !h.getTags().isEmpty())
                .flatMap(h -> h.getTags().stream())
                .collect(Collectors.groupingBy(
                        tag -> tag,
                        Collectors.summingInt(tag -> 1)));

        return SearchFacets.builder()
                .categoryCounts(categoryCounts)
                .priorityCounts(priorityCounts)
                .tagCounts(tagCounts)
                .build();
    }

    /**
     * Compare priority levels (HIGH > MEDIUM > LOW)
     */
    private int comparePriority(Habit.Priority p1, Habit.Priority p2) {
        if (p1 == p2)
            return 0;
        if (p1 == null)
            return 1;
        if (p2 == null)
            return -1;

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

        public List<String> getHabitNames() {
            return habitNames;
        }

        public void setHabitNames(List<String> habitNames) {
            this.habitNames = habitNames;
        }

        public List<String> getTags() {
            return tags;
        }

        public void setTags(List<String> tags) {
            this.tags = tags;
        }

        public List<String> getCategories() {
            return categories;
        }

        public void setCategories(List<String> categories) {
            this.categories = categories;
        }
    }

    /**
     * Enhanced search suggestions with fuzzy matching
     */
    public SearchSuggestions getEnhancedSearchSuggestions(String partialInput) {
        System.out.println("Getting enhanced search suggestions for: " + partialInput);

        SearchSuggestions suggestions = new SearchSuggestions();

        if (partialInput == null || partialInput.trim().length() < 2) {
            return suggestions;
        }

        User currentUser = userService.getCurrentUser();
        String searchTerm = partialInput.trim().toLowerCase();

        // Get habit name suggestions with fuzzy matching
        List<Habit> allHabits = habitRepository.findActiveHabitsByUser(currentUser.getId());

        List<String> habitNameSuggestions = allHabits.stream()
                .map(Habit::getName)
                .filter(name -> isFuzzyMatch(name.toLowerCase(), searchTerm))
                .sorted((a, b) -> Integer.compare(
                        getLevenshteinDistance(a.toLowerCase(), searchTerm),
                        getLevenshteinDistance(b.toLowerCase(), searchTerm)))
                .limit(5)
                .collect(Collectors.toList());

        suggestions.setHabitNames(habitNameSuggestions);

        // Get tag suggestions with frequency scoring
        List<String> allTags = habitRepository.findDistinctTagsByUser(currentUser.getId());
        List<String> tagSuggestions = allTags.stream()
                .filter(tag -> tag.toLowerCase().contains(searchTerm))
                .sorted((a, b) -> {
                    // Sort by relevance: exact match first, then by length, then alphabetically
                    boolean aExact = a.toLowerCase().equals(searchTerm);
                    boolean bExact = b.toLowerCase().equals(searchTerm);
                    if (aExact && !bExact)
                        return -1;
                    if (!aExact && bExact)
                        return 1;
                    if (a.length() != b.length())
                        return Integer.compare(a.length(), b.length());
                    return a.compareToIgnoreCase(b);
                })
                .limit(5)
                .collect(Collectors.toList());

        suggestions.setTags(tagSuggestions);

        return suggestions;
    }

    /**
     * Simple fuzzy matching algorithm
     */
    private boolean isFuzzyMatch(String text, String query) {
        if (text.contains(query))
            return true;
        return getLevenshteinDistance(text, query) <= Math.max(1, query.length() / 3);
    }

    /**
     * Calculate Levenshtein distance for fuzzy matching
     */
    private int getLevenshteinDistance(String s1, String s2) {
        int[][] dp = new int[s1.length() + 1][s2.length() + 1];

        for (int i = 0; i <= s1.length(); i++) {
            for (int j = 0; j <= s2.length(); j++) {
                if (i == 0) {
                    dp[i][j] = j;
                } else if (j == 0) {
                    dp[i][j] = i;
                } else if (s1.charAt(i - 1) == s2.charAt(j - 1)) {
                    dp[i][j] = dp[i - 1][j - 1];
                } else {
                    dp[i][j] = 1 + Math.min(Math.min(dp[i][j - 1], dp[i - 1][j]), dp[i - 1][j - 1]);
                }
            }
        }

        return dp[s1.length()][s2.length()];
    }

    // ...existing code...
}