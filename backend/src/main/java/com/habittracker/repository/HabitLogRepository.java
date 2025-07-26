package com.habittracker.repository;

import com.habittracker.model.HabitLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for HabitLog entity operations.
 */
@Repository
public interface HabitLogRepository extends JpaRepository<HabitLog, Long> {

    /**
     * Find a habit log by habit ID and completion date.
     */
    Optional<HabitLog> findByHabitIdAndCompletionDate(Long habitId, LocalDate completionDate);

    /**
     * Find all habit logs for a specific habit within a date range.
     */
    @Query("SELECT hl FROM HabitLog hl WHERE hl.habitId = :habitId AND hl.completionDate BETWEEN :startDate AND :endDate")
    List<HabitLog> findByHabitIdAndCompletionDateBetween(
            @Param("habitId") Long habitId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    /**
     * Delete all logs for a specific habit.
     */
    void deleteByHabitId(Long habitId);
}
