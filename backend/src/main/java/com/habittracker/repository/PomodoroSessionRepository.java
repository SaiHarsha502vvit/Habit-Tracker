package com.habittracker.repository;

import com.habittracker.model.PomodoroSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

/**
 * Repository interface for PomodoroSession entity operations
 */
@Repository
public interface PomodoroSessionRepository extends JpaRepository<PomodoroSession, Long> {

    /**
     * Find all sessions for a specific habit
     */
    List<PomodoroSession> findByHabitIdOrderByCompletedAtDesc(Long habitId);

    /**
     * Find sessions for a specific habit on a specific date
     */
    List<PomodoroSession> findByHabitIdAndCompletionDate(Long habitId, LocalDate date);

    /**
     * Count work sessions for a habit on a specific date
     */
    @Query("SELECT COUNT(ps) FROM PomodoroSession ps WHERE ps.habitId = :habitId AND ps.completionDate = :date AND ps.sessionType = 'WORK'")
    long countWorkSessionsByHabitAndDate(@Param("habitId") Long habitId, @Param("date") LocalDate date);

    /**
     * Count work sessions for a habit in a date range
     */
    @Query("SELECT COUNT(ps) FROM PomodoroSession ps WHERE ps.habitId = :habitId AND ps.completionDate BETWEEN :startDate AND :endDate AND ps.sessionType = 'WORK'")
    long countWorkSessionsByHabitAndDateRange(@Param("habitId") Long habitId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    /**
     * Get daily session statistics for a habit
     */
    @Query("SELECT ps.completionDate, ps.sessionType, COUNT(ps), SUM(ps.durationMinutes) " +
           "FROM PomodoroSession ps " +
           "WHERE ps.habitId = :habitId AND ps.completionDate BETWEEN :startDate AND :endDate " +
           "GROUP BY ps.completionDate, ps.sessionType " +
           "ORDER BY ps.completionDate DESC")
    List<Object[]> getSessionStatsByHabitAndDateRange(@Param("habitId") Long habitId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}