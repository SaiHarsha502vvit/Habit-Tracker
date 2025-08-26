package com.habittracker.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;

/**
 * Entity representing a habit that the user wants to track.
 * Enhanced with user association, categories, and tags support.
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

    // Phase 1 Enhancement: User association (nullable for backward compatibility)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = true) // Nullable for existing data
    private User user;

    // Phase 1 Enhancement: Category association (nullable for backward
    // compatibility)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = true)
    private Category category;

    // Phase 1 Enhancement: Tags support
    @ElementCollection
    @CollectionTable(name = "habit_tags", joinColumns = @JoinColumn(name = "habit_id"))
    @Column(name = "tag", length = 30)
    private Set<String> tags;

    // Phase 1 Enhancement: Priority levels
    @Enumerated(EnumType.STRING)
    @Column(name = "priority")
    @Builder.Default
    private Priority priority = Priority.MEDIUM;

    // Existing Pomodoro/Timer-related fields
    @Enumerated(EnumType.STRING)
    @Column(name = "habit_type", nullable = false)
    @Builder.Default
    private HabitType habitType = HabitType.STANDARD;

    @Column(name = "timer_duration_minutes")
    private Integer timerDurationMinutes; // Only used for TIMED habits

    // Phase 1 Enhancement: Enhanced timer presets support
    @Enumerated(EnumType.STRING)
    @Column(name = "timer_preset")
    private TimerPreset timerPreset;

    // Phase 1 Enhancement: Tracking additional metadata
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "is_archived", nullable = false)
    @Builder.Default
    private boolean isArchived = false;

    @Column(name = "streak_count")
    @Builder.Default
    private int streakCount = 0;

    /**
     * Enum defining the different types of habits
     */
    public enum HabitType {
        STANDARD, // Traditional check-off habits
        TIMED // Pomodoro/timer-based habits
    }

    /**
     * Enum defining priority levels
     */
    public enum Priority {
        LOW, MEDIUM, HIGH
    }

    /**
     * Enum defining timer presets for enhanced timer functionality
     */
    public enum TimerPreset {
        CUSTOM(0, 0, 0),
        POMODORO_CLASSIC(25, 5, 15),
        POMODORO_SHORT(15, 3, 10),
        DEEP_WORK(90, 20, 30),
        FOCUS_SPRINT(45, 10, 25);

        private final int workMinutes;
        private final int shortBreakMinutes;
        private final int longBreakMinutes;

        TimerPreset(int workMinutes, int shortBreakMinutes, int longBreakMinutes) {
            this.workMinutes = workMinutes;
            this.shortBreakMinutes = shortBreakMinutes;
            this.longBreakMinutes = longBreakMinutes;
        }

        public int getWorkMinutes() {
            return workMinutes;
        }

        public int getShortBreakMinutes() {
            return shortBreakMinutes;
        }

        public int getLongBreakMinutes() {
            return longBreakMinutes;
        }
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
