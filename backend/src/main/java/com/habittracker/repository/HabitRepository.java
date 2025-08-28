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

       /**
        * Advanced search functionality for Phase 2
        */

       /**
        * Search habits by text (name, description, tags)
        */
       @Query("SELECT DISTINCT h FROM Habit h LEFT JOIN h.tags t WHERE " +
                     "(:userId IS NULL OR h.user.id = :userId) AND h.isArchived = false AND " +
                     "(LOWER(h.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
                     "LOWER(h.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
                     "LOWER(t) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
       List<Habit> searchHabits(@Param("userId") Long userId, @Param("searchTerm") String searchTerm);

       /**
        * Find habits by multiple criteria
        */
       @Query("SELECT DISTINCT h FROM Habit h LEFT JOIN h.tags t LEFT JOIN h.category c LEFT JOIN h.folder f WHERE " +
                     "(:userId IS NULL OR h.user.id = :userId) AND h.isArchived = false AND " +
                     "(:searchTerm IS NULL OR " +
                     "  LOWER(h.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
                     "  LOWER(h.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
                     "  LOWER(t) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) AND " +
                     "(:categoryId IS NULL OR c.id = :categoryId) AND " +
                     "(:priority IS NULL OR h.priority = :priority) AND " +
                     "(:habitType IS NULL OR h.habitType = :habitType) AND " +
                     "(:folderId IS NULL OR f.id = :folderId OR f.parent.id = :folderId)")
       List<Habit> findHabitsWithFilters(@Param("userId") Long userId,
                     @Param("searchTerm") String searchTerm,
                     @Param("categoryId") Long categoryId,
                     @Param("priority") Habit.Priority priority,
                     @Param("habitType") Habit.HabitType habitType,
                     @Param("folderId") Long folderId);

       /**
        * Find habits by folder (including subfolders)
        */
       @Query("SELECT h FROM Habit h WHERE h.folder.id = :folderId OR h.folder.parent.id = :folderId")
       List<Habit> findByFolderIncludingSubfolders(@Param("folderId") Long folderId);

       /**
        * Find habits without folder (uncategorized)
        */
       @Query("SELECT h FROM Habit h WHERE (:userId IS NULL OR h.user.id = :userId) AND h.isArchived = false AND h.folder IS NULL")
       List<Habit> findUncategorizedHabits(@Param("userId") Long userId);

       /**
        * Find habits by multiple tags (habits containing all specified tags)
        */
       @Query("SELECT h FROM Habit h JOIN h.tags t WHERE " +
                     "(:userId IS NULL OR h.user.id = :userId) AND h.isArchived = false AND " +
                     "t IN :tags GROUP BY h HAVING COUNT(DISTINCT t) = :tagCount")
       List<Habit> findByAllTags(@Param("userId") Long userId, @Param("tags") List<String> tags,
                     @Param("tagCount") long tagCount);

       /**
        * Find habits by any of the specified tags
        */
       @Query("SELECT DISTINCT h FROM Habit h JOIN h.tags t WHERE " +
                     "(:userId IS NULL OR h.user.id = :userId) AND h.isArchived = false AND " +
                     "t IN :tags")
       List<Habit> findByAnyTags(@Param("userId") Long userId, @Param("tags") List<String> tags);

       /**
        * Get distinct tags used by user
        */
       @Query("SELECT DISTINCT t FROM Habit h JOIN h.tags t WHERE " +
                     "(:userId IS NULL OR h.user.id = :userId) AND h.isArchived = false ORDER BY t")
       List<String> findDistinctTagsByUser(@Param("userId") Long userId);

       /**
        * Find habits created in date range
        */
       @Query("SELECT h FROM Habit h WHERE (:userId IS NULL OR h.user.id = :userId) AND h.isArchived = false AND " +
                     "h.createdAt >= :startDate AND h.createdAt <= :endDate")
       List<Habit> findByCreatedDateRange(@Param("userId") Long userId,
                     @Param("startDate") java.time.LocalDate startDate,
                     @Param("endDate") java.time.LocalDate endDate);

       // ========== ADDITIONAL METHODS FOR FILE SYSTEM INTEGRATION ==========

       /**
        * Find habits in specific folder
        */
       @Query("SELECT h FROM Habit h WHERE h.folder.id = :folderId")
       List<Habit> findByFolderId(@Param("folderId") Long folderId);

       /**
        * Find non-archived habits in specific folder
        */
       @Query("SELECT h FROM Habit h WHERE h.folder.id = :folderId AND h.isArchived = false")
       List<Habit> findByFolderIdAndIsArchivedFalse(@Param("folderId") Long folderId);

       /**
        * Find habits without folder for specific user
        */
       @Query("SELECT h FROM Habit h WHERE h.user.id = :userId AND h.folder IS NULL")
       List<Habit> findByUserAndFolderIsNull(@Param("userId") Long userId);

       /**
        * Find non-archived habits without folder for specific user
        */
       @Query("SELECT h FROM Habit h WHERE h.user.id = :userId AND h.folder IS NULL AND h.isArchived = false")
       List<Habit> findByUserAndFolderIsNullAndIsArchivedFalse(@Param("userId") Long userId);
}
