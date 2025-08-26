package com.habittracker.controller;

import com.habittracker.dto.PomodoroSessionDTO;
import com.habittracker.model.PomodoroSession;
import com.habittracker.service.PomodoroSessionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * REST Controller for Pomodoro session management
 */
@RestController
@RequestMapping("/api/pomodoro")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class PomodoroSessionController {

    private final PomodoroSessionService pomodoroSessionService;

    /**
     * Log a completed Pomodoro session
     */
    @PostMapping("/sessions")
    public ResponseEntity<PomodoroSessionDTO> logSession(@RequestBody Map<String, Object> request) {
        try {
            Long habitId = Long.valueOf(request.get("habitId").toString());
            String sessionTypeStr = (String) request.get("sessionType");
            Integer durationMinutes = Integer.valueOf(request.get("durationMinutes").toString());

            PomodoroSession.SessionType sessionType = PomodoroSession.SessionType.valueOf(sessionTypeStr.toUpperCase());

            PomodoroSessionDTO session = pomodoroSessionService.logSession(habitId, sessionType, durationMinutes);
            return ResponseEntity.ok(session);
        } catch (Exception e) {
            log.error("Error logging Pomodoro session: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Get all sessions for a specific habit
     */
    @GetMapping("/sessions/habit/{habitId}")
    public ResponseEntity<List<PomodoroSessionDTO>> getSessionsForHabit(@PathVariable Long habitId) {
        try {
            List<PomodoroSessionDTO> sessions = pomodoroSessionService.getSessionsForHabit(habitId);
            return ResponseEntity.ok(sessions);
        } catch (Exception e) {
            log.error("Error getting sessions for habit {}: {}", habitId, e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Get sessions for a habit on a specific date
     */
    @GetMapping("/sessions/habit/{habitId}/date/{date}")
    public ResponseEntity<List<PomodoroSessionDTO>> getSessionsForHabitOnDate(
            @PathVariable Long habitId,
            @PathVariable String date) {
        try {
            LocalDate localDate = LocalDate.parse(date);
            List<PomodoroSessionDTO> sessions = pomodoroSessionService.getSessionsForHabitOnDate(habitId, localDate);
            return ResponseEntity.ok(sessions);
        } catch (Exception e) {
            log.error("Error getting sessions for habit {} on date {}: {}", habitId, date, e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Get work session count for a habit on a specific date
     */
    @GetMapping("/sessions/habit/{habitId}/count/date/{date}")
    public ResponseEntity<Map<String, Long>> getWorkSessionCount(
            @PathVariable Long habitId,
            @PathVariable String date) {
        try {
            LocalDate localDate = LocalDate.parse(date);
            long count = pomodoroSessionService.getWorkSessionCount(habitId, localDate);
            return ResponseEntity.ok(Map.of("count", count));
        } catch (Exception e) {
            log.error("Error getting work session count for habit {} on date {}: {}", habitId, date, e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
}