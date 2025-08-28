package com.habittracker.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.habittracker.model.Habit;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 🗂️ HABIT-AS-FILE ABSTRACTION SERVICE
 * 
 * This service provides the critical bridge between habits and file system
 * entities,
 * implementing the core concept of "habits as files" with full metadata
 * support.
 * 
 * Features:
 * - Maps habits to virtual file entities with proper extensions
 * - Provides file metadata (size, modification time, MIME types)
 * - Handles file associations for double-click navigation
 * - Supports different habit types as different file formats
 * - Enables file manager operations on habit entities
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class HabitFileAdapter {

    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper;

    // File extension mappings for different habit types
    private static final Map<String, String> HABIT_TYPE_EXTENSIONS = Map.of(
            "DAILY", ".habit",
            "WEEKLY", ".weekly",
            "MONTHLY", ".monthly",
            "TIMER", ".timer",
            "COUNTER", ".counter",
            "CHECKLIST", ".checklist");

    // MIME type mappings
    private static final Map<String, String> HABIT_MIME_TYPES = Map.of(
            ".habit", "application/x-habit",
            ".weekly", "application/x-habit-weekly",
            ".monthly", "application/x-habit-monthly",
            ".timer", "application/x-habit-timer",
            ".counter", "application/x-habit-counter",
            ".checklist", "application/x-habit-checklist");

    /**
     * Convert a habit to a virtual file entity
     */
    public FileEntity habitToFile(Habit habit) {
        try {
            String extension = getHabitExtension(habit);
            String fileName = sanitizeFileName(habit.getName()) + extension;

            FileEntity file = FileEntity.builder()
                    .id("file_habit_" + habit.getId())
                    .name(fileName)
                    .displayName(habit.getName())
                    .type("file")
                    .extension(extension)
                    .mimeType(HABIT_MIME_TYPES.get(extension))
                    .size(calculateHabitFileSize(habit))
                    .created(habit.getCreatedAt().atStartOfDay())
                    .modified(getHabitLastModified(habit))
                    .accessed(LocalDateTime.now())
                    .parent(habit.getFolder() != null ? "folder_" + habit.getFolder().getId() : null)
                    .habitId(habit.getId())
                    .metadata(buildHabitMetadata(habit))
                    .permissions(buildHabitPermissions(habit))
                    .build();

            log.debug("Converted habit {} to file entity: {}", habit.getId(), fileName);
            return file;

        } catch (Exception e) {
            log.error("Failed to convert habit {} to file entity", habit.getId(), e);
            return createFallbackFileEntity(habit);
        }
    }

    /**
     * Convert multiple habits to file entities
     */
    public List<FileEntity> habitsToFiles(List<Habit> habits) {
        return habits.stream()
                .map(this::habitToFile)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    /**
     * Get file extension based on habit type
     */
    private String getHabitExtension(Habit habit) {
        String habitType = habit.getHabitType() != null ? habit.getHabitType().toString() : "DAILY";
        return HABIT_TYPE_EXTENSIONS.getOrDefault(habitType, ".habit");
    }

    /**
     * Calculate virtual file size based on habit complexity
     */
    private long calculateHabitFileSize(Habit habit) {
        long baseSize = 1024; // 1KB base size

        // Add size based on content
        if (habit.getName() != null)
            baseSize += habit.getName().length() * 2;
        if (habit.getDescription() != null)
            baseSize += habit.getDescription().length() * 2;

        // Add size based on habit data
        baseSize += habit.getStreakCount() * 10; // 10 bytes per streak day
        if (habit.getTags() != null)
            baseSize += habit.getTags().size() * 50;

        // Add size based on habit type complexity
        switch (habit.getHabitType() != null ? habit.getHabitType().toString() : "DAILY") {
            case "TIMER":
                baseSize += (habit.getTimerDurationMinutes() != null ? habit.getTimerDurationMinutes() : 0) * 5;
                break;
            case "CHECKLIST":
                baseSize += 500; // Assume checklist items
                break;
            case "COUNTER":
                baseSize += 200; // Counter data
                break;
        }

        return baseSize;
    }

    /**
     * Get habit's last modification time
     */
    private LocalDateTime getHabitLastModified(Habit habit) {
        // Check for recent completions or updates
        try {
            String sql = """
                        SELECT MAX(completed_date) as last_activity
                        FROM habit_completions
                        WHERE habit_id = ?
                        UNION
                        SELECT updated_at as last_activity
                        FROM habits
                        WHERE id = ?
                        ORDER BY last_activity DESC
                        LIMIT 1
                    """;

            LocalDateTime lastActivity = jdbcTemplate.queryForObject(sql, LocalDateTime.class,
                    habit.getId(), habit.getId());

            return lastActivity != null ? lastActivity : habit.getCreatedAt().atStartOfDay();

        } catch (Exception e) {
            log.debug("Could not determine last modified time for habit {}", habit.getId());
            return habit.getCreatedAt().atStartOfDay();
        }
    }

    /**
     * Build rich metadata for the habit file
     */
    private Map<String, Object> buildHabitMetadata(Habit habit) {
        Map<String, Object> metadata = new HashMap<>();

        // Basic habit properties
        metadata.put("habitId", habit.getId());
        metadata.put("category", habit.getCategory());
        metadata.put("priority", habit.getPriority());
        metadata.put("streakCount", habit.getStreakCount());
        metadata.put("isArchived", habit.isArchived());

        // Habit type specific metadata
        if (habit.getHabitType() != null) {
            metadata.put("habitType", habit.getHabitType().toString());

            switch (habit.getHabitType().toString()) {
                case "TIMER":
                    metadata.put("timerDuration", habit.getTimerDurationMinutes());
                    metadata.put("timerPreset", habit.getTimerPreset());
                    break;
                case "COUNTER":
                    metadata.put("targetCount", getHabitTargetCount(habit.getId()));
                    metadata.put("currentCount", getHabitCurrentCount(habit.getId()));
                    break;
            }
        }

        // Tags as metadata
        if (habit.getTags() != null && !habit.getTags().isEmpty()) {
            metadata.put("tags", habit.getTags().stream().map(Object::toString).collect(Collectors.toList()));
        }

        // Statistics
        metadata.put("totalCompletions", getHabitCompletionCount(habit.getId()));
        metadata.put("lastCompleted", getHabitLastCompletion(habit.getId()));
        metadata.put("completionRate", calculateCompletionRate(habit.getId()));

        // File system metadata
        metadata.put("isSystemFile", false);
        metadata.put("isHidden", habit.isArchived());
        metadata.put("isReadOnly", false);

        return metadata;
    }

    /**
     * Build file permissions for habit
     */
    private Map<String, Boolean> buildHabitPermissions(Habit habit) {
        Map<String, Boolean> permissions = new HashMap<>();

        boolean isArchived = habit.isArchived();

        permissions.put("read", true);
        permissions.put("write", !isArchived);
        permissions.put("delete", true);
        permissions.put("execute", true); // Can double-click to open
        permissions.put("rename", !isArchived);
        permissions.put("move", true);
        permissions.put("copy", true);

        return permissions;
    }

    /**
     * Create fallback file entity if conversion fails
     */
    private FileEntity createFallbackFileEntity(Habit habit) {
        return FileEntity.builder()
                .id("file_habit_" + habit.getId())
                .name("Habit_" + habit.getId() + ".habit")
                .displayName(habit.getName() != null ? habit.getName() : "Unnamed Habit")
                .type("file")
                .extension(".habit")
                .mimeType("application/x-habit")
                .size(1024L)
                .created(habit.getCreatedAt().atStartOfDay())
                .modified(habit.getCreatedAt().atStartOfDay())
                .accessed(LocalDateTime.now())
                .habitId(habit.getId())
                .metadata(Map.of("habitId", habit.getId(), "isSystemFile", false))
                .permissions(Map.of("read", true, "write", true, "delete", true))
                .build();
    }

    /**
     * Sanitize habit name for use as filename
     */
    private String sanitizeFileName(String name) {
        if (name == null)
            return "Unnamed";

        return name.replaceAll("[^a-zA-Z0-9\\s\\-_]", "")
                .replaceAll("\\s+", "_")
                .substring(0, Math.min(name.length(), 100));
    }

    /**
     * Get habit completion count
     */
    private int getHabitCompletionCount(Long habitId) {
        try {
            String sql = "SELECT COUNT(*) FROM habit_completions WHERE habit_id = ?";
            Integer count = jdbcTemplate.queryForObject(sql, Integer.class, habitId);
            return count != null ? count : 0;
        } catch (Exception e) {
            return 0;
        }
    }

    /**
     * Get habit's last completion date
     */
    private String getHabitLastCompletion(Long habitId) {
        try {
            String sql = "SELECT MAX(completed_date) FROM habit_completions WHERE habit_id = ?";
            LocalDateTime lastCompletion = jdbcTemplate.queryForObject(sql, LocalDateTime.class, habitId);
            return lastCompletion != null ? lastCompletion.format(DateTimeFormatter.ISO_LOCAL_DATE) : "Never";
        } catch (Exception e) {
            return "Never";
        }
    }

    /**
     * Calculate completion rate percentage
     */
    private double calculateCompletionRate(Long habitId) {
        try {
            String sql = """
                        SELECT
                            COUNT(CASE WHEN hc.completed_date IS NOT NULL THEN 1 END) * 100.0 /
                            GREATEST(DATEDIFF(CURRENT_DATE, h.created_at), 1) as completion_rate
                        FROM habits h
                        LEFT JOIN habit_completions hc ON h.id = hc.habit_id
                        WHERE h.id = ?
                    """;

            Double rate = jdbcTemplate.queryForObject(sql, Double.class, habitId);
            return rate != null ? rate : 0.0;
        } catch (Exception e) {
            return 0.0;
        }
    }

    /**
     * Get target count for counter habits
     */
    private int getHabitTargetCount(Long habitId) {
        // This would be implemented based on your counter habit logic
        return 10; // Placeholder
    }

    /**
     * Get current count for counter habits
     */
    private int getHabitCurrentCount(Long habitId) {
        // This would be implemented based on your counter habit logic
        return 0; // Placeholder
    }

    /**
     * Check if a file entity represents a habit
     */
    public boolean isHabitFile(String fileId) {
        return fileId != null && fileId.startsWith("file_habit_");
    }

    /**
     * Extract habit ID from file entity ID
     */
    public Long extractHabitId(String fileId) {
        if (!isHabitFile(fileId))
            return null;

        try {
            return Long.parseLong(fileId.replace("file_habit_", ""));
        } catch (NumberFormatException e) {
            log.error("Failed to extract habit ID from file ID: {}", fileId);
            return null;
        }
    }

    /**
     * Get the appropriate icon for a habit file based on its type
     */
    public String getHabitFileIcon(FileEntity file) {
        if (file.getExtension() == null)
            return "📄";

        switch (file.getExtension()) {
            case ".timer":
                return "⏱️";
            case ".counter":
                return "🔢";
            case ".checklist":
                return "☑️";
            case ".weekly":
                return "📅";
            case ".monthly":
                return "📆";
            default:
                return "✅";
        }
    }

    /**
     * File Entity class representing a habit as a file
     */
    public static class FileEntity {
        private String id;
        private String name;
        private String displayName;
        private String type;
        private String extension;
        private String mimeType;
        private Long size;
        private LocalDateTime created;
        private LocalDateTime modified;
        private LocalDateTime accessed;
        private String parent;
        private Long habitId;
        private Map<String, Object> metadata;
        private Map<String, Boolean> permissions;

        // Builder pattern implementation
        public static FileEntityBuilder builder() {
            return new FileEntityBuilder();
        }

        public static class FileEntityBuilder {
            private String id;
            private String name;
            private String displayName;
            private String type;
            private String extension;
            private String mimeType;
            private Long size;
            private LocalDateTime created;
            private LocalDateTime modified;
            private LocalDateTime accessed;
            private String parent;
            private Long habitId;
            private Map<String, Object> metadata;
            private Map<String, Boolean> permissions;

            public FileEntityBuilder id(String id) {
                this.id = id;
                return this;
            }

            public FileEntityBuilder name(String name) {
                this.name = name;
                return this;
            }

            public FileEntityBuilder displayName(String displayName) {
                this.displayName = displayName;
                return this;
            }

            public FileEntityBuilder type(String type) {
                this.type = type;
                return this;
            }

            public FileEntityBuilder extension(String extension) {
                this.extension = extension;
                return this;
            }

            public FileEntityBuilder mimeType(String mimeType) {
                this.mimeType = mimeType;
                return this;
            }

            public FileEntityBuilder size(Long size) {
                this.size = size;
                return this;
            }

            public FileEntityBuilder created(LocalDateTime created) {
                this.created = created;
                return this;
            }

            public FileEntityBuilder modified(LocalDateTime modified) {
                this.modified = modified;
                return this;
            }

            public FileEntityBuilder accessed(LocalDateTime accessed) {
                this.accessed = accessed;
                return this;
            }

            public FileEntityBuilder parent(String parent) {
                this.parent = parent;
                return this;
            }

            public FileEntityBuilder habitId(Long habitId) {
                this.habitId = habitId;
                return this;
            }

            public FileEntityBuilder metadata(Map<String, Object> metadata) {
                this.metadata = metadata;
                return this;
            }

            public FileEntityBuilder permissions(Map<String, Boolean> permissions) {
                this.permissions = permissions;
                return this;
            }

            public FileEntity build() {
                FileEntity entity = new FileEntity();
                entity.id = this.id;
                entity.name = this.name;
                entity.displayName = this.displayName;
                entity.type = this.type;
                entity.extension = this.extension;
                entity.mimeType = this.mimeType;
                entity.size = this.size;
                entity.created = this.created;
                entity.modified = this.modified;
                entity.accessed = this.accessed;
                entity.parent = this.parent;
                entity.habitId = this.habitId;
                entity.metadata = this.metadata;
                entity.permissions = this.permissions;
                return entity;
            }
        }

        // Getters and setters
        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getDisplayName() {
            return displayName;
        }

        public void setDisplayName(String displayName) {
            this.displayName = displayName;
        }

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }

        public String getExtension() {
            return extension;
        }

        public void setExtension(String extension) {
            this.extension = extension;
        }

        public String getMimeType() {
            return mimeType;
        }

        public void setMimeType(String mimeType) {
            this.mimeType = mimeType;
        }

        public Long getSize() {
            return size;
        }

        public void setSize(Long size) {
            this.size = size;
        }

        public LocalDateTime getCreated() {
            return created;
        }

        public void setCreated(LocalDateTime created) {
            this.created = created;
        }

        public LocalDateTime getModified() {
            return modified;
        }

        public void setModified(LocalDateTime modified) {
            this.modified = modified;
        }

        public LocalDateTime getAccessed() {
            return accessed;
        }

        public void setAccessed(LocalDateTime accessed) {
            this.accessed = accessed;
        }

        public String getParent() {
            return parent;
        }

        public void setParent(String parent) {
            this.parent = parent;
        }

        public Long getHabitId() {
            return habitId;
        }

        public void setHabitId(Long habitId) {
            this.habitId = habitId;
        }

        public Map<String, Object> getMetadata() {
            return metadata;
        }

        public void setMetadata(Map<String, Object> metadata) {
            this.metadata = metadata;
        }

        public Map<String, Boolean> getPermissions() {
            return permissions;
        }

        public void setPermissions(Map<String, Boolean> permissions) {
            this.permissions = permissions;
        }
    }
}
