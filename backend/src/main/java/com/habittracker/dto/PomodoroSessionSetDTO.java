package com.habittracker.dto;

import com.habittracker.model.PomodoroSessionSet;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for PomodoroSessionSet entity
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PomodoroSessionSetDTO {

    private Long id;
    private Long habitId;
    private Integer plannedSessions;
    private Integer completedSessions;
    private Integer workMinutes;
    private Integer shortBreakMinutes;
    private Integer longBreakMinutes;
    private Integer sessionsBeforeLongBreak;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Boolean isCompleted;
    private Boolean isActive;
    private Integer currentSession;
    private PomodoroSessionSet.Phase currentPhase;
    private Boolean autoAdvance;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Additional computed fields for the frontend
    private Boolean needsLongBreak;
    private Boolean shouldComplete;
    private Integer remainingSessions;
    private Long totalDurationMinutes;
    private Float progressPercentage;

    /**
     * Create DTO from entity with computed fields
     */
    public static PomodoroSessionSetDTO fromEntity(PomodoroSessionSet entity) {
        PomodoroSessionSetDTO dto = PomodoroSessionSetDTO.builder()
                .id(entity.getId())
                .habitId(entity.getHabitId())
                .plannedSessions(entity.getPlannedSessions())
                .completedSessions(entity.getCompletedSessions())
                .workMinutes(entity.getWorkMinutes())
                .shortBreakMinutes(entity.getShortBreakMinutes())
                .longBreakMinutes(entity.getLongBreakMinutes())
                .sessionsBeforeLongBreak(entity.getSessionsBeforeLongBreak())
                .startTime(entity.getStartTime())
                .endTime(entity.getEndTime())
                .isCompleted(entity.getIsCompleted())
                .isActive(entity.getIsActive())
                .currentSession(entity.getCurrentSession())
                .currentPhase(entity.getCurrentPhase())
                .autoAdvance(entity.getAutoAdvance())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();

        // Compute additional fields
        dto.setNeedsLongBreak(entity.needsLongBreak());
        dto.setShouldComplete(entity.shouldComplete());
        dto.setRemainingSessions(entity.getPlannedSessions() - entity.getCompletedSessions());
        
        // Calculate total estimated duration
        long totalWorkMinutes = entity.getPlannedSessions() * entity.getWorkMinutes();
        long totalShortBreaks = Math.max(0, entity.getPlannedSessions() - 1); // Short breaks between sessions
        long totalLongBreaks = Math.max(0, (entity.getPlannedSessions() - 1) / entity.getSessionsBeforeLongBreak()); // Long breaks
        long totalBreakMinutes = (totalShortBreaks * entity.getShortBreakMinutes()) + 
                               (totalLongBreaks * entity.getLongBreakMinutes());
        dto.setTotalDurationMinutes(totalWorkMinutes + totalBreakMinutes);

        // Calculate progress percentage
        if (entity.getPlannedSessions() > 0) {
            float progress = ((float) entity.getCompletedSessions() / entity.getPlannedSessions()) * 100;
            dto.setProgressPercentage(Math.round(progress * 10) / 10.0f); // Round to 1 decimal place
        } else {
            dto.setProgressPercentage(0.0f);
        }

        return dto;
    }
}