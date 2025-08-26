package com.habittracker.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.habittracker.model.Habit;
import com.habittracker.model.HabitLog;
import com.habittracker.model.PomodoroSession;
import com.habittracker.repository.HabitRepository;
import com.habittracker.repository.HabitLogRepository;
import com.habittracker.repository.PomodoroSessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Service for data export and import functionality
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class DataExportImportService {

    private final HabitRepository habitRepository;
    private final HabitLogRepository habitLogRepository;
    private final PomodoroSessionRepository pomodoroSessionRepository;
    private final ObjectMapper objectMapper;

    /**
     * Export all user data as JSON
     */
    public String exportUserData(Long userId) {
        try {
            List<Habit> habits = habitRepository.findActiveHabitsByUser(userId);

            ExportData exportData = new ExportData();
            exportData.exportDate = LocalDateTime.now();
            exportData.version = "1.0";
            exportData.habits = habits;

            // Get logs and sessions for each habit
            for (Habit habit : habits) {
                // Get all logs for this habit (we'll use a date range query)
                LocalDate startDate = LocalDate.of(2020, 1, 1); // Far back start date
                LocalDate endDate = LocalDate.now().plusDays(1); // Tomorrow
                List<HabitLog> logs = habitLogRepository.findByHabitIdAndCompletionDateBetween(habit.getId(), startDate, endDate);
                exportData.habitLogs.addAll(logs);

                List<PomodoroSession> sessions = pomodoroSessionRepository.findByHabitIdOrderByCompletedAtDesc(habit.getId());
                exportData.pomodoroSessions.addAll(sessions);
            }

            return objectMapper.writeValueAsString(exportData);
        } catch (Exception e) {
            log.error("Failed to export user data", e);
            throw new RuntimeException("Export failed: " + e.getMessage());
        }
    }

    /**
     * Import user data from JSON
     */
    @Transactional
    public ImportResult importUserData(MultipartFile file, Long userId) {
        ImportResult result = new ImportResult();
        
        try {
            String content = new String(file.getBytes());
            ExportData importData = objectMapper.readValue(content, ExportData.class);
            
            result.totalHabits = importData.habits.size();
            result.totalLogs = importData.habitLogs.size();
            result.totalSessions = importData.pomodoroSessions.size();

            // Import habits
            for (Habit habit : importData.habits) {
                try {
                    // Reset ID and set user
                    habit.setId(null);
                    if (userId != null) {
                        habit.setUser(null); // Will be set by service layer if needed
                    }
                    habit.setCreatedAt(habit.getCreatedAt() != null ? habit.getCreatedAt() : LocalDate.now());
                    habit.setUpdatedAt(LocalDateTime.now());

                    Habit savedHabit = habitRepository.save(habit);
                    result.importedHabits++;
                    
                    // Import logs for this habit
                    Long originalHabitId = findOriginalHabitId(importData.habits, habit);
                    if (originalHabitId != null) {
                        for (HabitLog habitLog : importData.habitLogs) {
                            if (habitLog.getHabitId().equals(originalHabitId)) {
                                habitLog.setId(null);
                                habitLog.setHabitId(savedHabit.getId());
                                try {
                                    habitLogRepository.save(habitLog);
                                    result.importedLogs++;
                                } catch (Exception e) {
                                    log.warn("Failed to import log for habit {}: {}", savedHabit.getId(), e.getMessage());
                                }
                            }
                        }

                        // Import Pomodoro sessions for this habit
                        for (PomodoroSession session : importData.pomodoroSessions) {
                            if (session.getHabitId().equals(originalHabitId)) {
                                session.setId(null);
                                session.setHabitId(savedHabit.getId());
                                try {
                                    pomodoroSessionRepository.save(session);
                                    result.importedSessions++;
                                } catch (Exception e) {
                                    log.warn("Failed to import session for habit {}: {}", savedHabit.getId(), e.getMessage());
                                }
                            }
                        }
                    }
                } catch (Exception e) {
                    log.error("Failed to import habit: {}", habit.getName(), e);
                    result.failedHabits++;
                }
            }

        } catch (Exception e) {
            log.error("Failed to import user data", e);
            throw new RuntimeException("Import failed: " + e.getMessage());
        }

        return result;
    }

    private Long findOriginalHabitId(List<Habit> habits, Habit targetHabit) {
        for (int i = 0; i < habits.size(); i++) {
            if (habits.get(i).getName().equals(targetHabit.getName()) && 
                habits.get(i).getDescription().equals(targetHabit.getDescription())) {
                return (long) (i + 1); // Simple mapping based on position
            }
        }
        return null;
    }

    /**
     * Data structure for export/import
     */
    public static class ExportData {
        public String version;
        public LocalDateTime exportDate;
        public List<Habit> habits;
        public List<HabitLog> habitLogs = new java.util.ArrayList<>();
        public List<PomodoroSession> pomodoroSessions = new java.util.ArrayList<>();
    }

    /**
     * Result of import operation
     */
    public static class ImportResult {
        public int totalHabits;
        public int totalLogs;
        public int totalSessions;
        public int importedHabits;
        public int importedLogs;
        public int importedSessions;
        public int failedHabits;

        public boolean isSuccessful() {
            return failedHabits == 0 && importedHabits > 0;
        }
    }
}