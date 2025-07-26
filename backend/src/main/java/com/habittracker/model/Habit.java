package com.habittracker.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDate;

/**
 * Entity representing a habit that the user wants to track.
 */
@Entity
@Table(name = "habits")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Habit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 500)
    private String description;

    @Column(name = "created_at", nullable = false)
    private LocalDate createdAt;

    // Pomodoro/Timer-related fields
    @Enumerated(EnumType.STRING)
    @Column(name = "habit_type", nullable = false)
    @Builder.Default
    private HabitType habitType = HabitType.STANDARD;

    @Column(name = "timer_duration_minutes")
    private Integer timerDurationMinutes; // Only used for TIMED habits

    /**
     * Enum defining the different types of habits
     */
    public enum HabitType {
        STANDARD, // Traditional check-off habits
        TIMED // Pomodoro/timer-based habits
    }
}
