package com.habittracker.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

/**
 * Entity representing a complete Pomodoro session set/cycle.
 * This tracks a planned set of Pomodoros with breaks and completion status.
 */
@Entity
@Table(name = "pomodoro_session_sets")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PomodoroSessionSet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "habit_id", nullable = false)
    private Long habitId;

    @Column(name = "planned_sessions", nullable = false)
    private Integer plannedSessions; // Number of Pomodoros planned (e.g., 4)

    @Column(name = "completed_sessions", nullable = false)
    @Builder.Default
    private Integer completedSessions = 0; // Number completed

    @Column(name = "work_minutes", nullable = false)
    private Integer workMinutes; // Work session duration

    @Column(name = "short_break_minutes", nullable = false)
    private Integer shortBreakMinutes; // Short break duration

    @Column(name = "long_break_minutes", nullable = false)
    private Integer longBreakMinutes; // Long break duration

    @Column(name = "sessions_before_long_break", nullable = false)
    @Builder.Default
    private Integer sessionsBeforeLongBreak = 4; // Usually 4

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime; // Cycle start

    @Column(name = "end_time")
    private LocalDateTime endTime; // Cycle completion

    @Column(name = "is_completed", nullable = false)
    @Builder.Default
    private Boolean isCompleted = false;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true; // Whether this cycle is currently active

    @Column(name = "current_session", nullable = false)
    @Builder.Default
    private Integer currentSession = 1; // Current Pomodoro number (1-based)

    @Enumerated(EnumType.STRING)
    @Column(name = "current_phase", nullable = false)
    @Builder.Default
    private Phase currentPhase = Phase.WORK; // Current phase in the cycle

    @Column(name = "auto_advance", nullable = false)
    @Builder.Default
    private Boolean autoAdvance = true; // Auto-start next session

    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * Enum defining the current phase of the Pomodoro cycle
     */
    public enum Phase {
        PLANNING,    // Initial setup phase
        WORK,        // Working on a Pomodoro
        SHORT_BREAK, // Short break between Pomodoros
        LONG_BREAK,  // Long break after completing a set
        COMPLETED    // Entire cycle completed
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }

    /**
     * Helper method to check if a long break is needed
     */
    public boolean needsLongBreak() {
        return completedSessions > 0 && 
               completedSessions % sessionsBeforeLongBreak == 0 && 
               completedSessions < plannedSessions;
    }

    /**
     * Helper method to check if the cycle should be completed
     */
    public boolean shouldComplete() {
        return completedSessions >= plannedSessions;
    }

    /**
     * Helper method to advance to next session
     */
    public void advanceToNextSession() {
        if (currentPhase == Phase.WORK) {
            completedSessions++;
            if (shouldComplete()) {
                currentPhase = Phase.COMPLETED;
                isCompleted = true;
                isActive = false;
                endTime = LocalDateTime.now();
            } else if (needsLongBreak()) {
                currentPhase = Phase.LONG_BREAK;
            } else {
                currentPhase = Phase.SHORT_BREAK;
            }
        } else if (currentPhase == Phase.SHORT_BREAK || currentPhase == Phase.LONG_BREAK) {
            currentPhase = Phase.WORK;
            currentSession = completedSessions + 1;
        }
        updatedAt = LocalDateTime.now();
    }
}