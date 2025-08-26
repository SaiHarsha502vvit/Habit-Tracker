package com.habittracker.service;

import com.habittracker.dto.HabitDto;
import com.habittracker.dto.HabitLogDto;
import com.habittracker.dto.CategoryDto;
import com.habittracker.exception.ResourceNotFoundException;
import com.habittracker.model.Habit;
import com.habittracker.model.HabitLog;
import com.habittracker.model.User;
import com.habittracker.model.Category;
import com.habittracker.repository.HabitLogRepository;
import com.habittracker.repository.HabitRepository;
import com.habittracker.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Service layer for habit-related operations.
 * Enhanced with Phase 1 features while maintaining backward compatibility.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class HabitService {

    private final HabitRepository habitRepository;
    private final HabitLogRepository habitLogRepository;
    private final CategoryRepository categoryRepository;
    private final UserService userService;

    /**
     * Create a new habit with enhanced Phase 1 features and cache management.
     */
    @Transactional
    @CacheEvict(value = "habits", allEntries = true)
    public HabitDto createHabit(HabitDto habitDto) {
        log.info("Creating new habit: {}", habitDto.getName());

        try {
            // Get current user (null if unauthenticated for backward compatibility)
            User currentUser = userService.getCurrentUser();
            log.info("Current user: {}", currentUser != null ? currentUser.getUsername() : "anonymous");

            // Get category if specified
            Category category = null;
            if (habitDto.getCategoryId() != null) {
                category = categoryRepository.findById(habitDto.getCategoryId())
                        .orElseThrow(() -> new ResourceNotFoundException(
                                "Category not found with ID: " + habitDto.getCategoryId()));
                log.info("Using category: {}", category.getName());
            }

            // Build habit with enhanced features
            Habit.HabitBuilder habitBuilder = Habit.builder()
                    .name(habitDto.getName())
                    .description(habitDto.getDescription())
                    .habitType(habitDto.getHabitType())
                    .timerDurationMinutes(habitDto.getTimerDurationMinutes())
                    .createdAt(LocalDate.now())
                    .user(currentUser) // Can be null for backward compatibility
                    .category(category)
                    .tags(habitDto.getTags())
                    .priority(habitDto.getPriority())
                    .timerPreset(habitDto.getTimerPreset());

            // Set timer duration from preset if applicable
            if (habitDto.getTimerPreset() != null && habitDto.getTimerPreset() != Habit.TimerPreset.CUSTOM) {
                habitBuilder.timerDurationMinutes(habitDto.getTimerPreset().getWorkMinutes());
            }

            Habit habit = habitBuilder.build();
            log.info("Built habit entity: {}", habit.getName());

            Habit savedHabit = habitRepository.save(habit);
            log.info("Saved habit with ID: {}", savedHabit.getId());

            // Ensure all lazy associations are loaded within transaction
            if (savedHabit.getCategory() != null) {
                // Force loading of category
                savedHabit.getCategory().getName();
            }
            if (savedHabit.getUser() != null) {
                // Force loading of user
                savedHabit.getUser().getUsername();
            }

            HabitDto result = mapToDto(savedHabit);
            log.info("Mapped to DTO successfully");
            return result;

        } catch (Exception e) {
            log.error("Error creating habit: {}", e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Get all habits with user-based filtering and caching.
     */
    @Cacheable(value = "habits", key = "#userId ?: 'anonymous'")
    public List<HabitDto> getAllHabits() {
        log.info("Fetching all habits from database (cache miss)");

        User currentUser = userService.getCurrentUser();
        Long userId = currentUser != null ? currentUser.getId() : null;

        return habitRepository.findActiveHabitsByUser(userId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    /**
     * Get habits by category.
     */
    public List<HabitDto> getHabitsByCategory(Long categoryId) {
        log.info("Fetching habits by category: {}", categoryId);

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + categoryId));

        return habitRepository.findByCategoryAndIsArchivedFalse(category)
                .stream()
                .filter(habit -> isUserAllowedToAccessHabit(habit))
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    /**
     * Get habits by priority.
     */
    public List<HabitDto> getHabitsByPriority(Habit.Priority priority) {
        log.info("Fetching habits by priority: {}", priority);

        User currentUser = userService.getCurrentUser();
        return habitRepository.findByPriorityAndIsArchivedFalse(priority)
                .stream()
                .filter(habit -> isUserAllowedToAccessHabit(habit))
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    /**
     * Get habits by tags.
     */
    public List<HabitDto> getHabitsByTags(List<String> tags) {
        log.info("Fetching habits by tags: {}", tags);

        return habitRepository.findByTagsContaining(tags)
                .stream()
                .filter(habit -> isUserAllowedToAccessHabit(habit))
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    /**
     * Update habit with cache invalidation.
     */
    @Transactional
    @CachePut(value = "habits", key = "#habitId")
    @CacheEvict(value = "habitLogs", key = "#habitId")
    public HabitDto updateHabit(Long habitId, HabitDto habitDto) {
        log.info("Updating habit with ID: {}", habitId);

        Habit habit = habitRepository.findById(habitId)
                .orElseThrow(() -> new ResourceNotFoundException("Habit not found with ID: " + habitId));

        // Check user permissions
        if (!isUserAllowedToModifyHabit(habit)) {
            throw new IllegalArgumentException("You don't have permission to modify this habit");
        }

        // Update basic fields
        habit.setName(habitDto.getName());
        habit.setDescription(habitDto.getDescription());
        habit.setHabitType(habitDto.getHabitType());
        habit.setTimerDurationMinutes(habitDto.getTimerDurationMinutes());
        habit.setPriority(habitDto.getPriority());
        habit.setTags(habitDto.getTags());
        habit.setTimerPreset(habitDto.getTimerPreset());
        habit.setUpdatedAt(LocalDateTime.now());

        // Update category if specified
        if (habitDto.getCategoryId() != null) {
            Category category = categoryRepository.findById(habitDto.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Category not found with ID: " + habitDto.getCategoryId()));
            habit.setCategory(category);
        } else {
            habit.setCategory(null);
        }

        // Set timer duration from preset if applicable
        if (habitDto.getTimerPreset() != null && habitDto.getTimerPreset() != Habit.TimerPreset.CUSTOM) {
            habit.setTimerDurationMinutes(habitDto.getTimerPreset().getWorkMinutes());
        }

        Habit updatedHabit = habitRepository.save(habit);
        return mapToDto(updatedHabit);
    }

    /**
     * Archive habit instead of deleting.
     */
    @Transactional
    public void archiveHabit(Long habitId) {
        log.info("Archiving habit with ID: {}", habitId);

        Habit habit = habitRepository.findById(habitId)
                .orElseThrow(() -> new ResourceNotFoundException("Habit not found with ID: " + habitId));

        // Check user permissions
        if (!isUserAllowedToModifyHabit(habit)) {
            throw new IllegalArgumentException("You don't have permission to modify this habit");
        }

        habit.setArchived(true);
        habit.setUpdatedAt(LocalDateTime.now());
        habitRepository.save(habit);
    }

    /**
     * Delete a habit and all its associated logs (maintained for backward
     * compatibility).
     */
    @Transactional
    public void deleteHabit(Long habitId) {
        log.info("Deleting habit with ID: {}", habitId);

        Habit habit = habitRepository.findById(habitId)
                .orElseThrow(() -> new ResourceNotFoundException("Habit not found with ID: " + habitId));

        // Check user permissions
        if (!isUserAllowedToModifyHabit(habit)) {
            throw new IllegalArgumentException("You don't have permission to delete this habit");
        }

        // Delete all associated logs first
        habitLogRepository.deleteByHabitId(habitId);

        // Delete the habit
        habitRepository.deleteById(habitId);
    }

    /**
     * Log a habit completion for a specific date.
     * This method is idempotent - if a log already exists for the date, it returns
     * the existing log.
     */
    @Transactional
    public HabitLogDto logHabitCompletion(Long habitId, LocalDate completionDate) {
        log.info("Logging completion for habit {} on date {}", habitId, completionDate);

        Habit habit = habitRepository.findById(habitId)
                .orElseThrow(() -> new ResourceNotFoundException("Habit not found with ID: " + habitId));

        // Check user permissions
        if (!isUserAllowedToModifyHabit(habit)) {
            throw new IllegalArgumentException("You don't have permission to log this habit");
        }

        // Check if log already exists for this date (idempotency)
        Optional<HabitLog> existingLog = habitLogRepository.findByHabitIdAndCompletionDate(habitId, completionDate);
        if (existingLog.isPresent()) {
            log.info("Log already exists for habit {} on date {}", habitId, completionDate);
            return mapToDto(existingLog.get());
        }

        // Create new log
        HabitLog habitLog = HabitLog.builder()
                .habitId(habitId)
                .completionDate(completionDate)
                .build();

        HabitLog savedLog = habitLogRepository.save(habitLog);

        // Update streak count (simplified streak calculation)
        updateHabitStreak(habit, completionDate);

        return mapToDto(savedLog);
    }

    /**
     * Get completion logs for a habit within a specific year with caching.
     */
    @Cacheable(value = "habitLogs", key = "#habitId + '_' + #year")
    public List<LocalDate> getCompletionLogsForYear(Long habitId, int year) {
        log.info("Fetching completion logs for habit {} in year {}", habitId, year);

        Habit habit = habitRepository.findById(habitId)
                .orElseThrow(() -> new ResourceNotFoundException("Habit not found with ID: " + habitId));

        // Check user permissions
        if (!isUserAllowedToAccessHabit(habit)) {
            throw new IllegalArgumentException("You don't have permission to access this habit");
        }

        LocalDate startDate = LocalDate.of(year, 1, 1);
        LocalDate endDate = LocalDate.of(year, 12, 31);

        return habitLogRepository.findByHabitIdAndCompletionDateBetween(habitId, startDate, endDate)
                .stream()
                .map(HabitLog::getCompletionDate)
                .collect(Collectors.toList());
    }

    /**
     * Get habit statistics for analytics.
     */
    public long getUserHabitCount() {
        User currentUser = userService.getCurrentUser();
        Long userId = currentUser != null ? currentUser.getId() : null;
        return habitRepository.countActiveHabitsByUser(userId);
    }

    /**
     * Check if user is allowed to access a habit.
     */
    private boolean isUserAllowedToAccessHabit(Habit habit) {
        User currentUser = userService.getCurrentUser();

        // If no authentication, allow access to habits without user (backward
        // compatibility)
        if (currentUser == null) {
            return habit.getUser() == null;
        }

        // If authenticated, allow access to own habits or public habits
        return habit.getUser() == null || habit.getUser().getId().equals(currentUser.getId());
    }

    /**
     * Check if user is allowed to modify a habit.
     */
    private boolean isUserAllowedToModifyHabit(Habit habit) {
        User currentUser = userService.getCurrentUser();

        // If no authentication, allow modification of habits without user (backward
        // compatibility)
        if (currentUser == null) {
            return habit.getUser() == null;
        }

        // If authenticated, only allow modification of own habits or public habits
        return habit.getUser() == null || habit.getUser().getId().equals(currentUser.getId());
    }

    /**
     * Update habit streak count (simplified implementation).
     */
    private void updateHabitStreak(Habit habit, LocalDate completionDate) {
        // Simple streak calculation - count consecutive days up to completion date
        LocalDate checkDate = completionDate.minusDays(1);
        int streak = 1; // Current completion counts as 1

        while (checkDate.isAfter(habit.getCreatedAt().minusDays(1))) {
            Optional<HabitLog> log = habitLogRepository.findByHabitIdAndCompletionDate(habit.getId(), checkDate);
            if (log.isPresent()) {
                streak++;
                checkDate = checkDate.minusDays(1);
            } else {
                break;
            }
        }

        habit.setStreakCount(streak);
        habit.setUpdatedAt(LocalDateTime.now());
        habitRepository.save(habit);
    }

    /**
     * Map Habit entity to DTO with enhanced features.
     */
    public HabitDto mapToDto(Habit habit) {
        HabitDto.HabitDtoBuilder dtoBuilder = HabitDto.builder()
                .id(habit.getId())
                .name(habit.getName())
                .description(habit.getDescription())
                .habitType(habit.getHabitType())
                .timerDurationMinutes(habit.getTimerDurationMinutes())
                .createdAt(habit.getCreatedAt().toString())
                .updatedAt(habit.getUpdatedAt() != null ? habit.getUpdatedAt().toString() : null)
                .categoryId(habit.getCategory() != null ? habit.getCategory().getId() : null)
                .tags(habit.getTags())
                .priority(habit.getPriority())
                .timerPreset(habit.getTimerPreset())
                .isArchived(habit.isArchived())
                .streakCount(habit.getStreakCount())
                .username(habit.getUser() != null ? habit.getUser().getUsername() : null);

        // Add category details if available
        if (habit.getCategory() != null) {
            CategoryDto categoryDto = CategoryDto.builder()
                    .id(habit.getCategory().getId())
                    .name(habit.getCategory().getName())
                    .description(habit.getCategory().getDescription())
                    .color(habit.getCategory().getColor())
                    .icon(habit.getCategory().getIcon())
                    .build();
            dtoBuilder.category(categoryDto);
        }

        return dtoBuilder.build();
    }

    /**
     * Map HabitLog entity to DTO.
     */
    private HabitLogDto mapToDto(HabitLog habitLog) {
        return HabitLogDto.builder()
                .id(habitLog.getId())
                .habitId(habitLog.getHabitId())
                .completionDate(habitLog.getCompletionDate().toString())
                .build();
    }
}
