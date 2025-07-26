package com.habittracker.repository;

import com.habittracker.model.Habit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository interface for Habit entity operations.
 */
@Repository
public interface HabitRepository extends JpaRepository<Habit, Long> {
}
