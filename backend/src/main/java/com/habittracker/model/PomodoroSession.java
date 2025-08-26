package com.habittracker.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

/**
 * Entity representing a completed Pomodoro session for a habit.
 * This tracks individual work sessions, breaks, and statistics per habit.
 */
@Entity
@Table(name = "pomodoro_sessions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PomodoroSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "habit_id", nullable = false)
    private Long habitId;

    @Enumerated(EnumType.STRING)
    @Column(name = "session_type", nullable = false)
    private SessionType sessionType;

    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes;

    @Column(name = "completed_at", nullable = false)
    private LocalDateTime completedAt;

    @Column(name = "completion_date", nullable = false)
    private java.time.LocalDate completionDate;

    /**
     * Enum defining types of Pomodoro sessions
     */
    public enum SessionType {
        WORK,           // Work/focus session
        SHORT_BREAK,    // Short break (5-10 min)
        LONG_BREAK      // Long break (15-30 min)
    }
}