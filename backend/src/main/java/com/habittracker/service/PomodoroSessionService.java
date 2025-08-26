package com.habittracker.service;

import com.habittracker.dto.PomodoroSessionDTO;
import com.habittracker.model.PomodoroSession;
import com.habittracker.repository.PomodoroSessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for managing Pomodoro sessions
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PomodoroSessionService {

    private final PomodoroSessionRepository pomodoroSessionRepository;

    /**
     * Log a completed Pomodoro session
     */
    @Transactional
    public PomodoroSessionDTO logSession(Long habitId, PomodoroSession.SessionType sessionType, Integer durationMinutes) {
        log.info("Logging pomodoro session for habit {} - type: {}, duration: {} minutes", habitId, sessionType, durationMinutes);

        LocalDateTime now = LocalDateTime.now();
        PomodoroSession session = PomodoroSession.builder()
                .habitId(habitId)
                .sessionType(sessionType)
                .durationMinutes(durationMinutes)
                .completedAt(now)
                .completionDate(now.toLocalDate())
                .build();

        PomodoroSession savedSession = pomodoroSessionRepository.save(session);
        return mapToDTO(savedSession);
    }

    /**
     * Get all sessions for a habit
     */
    public List<PomodoroSessionDTO> getSessionsForHabit(Long habitId) {
        return pomodoroSessionRepository.findByHabitIdOrderByCompletedAtDesc(habitId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get sessions for a habit on a specific date
     */
    public List<PomodoroSessionDTO> getSessionsForHabitOnDate(Long habitId, LocalDate date) {
        return pomodoroSessionRepository.findByHabitIdAndCompletionDate(habitId, date)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get work session count for a habit on a specific date
     */
    public long getWorkSessionCount(Long habitId, LocalDate date) {
        return pomodoroSessionRepository.countWorkSessionsByHabitAndDate(habitId, date);
    }

    /**
     * Get work session count for a habit in a date range
     */
    public long getWorkSessionCount(Long habitId, LocalDate startDate, LocalDate endDate) {
        return pomodoroSessionRepository.countWorkSessionsByHabitAndDateRange(habitId, startDate, endDate);
    }

    /**
     * Convert PomodoroSession entity to DTO
     */
    private PomodoroSessionDTO mapToDTO(PomodoroSession session) {
        return PomodoroSessionDTO.builder()
                .id(session.getId())
                .habitId(session.getHabitId())
                .sessionType(session.getSessionType())
                .durationMinutes(session.getDurationMinutes())
                .completedAt(session.getCompletedAt())
                .completionDate(session.getCompletionDate())
                .build();
    }
}