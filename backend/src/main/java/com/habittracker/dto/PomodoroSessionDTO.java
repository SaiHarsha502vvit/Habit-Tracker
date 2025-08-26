package com.habittracker.dto;

import com.habittracker.model.PomodoroSession;
import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Data Transfer Object for Pomodoro session data
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PomodoroSessionDTO {
    private Long id;
    private Long habitId;
    private PomodoroSession.SessionType sessionType;
    private Integer durationMinutes;
    private LocalDateTime completedAt;
    private LocalDate completionDate;
}

/**
 * DTO for session statistics summary
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
class SessionStatsDTO {
    private LocalDate date;
    private long workSessions;
    private long shortBreaks;
    private long longBreaks;
    private int totalWorkMinutes;
    private int totalBreakMinutes;
}

/**
 * DTO for creating a new Pomodoro session
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
class CreatePomodoroSessionDTO {
    private Long habitId;
    private PomodoroSession.SessionType sessionType;
    private Integer durationMinutes;
}