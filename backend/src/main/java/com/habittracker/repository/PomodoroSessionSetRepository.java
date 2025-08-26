package com.habittracker.repository;

import com.habittracker.model.PomodoroSessionSet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for PomodoroSessionSet entity operations.
 */
@Repository
public interface PomodoroSessionSetRepository extends JpaRepository<PomodoroSessionSet, Long> {

    /**
     * Find active session set for a specific habit
     */
    Optional<PomodoroSessionSet> findByHabitIdAndIsActiveTrue(Long habitId);

    /**
     * Find all session sets for a specific habit
     */
    List<PomodoroSessionSet> findByHabitIdOrderByStartTimeDesc(Long habitId);

    /**
     * Find completed session sets for a specific habit
     */
    List<PomodoroSessionSet> findByHabitIdAndIsCompletedTrueOrderByStartTimeDesc(Long habitId);

    /**
     * Find session sets within a date range
     */
    @Query("SELECT pss FROM PomodoroSessionSet pss WHERE pss.habitId = :habitId " +
           "AND pss.startTime >= :startTime AND pss.startTime <= :endTime " +
           "ORDER BY pss.startTime DESC")
    List<PomodoroSessionSet> findByHabitIdAndStartTimeBetween(
            @Param("habitId") Long habitId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime);

    /**
     * Count total completed session sets for a habit
     */
    long countByHabitIdAndIsCompletedTrue(Long habitId);

    /**
     * Find recent active session sets (for cleanup/management)
     */
    @Query("SELECT pss FROM PomodoroSessionSet pss WHERE pss.isActive = true " +
           "AND pss.startTime >= :cutoffTime ORDER BY pss.startTime DESC")
    List<PomodoroSessionSet> findRecentActiveSessions(@Param("cutoffTime") LocalDateTime cutoffTime);

    /**
     * Get statistics for a habit's session sets
     */
    @Query("SELECT COUNT(pss), AVG(pss.completedSessions), SUM(pss.plannedSessions), SUM(pss.completedSessions) " +
           "FROM PomodoroSessionSet pss WHERE pss.habitId = :habitId AND pss.isCompleted = true")
    Object[] getStatisticsForHabit(@Param("habitId") Long habitId);
}