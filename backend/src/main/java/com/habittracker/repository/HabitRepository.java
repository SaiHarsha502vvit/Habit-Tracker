package com.habittracker.repository;

import com.habittracker.model.Habit;
import com.habittracker.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for Habit entity operations.
 * Enhanced with Phase 1 features.
 */
@Repository
public interface HabitRepository extends JpaRepository<Habit, Long> {

    /**
     * Find habits by user ID for authenticated access.
     * Returns all habits if userId is null (backward compatibility).
     */
    @Query("SELECT h FROM Habit h WHERE (:userId IS NULL OR h.user.id = :userId) AND h.isArchived = false")
    List<Habit> findActiveHabitsByUser(@Param("userId") Long userId);

    /**
     * Find habits by category.
     */
    List<Habit> findByCategoryAndIsArchivedFalse(Category category);

    /**
     * Find habits by priority.
     */
    List<Habit> findByPriorityAndIsArchivedFalse(Habit.Priority priority);

    /**
     * Find habits containing specific tags.
     */
    @Query("SELECT h FROM Habit h JOIN h.tags t WHERE t IN :tags AND h.isArchived = false")
    List<Habit> findByTagsContaining(@Param("tags") List<String> tags);

    /**
     * Find habits by habit type and user.
     */
    @Query("SELECT h FROM Habit h WHERE h.habitType = :habitType AND (:userId IS NULL OR h.user.id = :userId) AND h.isArchived = false")
    List<Habit> findByHabitTypeAndUser(@Param("habitType") Habit.HabitType habitType, @Param("userId") Long userId);

    /**
     * Get statistics for analytics dashboard.
     */
    @Query("SELECT COUNT(h) FROM Habit h WHERE (:userId IS NULL OR h.user.id = :userId) AND h.isArchived = false")
    long countActiveHabitsByUser(@Param("userId") Long userId);

    /**
     * Find archived habits for user.
     */
    @Query("SELECT h FROM Habit h WHERE (:userId IS NULL OR h.user.id = :userId) AND h.isArchived = true")
    List<Habit> findArchivedHabitsByUser(@Param("userId") Long userId);
}
