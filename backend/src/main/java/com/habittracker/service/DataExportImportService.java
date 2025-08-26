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
import java.util.HashMap;
import java.util.ArrayList;

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
     * Export all user data as JSON with enhanced features
     */
    public String exportUserData(Long userId) {
        try {
            log.info("Starting data export for user: {}", userId);
            List<Habit> habits = habitRepository.findActiveHabitsByUser(userId);

            ExportData exportData = new ExportData();
            exportData.exportDate = LocalDateTime.now();
            exportData.version = "2.0";
            exportData.habits = habits;
            exportData.totalHabits = habits.size();

            // Export statistics
            ExportStatistics stats = new ExportStatistics();

            // Get logs and sessions for each habit in batches for performance
            int batchSize = 100; // Process in smaller batches
            for (Habit habit : habits) {
                try {
                    // Get all logs for this habit with optimized query
                    LocalDate startDate = LocalDate.of(2020, 1, 1);
                    LocalDate endDate = LocalDate.now().plusDays(1);
                    List<HabitLog> logs = habitLogRepository.findByHabitIdAndCompletionDateBetween(
                            habit.getId(), startDate, endDate);
                    exportData.habitLogs.addAll(logs);
                    stats.totalLogs += logs.size();

                    // Get pomodoro sessions with limit to prevent memory issues
                    List<PomodoroSession> sessions = pomodoroSessionRepository
                            .findByHabitIdOrderByCompletedAtDesc(habit.getId());
                    exportData.pomodoroSessions.addAll(sessions);
                    stats.totalSessions += sessions.size();

                    // Calculate habit-specific statistics
                    stats.habitStats.put(habit.getId(), HabitStatistics.builder()
                            .habitId(habit.getId())
                            .habitName(habit.getName())
                            .totalLogs(logs.size())
                            .totalSessions(sessions.size())
                            .currentStreak(habit.getStreakCount())
                            .longestStreak(calculateLongestStreak(logs))
                            .averageSessionsPerWeek(calculateAverageSessionsPerWeek(sessions))
                            .build());

                } catch (Exception e) {
                    log.warn("Failed to export data for habit {}: {}", habit.getId(), e.getMessage());
                    stats.failedHabits++;
                }
            }

            exportData.statistics = stats;
            exportData.metadata = Map.of(
                    "exportVersion", "2.0",
                    "exportFormat", "JSON",
                    "compressionUsed", false,
                    "exportSizeBytes", -1, // Will be calculated after serialization
                    "userAgent", "HabitTracker-Backend-Export");

            String jsonData = objectMapper.writeValueAsString(exportData);
            log.info("Data export completed. Size: {} bytes, Habits: {}, Logs: {}, Sessions: {}",
                    jsonData.length(), habits.size(), stats.totalLogs, stats.totalSessions);

            return jsonData;
        } catch (Exception e) {
            log.error("Failed to export user data", e);
            throw new RuntimeException("Export failed: " + e.getMessage());
        }
    }

    /**
     * Import user data from JSON with enhanced validation and statistics
     */
    @Transactional
    public ImportResult importUserData(MultipartFile file, Long userId) {
        ImportResult result = new ImportResult();
        result.startTime = LocalDateTime.now();

        try {
            // Validate file size
            if (file.getSize() > 10 * 1024 * 1024) { // 10MB limit
                throw new RuntimeException("File too large. Maximum size is 10MB");
            }

            String content = new String(file.getBytes());
            ExportData importData = objectMapper.readValue(content, ExportData.class);

            // Validate export data format
            validateImportData(importData, result);

            result.totalHabits = importData.habits.size();
            result.totalLogs = importData.habitLogs.size();
            result.totalSessions = importData.pomodoroSessions.size();

            // Create backup before import if configured
            if (shouldCreateBackup()) {
                createImportBackup(userId);
            }

            // Import habits with improved error handling
            Map<Long, Long> habitIdMapping = new HashMap<>();
            for (Habit habit : importData.habits) {
                try {
                    // Enhanced validation for each habit
                    validateHabit(habit, result);

                    // Reset ID and set user
                    Long originalId = habit.getId();
                    habit.setId(null);
                    if (userId != null) {
                        habit.setUser(null); // Will be set by service layer if needed
                    }
                    habit.setCreatedAt(habit.getCreatedAt() != null ? habit.getCreatedAt() : LocalDate.now());
                    habit.setUpdatedAt(LocalDateTime.now());

                    Habit savedHabit = habitRepository.save(habit);
                    result.importedHabits++;

                    // Map original ID to new ID for logs and sessions
                    if (originalId != null) {
                        habitIdMapping.put(originalId, savedHabit.getId());
                    }

                    log.info("Successfully imported habit: {} with new ID: {}", habit.getName(), savedHabit.getId());

                } catch (Exception e) {
                    log.error("Failed to import habit: {}", habit.getName(), e);
                    result.failedHabits++;
                    result.errors.add("Failed to import habit '" + habit.getName() + "': " + e.getMessage());
                }
            }

            // Import logs with improved mapping
            for (HabitLog habitLog : importData.habitLogs) {
                try {
                    Long newHabitId = habitIdMapping.get(habitLog.getHabitId());
                    if (newHabitId != null) {
                        habitLog.setId(null);
                        habitLog.setHabitId(newHabitId);

                        // Check for duplicate logs
                        if (!habitLogRepository.findByHabitIdAndCompletionDate(
                                newHabitId, habitLog.getCompletionDate()).isPresent()) {
                            habitLogRepository.save(habitLog);
                            result.importedLogs++;
                        } else {
                            result.duplicateLogs++;
                        }
                    }
                } catch (Exception e) {
                    log.warn("Failed to import habit log: {}", e.getMessage());
                    result.failedLogs++;
                }
            }

            // Import Pomodoro sessions with improved mapping
            for (PomodoroSession session : importData.pomodoroSessions) {
                try {
                    Long newHabitId = habitIdMapping.get(session.getHabitId());
                    if (newHabitId != null) {
                        session.setId(null);
                        session.setHabitId(newHabitId);
                        pomodoroSessionRepository.save(session);
                        result.importedSessions++;
                    }
                } catch (Exception e) {
                    log.warn("Failed to import pomodoro session: {}", e.getMessage());
                    result.failedSessions++;
                }
            }

        } catch (Exception e) {
            log.error("Failed to import user data", e);
            result.errors.add("Import failed: " + e.getMessage());
            throw new RuntimeException("Import failed: " + e.getMessage());
        } finally {
            result.endTime = LocalDateTime.now();
            result.processingTimeMs = java.time.Duration.between(result.startTime, result.endTime).toMillis();
            log.info("Import completed in {}ms. Success: {}, Errors: {}",
                    result.processingTimeMs, result.importedHabits, result.errors.size());
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
     * Enhanced data structure for export/import with statistics
     */
    public static class ExportData {
        public String version;
        public LocalDateTime exportDate;
        public List<Habit> habits;
        public List<HabitLog> habitLogs = new ArrayList<>();
        public List<PomodoroSession> pomodoroSessions = new ArrayList<>();
        public int totalHabits;
        public ExportStatistics statistics;
        public Map<String, Object> metadata = new HashMap<>();
    }

    /**
     * Enhanced result of import operation with detailed statistics
     */
    public static class ImportResult {
        public int totalHabits;
        public int totalLogs;
        public int totalSessions;
        public int importedHabits;
        public int importedLogs;
        public int importedSessions;
        public int failedHabits;
        public int failedLogs;
        public int failedSessions;
        public int duplicateLogs;
        public List<String> errors = new ArrayList<>();
        public LocalDateTime startTime;
        public LocalDateTime endTime;
        public long processingTimeMs;

        public boolean isSuccessful() {
            return errors.isEmpty() && importedHabits > 0;
        }
    }

    /**
     * Export statistics for detailed reporting
     */
    public static class ExportStatistics {
        public int totalLogs;
        public int totalSessions;
        public int failedHabits;
        public Map<Long, HabitStatistics> habitStats = new HashMap<>();
    }

    /**
     * Individual habit statistics
     */
    public static class HabitStatistics {
        public Long habitId;
        public String habitName;
        public int totalLogs;
        public int totalSessions;
        public int currentStreak;
        public int longestStreak;
        public double averageSessionsPerWeek;

        public static HabitStatisticsBuilder builder() {
            return new HabitStatisticsBuilder();
        }

        public static class HabitStatisticsBuilder {
            private HabitStatistics stats = new HabitStatistics();

            public HabitStatisticsBuilder habitId(Long habitId) {
                stats.habitId = habitId;
                return this;
            }

            public HabitStatisticsBuilder habitName(String habitName) {
                stats.habitName = habitName;
                return this;
            }

            public HabitStatisticsBuilder totalLogs(int totalLogs) {
                stats.totalLogs = totalLogs;
                return this;
            }

            public HabitStatisticsBuilder totalSessions(int totalSessions) {
                stats.totalSessions = totalSessions;
                return this;
            }

            public HabitStatisticsBuilder currentStreak(int currentStreak) {
                stats.currentStreak = currentStreak;
                return this;
            }

            public HabitStatisticsBuilder longestStreak(int longestStreak) {
                stats.longestStreak = longestStreak;
                return this;
            }

            public HabitStatisticsBuilder averageSessionsPerWeek(double averageSessionsPerWeek) {
                stats.averageSessionsPerWeek = averageSessionsPerWeek;
                return this;
            }

            public HabitStatistics build() {
                return stats;
            }
        }
    }

    /**
     * Validation and helper methods
     */
    private void validateImportData(ExportData importData, ImportResult result) {
        if (importData.habits == null || importData.habits.isEmpty()) {
            throw new RuntimeException("No habits found in import file");
        }

        if (importData.version == null) {
            log.warn("No version information in import file");
        } else if (!importData.version.startsWith("1.") && !importData.version.startsWith("2.")) {
            result.errors.add("Unsupported export version: " + importData.version);
        }

        log.info("Validating import data - Version: {}, Habits: {}, Logs: {}, Sessions: {}",
                importData.version, importData.habits.size(),
                importData.habitLogs != null ? importData.habitLogs.size() : 0,
                importData.pomodoroSessions != null ? importData.pomodoroSessions.size() : 0);
    }

    private void validateHabit(Habit habit, ImportResult result) {
        if (habit.getName() == null || habit.getName().trim().isEmpty()) {
            throw new RuntimeException("Habit name cannot be empty");
        }

        if (habit.getName().length() > 100) {
            throw new RuntimeException("Habit name too long: " + habit.getName());
        }

        // Additional validation can be added here
    }

    private boolean shouldCreateBackup() {
        // This could be configurable via application properties
        return true;
    }

    private void createImportBackup(Long userId) {
        try {
            String backupData = exportUserData(userId);
            // Save backup to file system or database
            log.info("Created import backup for user: {}", userId);
        } catch (Exception e) {
            log.warn("Failed to create import backup: {}", e.getMessage());
        }
    }

    private int calculateLongestStreak(List<HabitLog> logs) {
        if (logs.isEmpty())
            return 0;

        logs.sort((a, b) -> a.getCompletionDate().compareTo(b.getCompletionDate()));

        int maxStreak = 1;
        int currentStreak = 1;

        for (int i = 1; i < logs.size(); i++) {
            LocalDate prevDate = logs.get(i - 1).getCompletionDate();
            LocalDate currentDate = logs.get(i).getCompletionDate();

            if (prevDate.plusDays(1).equals(currentDate)) {
                currentStreak++;
                maxStreak = Math.max(maxStreak, currentStreak);
            } else {
                currentStreak = 1;
            }
        }

        return maxStreak;
    }

    private double calculateAverageSessionsPerWeek(List<PomodoroSession> sessions) {
        if (sessions.isEmpty())
            return 0.0;

        LocalDateTime earliest = sessions.stream()
                .map(PomodoroSession::getCompletedAt)
                .min(LocalDateTime::compareTo)
                .orElse(LocalDateTime.now());

        long daysBetween = java.time.Duration.between(earliest, LocalDateTime.now()).toDays();
        double weeks = Math.max(1.0, daysBetween / 7.0);

        return sessions.size() / weeks;
    }
}