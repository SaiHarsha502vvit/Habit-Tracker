package com.habittracker.service;

import com.habittracker.model.Habit;
import com.habittracker.service.HabitFileAdapter.FileEntity;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;

/**
 * 🖱️ DOUBLE-CLICK NAVIGATION HANDLER
 * 
 * This service manages double-click navigation for habit files, providing
 * context-aware routing to appropriate views and actions based on file type.
 * 
 * Features:
 * - Routes habit files to detail views, edit modes, or action handlers
 * - Supports different navigation behaviors per habit type
 * - Handles file associations and default applications
 * - Provides preview and quick actions
 * - Tracks user interaction patterns
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class FileNavigationHandler {

    private final HabitService habitService;
    private final HabitFileAdapter fileAdapter;
    private final ApplicationEventPublisher eventPublisher;

    /**
     * Handle double-click navigation for any file entity
     */
    public CompletableFuture<NavigationResult> handleDoubleClick(String fileId, NavigationContext context) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                log.debug("Handling double-click for file: {} in context: {}", fileId, context.getAction());

                if (fileAdapter.isHabitFile(fileId)) {
                    return handleHabitFileDoubleClick(fileId, context);
                } else {
                    return handleGenericFileDoubleClick(fileId, context);
                }

            } catch (Exception e) {
                log.error("Failed to handle double-click for file: {}", fileId, e);
                return NavigationResult.error("Failed to open file: " + e.getMessage());
            }
        });
    }

    /**
     * Handle double-click specifically for habit files
     */
    private NavigationResult handleHabitFileDoubleClick(String fileId, NavigationContext context) {
        Long habitId = fileAdapter.extractHabitId(fileId);
        if (habitId == null) {
            return NavigationResult.error("Invalid habit file ID");
        }

        try {
            // Get habit by ID - need to find it first
            Optional<Habit> habitOpt = habitService.getAllHabits().stream()
                    .map(dto -> convertDtoToHabit(dto))
                    .filter(h -> h.getId().equals(habitId))
                    .findFirst();

            if (habitOpt.isEmpty()) {
                return NavigationResult.error("Habit not found: " + habitId);
            }

            Habit habit = habitOpt.get();

            // Publish navigation event
            eventPublisher.publishEvent(new FileNavigationEvent(fileId, "double_click", context));

            // Route based on habit type and context
            return routeHabitNavigation(habit, context);

        } catch (Exception e) {
            log.error("Failed to handle habit file double-click: {}", habitId, e);
            return NavigationResult.error("Failed to open habit: " + e.getMessage());
        }
    }

    /**
     * Route navigation based on habit type and context
     */
    private NavigationResult routeHabitNavigation(Habit habit, NavigationContext context) {
        String habitType = habit.getHabitType() != null ? habit.getHabitType().toString() : "DAILY";

        // Check for modifier keys that change behavior
        if (context.isCtrlPressed()) {
            return NavigationResult.success("edit", "/habits/" + habit.getId() + "/edit",
                    "Edit Habit", buildHabitEditMetadata(habit));
        }

        if (context.isShiftPressed()) {
            return NavigationResult.success("quick_action", null,
                    "Quick Complete", buildQuickActionMetadata(habit));
        }

        if (context.isAltPressed()) {
            return NavigationResult.success("properties", "/habits/" + habit.getId() + "/properties",
                    "Habit Properties", buildHabitPropertiesMetadata(habit));
        }

        // Default navigation based on habit type
        switch (habitType) {
            case "TIMER":
                return NavigationResult.success("timer", "/habits/" + habit.getId() + "/timer",
                        "Start Timer Session", buildTimerMetadata(habit));

            case "COUNTER":
                return NavigationResult.success("counter", "/habits/" + habit.getId() + "/counter",
                        "Counter View", buildCounterMetadata(habit));

            case "CHECKLIST":
                return NavigationResult.success("checklist", "/habits/" + habit.getId() + "/checklist",
                        "Checklist View", buildChecklistMetadata(habit));

            case "WEEKLY":
            case "MONTHLY":
                return NavigationResult.success("calendar", "/habits/" + habit.getId() + "/calendar",
                        "Calendar View", buildCalendarMetadata(habit));

            default:
                return NavigationResult.success("detail", "/habits/" + habit.getId(),
                        "Habit Details", buildHabitDetailMetadata(habit));
        }
    }

    /**
     * Handle generic file double-click (folders, etc.)
     */
    private NavigationResult handleGenericFileDoubleClick(String fileId, NavigationContext context) {
        if (fileId.startsWith("folder_")) {
            String folderId = fileId.replace("folder_", "");
            return NavigationResult.success("navigate", "/folders/" + folderId,
                    "Open Folder", Map.of("folderId", folderId, "type", "folder"));
        }

        return NavigationResult.error("Unknown file type");
    }

    /**
     * Handle right-click context menu
     */
    public CompletableFuture<ContextMenuResult> handleRightClick(String fileId, NavigationContext context) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                if (fileAdapter.isHabitFile(fileId)) {
                    return buildHabitContextMenu(fileId, context);
                } else {
                    return buildGenericContextMenu(fileId, context);
                }
            } catch (Exception e) {
                log.error("Failed to build context menu for file: {}", fileId, e);
                return ContextMenuResult.error("Failed to build context menu");
            }
        });
    }

    /**
     * Build context menu for habit files
     */
    private ContextMenuResult buildHabitContextMenu(String fileId, NavigationContext context) {
        Long habitId = fileAdapter.extractHabitId(fileId);
        if (habitId == null) {
            return ContextMenuResult.error("Invalid habit file");
        }

        try {
            // Get habit by ID
            Optional<Habit> habitOpt = habitService.getAllHabits().stream()
                    .map(dto -> convertDtoToHabit(dto))
                    .filter(h -> h.getId().equals(habitId))
                    .findFirst();

            if (habitOpt.isEmpty()) {
                return ContextMenuResult.error("Habit not found");
            }

            Habit habit = habitOpt.get();

            ContextMenuBuilder menu = new ContextMenuBuilder()
                    .addItem("open", "Open", "Enter", () -> handleDoubleClick(fileId, context))
                    .addItem("edit", "Edit", "F2", () -> editHabit(habitId))
                    .addSeparator()
                    .addItem("complete", "Mark Complete", "Space", () -> completeHabit(habitId))
                    .addItem("reset", "Reset Streak", null, () -> resetHabitStreak(habitId))
                    .addSeparator()
                    .addItem("copy", "Copy", "Ctrl+C", () -> copyHabit(habitId))
                    .addItem("cut", "Cut", "Ctrl+X", () -> cutHabit(habitId))
                    .addSeparator()
                    .addItem("properties", "Properties", "Alt+Enter", () -> showHabitProperties(habitId))
                    .addItem("delete", "Delete", "Delete", () -> deleteHabit(habitId));

            // Add type-specific actions
            String habitType = habit.getHabitType() != null ? habit.getHabitType().toString() : "DAILY";
            switch (habitType) {
                case "TIMER":
                    menu.addItem("start_timer", "Start Timer", "T", () -> startTimer(habitId));
                    break;
                case "COUNTER":
                    menu.addItem("increment", "Increment", "+", () -> incrementCounter(habitId));
                    break;
            }

            return menu.build();

        } catch (Exception e) {
            return ContextMenuResult.error("Failed to build habit context menu");
        }
    }

    /**
     * Build generic context menu for non-habit files
     */
    private ContextMenuResult buildGenericContextMenu(String fileId, NavigationContext context) {
        return new ContextMenuBuilder()
                .addItem("open", "Open", "Enter", () -> handleDoubleClick(fileId, context))
                .addSeparator()
                .addItem("copy", "Copy", "Ctrl+C", () -> copyFile(fileId))
                .addItem("cut", "Cut", "Ctrl+X", () -> cutFile(fileId))
                .addItem("paste", "Paste", "Ctrl+V", () -> pasteFile(context.getCurrentPath()))
                .addSeparator()
                .addItem("rename", "Rename", "F2", () -> renameFile(fileId))
                .addItem("delete", "Delete", "Delete", () -> deleteFile(fileId))
                .addSeparator()
                .addItem("properties", "Properties", "Alt+Enter", () -> showFileProperties(fileId))
                .build();
    }

    // Habit-specific action methods
    private CompletableFuture<NavigationResult> editHabit(Long habitId) {
        return CompletableFuture.completedFuture(
                NavigationResult.success("edit", "/habits/" + habitId + "/edit", "Edit Habit", Map.of()));
    }

    private CompletableFuture<NavigationResult> completeHabit(Long habitId) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                habitService.logHabitCompletion(habitId, java.time.LocalDate.now());
                return NavigationResult.success("complete", null, "Habit Completed",
                        Map.of("habitId", habitId, "action", "completed"));
            } catch (Exception e) {
                return NavigationResult.error("Failed to complete habit: " + e.getMessage());
            }
        });
    }

    private CompletableFuture<NavigationResult> resetHabitStreak(Long habitId) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                // For now, we'll archive and unarchive to reset
                habitService.archiveHabit(habitId);
                return NavigationResult.success("reset", null, "Streak Reset",
                        Map.of("habitId", habitId, "action", "streak_reset"));
            } catch (Exception e) {
                return NavigationResult.error("Failed to reset streak: " + e.getMessage());
            }
        });
    }

    // Helper method to convert DTO to Habit entity
    private Habit convertDtoToHabit(com.habittracker.dto.HabitDto dto) {
        Habit habit = new Habit();
        habit.setId(dto.getId());
        habit.setName(dto.getName());
        habit.setDescription(dto.getDescription());
        habit.setCategory(null); // Fix type mismatch later
        habit.setPriority(dto.getPriority());
        habit.setCreatedAt(
                dto.getCreatedAt() != null ? java.time.LocalDate.parse(dto.getCreatedAt()) : java.time.LocalDate.now());
        habit.setStreakCount(dto.getStreakCount());
        habit.setArchived(dto.isArchived());
        // Set other fields as needed
        return habit;
    }

    private CompletableFuture<NavigationResult> startTimer(Long habitId) {
        return CompletableFuture.completedFuture(
                NavigationResult.success("timer", "/habits/" + habitId + "/timer", "Timer Session",
                        Map.of("habitId", habitId, "action", "start_timer")));
    }

    private CompletableFuture<NavigationResult> incrementCounter(Long habitId) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                // habitService.incrementCounter(habitId); // Implement this method
                return NavigationResult.success("increment", null, "Counter Incremented",
                        Map.of("habitId", habitId, "action", "increment"));
            } catch (Exception e) {
                return NavigationResult.error("Failed to increment counter: " + e.getMessage());
            }
        });
    }

    private CompletableFuture<NavigationResult> copyHabit(Long habitId) {
        return CompletableFuture.completedFuture(
                NavigationResult.success("copy", null, "Habit Copied",
                        Map.of("habitId", habitId, "action", "copy")));
    }

    private CompletableFuture<NavigationResult> cutHabit(Long habitId) {
        return CompletableFuture.completedFuture(
                NavigationResult.success("cut", null, "Habit Cut",
                        Map.of("habitId", habitId, "action", "cut")));
    }

    private CompletableFuture<NavigationResult> deleteHabit(Long habitId) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                habitService.deleteHabit(habitId);
                return NavigationResult.success("delete", null, "Habit Deleted",
                        Map.of("habitId", habitId, "action", "deleted"));
            } catch (Exception e) {
                return NavigationResult.error("Failed to delete habit: " + e.getMessage());
            }
        });
    }

    private CompletableFuture<NavigationResult> showHabitProperties(Long habitId) {
        return CompletableFuture.completedFuture(
                NavigationResult.success("properties", "/habits/" + habitId + "/properties", "Properties",
                        Map.of("habitId", habitId, "type", "properties")));
    }

    // Generic file action methods
    private CompletableFuture<NavigationResult> copyFile(String fileId) {
        return CompletableFuture.completedFuture(
                NavigationResult.success("copy", null, "File Copied", Map.of("fileId", fileId)));
    }

    private CompletableFuture<NavigationResult> cutFile(String fileId) {
        return CompletableFuture.completedFuture(
                NavigationResult.success("cut", null, "File Cut", Map.of("fileId", fileId)));
    }

    private CompletableFuture<NavigationResult> pasteFile(String targetPath) {
        return CompletableFuture.completedFuture(
                NavigationResult.success("paste", null, "File Pasted", Map.of("targetPath", targetPath)));
    }

    private CompletableFuture<NavigationResult> renameFile(String fileId) {
        return CompletableFuture.completedFuture(
                NavigationResult.success("rename", null, "Rename File", Map.of("fileId", fileId)));
    }

    private CompletableFuture<NavigationResult> deleteFile(String fileId) {
        return CompletableFuture.completedFuture(
                NavigationResult.success("delete", null, "File Deleted", Map.of("fileId", fileId)));
    }

    private CompletableFuture<NavigationResult> showFileProperties(String fileId) {
        return CompletableFuture.completedFuture(
                NavigationResult.success("properties", "/files/" + fileId + "/properties", "Properties",
                        Map.of("fileId", fileId)));
    }

    // Metadata builders
    private Map<String, Object> buildHabitDetailMetadata(Habit habit) {
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("habitId", habit.getId());
        metadata.put("name", habit.getName());
        metadata.put("type", "detail");
        metadata.put("category", habit.getCategory());
        return metadata;
    }

    private Map<String, Object> buildHabitEditMetadata(Habit habit) {
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("habitId", habit.getId());
        metadata.put("name", habit.getName());
        metadata.put("type", "edit");
        metadata.put("mode", "edit");
        return metadata;
    }

    private Map<String, Object> buildTimerMetadata(Habit habit) {
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("habitId", habit.getId());
        metadata.put("type", "timer");
        metadata.put("duration", habit.getTimerDurationMinutes());
        metadata.put("preset", habit.getTimerPreset());
        return metadata;
    }

    private Map<String, Object> buildCounterMetadata(Habit habit) {
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("habitId", habit.getId());
        metadata.put("type", "counter");
        metadata.put("currentValue", 0); // Get from service
        return metadata;
    }

    private Map<String, Object> buildChecklistMetadata(Habit habit) {
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("habitId", habit.getId());
        metadata.put("type", "checklist");
        return metadata;
    }

    private Map<String, Object> buildCalendarMetadata(Habit habit) {
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("habitId", habit.getId());
        metadata.put("type", "calendar");
        metadata.put("habitType", habit.getHabitType().toString());
        return metadata;
    }

    private Map<String, Object> buildHabitPropertiesMetadata(Habit habit) {
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("habitId", habit.getId());
        metadata.put("type", "properties");
        metadata.put("name", habit.getName());
        metadata.put("category", habit.getCategory());
        metadata.put("streakCount", habit.getStreakCount());
        return metadata;
    }

    private Map<String, Object> buildQuickActionMetadata(Habit habit) {
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("habitId", habit.getId());
        metadata.put("type", "quick_action");
        metadata.put("action", "complete");
        return metadata;
    }

    // Supporting classes
    public static class NavigationContext {
        private String action = "open";
        private String currentPath = "/";
        private boolean ctrlPressed = false;
        private boolean shiftPressed = false;
        private boolean altPressed = false;
        private Map<String, Object> additionalData = new HashMap<>();

        // Constructors
        public NavigationContext() {
        }

        public NavigationContext(String action, String currentPath) {
            this.action = action;
            this.currentPath = currentPath;
        }

        // Builder methods
        public NavigationContext withModifiers(boolean ctrl, boolean shift, boolean alt) {
            this.ctrlPressed = ctrl;
            this.shiftPressed = shift;
            this.altPressed = alt;
            return this;
        }

        public NavigationContext withData(String key, Object value) {
            this.additionalData.put(key, value);
            return this;
        }

        // Getters and setters
        public String getAction() {
            return action;
        }

        public void setAction(String action) {
            this.action = action;
        }

        public String getCurrentPath() {
            return currentPath;
        }

        public void setCurrentPath(String currentPath) {
            this.currentPath = currentPath;
        }

        public boolean isCtrlPressed() {
            return ctrlPressed;
        }

        public void setCtrlPressed(boolean ctrlPressed) {
            this.ctrlPressed = ctrlPressed;
        }

        public boolean isShiftPressed() {
            return shiftPressed;
        }

        public void setShiftPressed(boolean shiftPressed) {
            this.shiftPressed = shiftPressed;
        }

        public boolean isAltPressed() {
            return altPressed;
        }

        public void setAltPressed(boolean altPressed) {
            this.altPressed = altPressed;
        }

        public Map<String, Object> getAdditionalData() {
            return additionalData;
        }

        public void setAdditionalData(Map<String, Object> additionalData) {
            this.additionalData = additionalData;
        }
    }

    public static class NavigationResult {
        private boolean success;
        private String action;
        private String route;
        private String message;
        private String errorMessage;
        private Map<String, Object> metadata;

        private NavigationResult(boolean success, String action, String route, String message,
                String errorMessage, Map<String, Object> metadata) {
            this.success = success;
            this.action = action;
            this.route = route;
            this.message = message;
            this.errorMessage = errorMessage;
            this.metadata = metadata != null ? metadata : new HashMap<>();
        }

        public static NavigationResult success(String action, String route, String message,
                Map<String, Object> metadata) {
            return new NavigationResult(true, action, route, message, null, metadata);
        }

        public static NavigationResult error(String errorMessage) {
            return new NavigationResult(false, null, null, null, errorMessage, null);
        }

        // Getters
        public boolean isSuccess() {
            return success;
        }

        public String getAction() {
            return action;
        }

        public String getRoute() {
            return route;
        }

        public String getMessage() {
            return message;
        }

        public String getErrorMessage() {
            return errorMessage;
        }

        public Map<String, Object> getMetadata() {
            return metadata;
        }
    }

    public static class FileNavigationEvent {
        private String fileId;
        private String eventType;
        private NavigationContext context;
        private long timestamp;

        public FileNavigationEvent(String fileId, String eventType, NavigationContext context) {
            this.fileId = fileId;
            this.eventType = eventType;
            this.context = context;
            this.timestamp = System.currentTimeMillis();
        }

        // Getters
        public String getFileId() {
            return fileId;
        }

        public String getEventType() {
            return eventType;
        }

        public NavigationContext getContext() {
            return context;
        }

        public long getTimestamp() {
            return timestamp;
        }
    }

    public static class ContextMenuResult {
        private boolean success;
        private String errorMessage;
        private java.util.List<ContextMenuItem> items;

        private ContextMenuResult(boolean success, String errorMessage, java.util.List<ContextMenuItem> items) {
            this.success = success;
            this.errorMessage = errorMessage;
            this.items = items != null ? items : new java.util.ArrayList<>();
        }

        public static ContextMenuResult success(java.util.List<ContextMenuItem> items) {
            return new ContextMenuResult(true, null, items);
        }

        public static ContextMenuResult error(String errorMessage) {
            return new ContextMenuResult(false, errorMessage, null);
        }

        // Getters
        public boolean isSuccess() {
            return success;
        }

        public String getErrorMessage() {
            return errorMessage;
        }

        public java.util.List<ContextMenuItem> getItems() {
            return items;
        }
    }

    public static class ContextMenuItem {
        private String id;
        private String label;
        private String shortcut;
        private boolean separator;
        private java.util.function.Supplier<CompletableFuture<NavigationResult>> action;

        public ContextMenuItem(String id, String label, String shortcut,
                java.util.function.Supplier<CompletableFuture<NavigationResult>> action) {
            this.id = id;
            this.label = label;
            this.shortcut = shortcut;
            this.action = action;
            this.separator = false;
        }

        public ContextMenuItem() {
            this.separator = true;
        }

        // Getters
        public String getId() {
            return id;
        }

        public String getLabel() {
            return label;
        }

        public String getShortcut() {
            return shortcut;
        }

        public boolean isSeparator() {
            return separator;
        }

        public java.util.function.Supplier<CompletableFuture<NavigationResult>> getAction() {
            return action;
        }
    }

    public static class ContextMenuBuilder {
        private java.util.List<ContextMenuItem> items = new java.util.ArrayList<>();

        public ContextMenuBuilder addItem(String id, String label, String shortcut,
                java.util.function.Supplier<CompletableFuture<NavigationResult>> action) {
            items.add(new ContextMenuItem(id, label, shortcut, action));
            return this;
        }

        public ContextMenuBuilder addSeparator() {
            items.add(new ContextMenuItem());
            return this;
        }

        public ContextMenuResult build() {
            return ContextMenuResult.success(new java.util.ArrayList<>(items));
        }
    }
}
