package com.habittracker.service;

import com.habittracker.dto.PomodoroSessionSetDTO;
import com.habittracker.model.PomodoroSessionSet;
import com.habittracker.repository.PomodoroSessionSetRepository;
import com.habittracker.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service for managing Pomodoro session sets (complete cycles)
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PomodoroSessionSetService {

    private final PomodoroSessionSetRepository sessionSetRepository;

    /**
     * Create a new Pomodoro session set
     */
    @Transactional
    public PomodoroSessionSetDTO createSessionSet(PomodoroSessionSetDTO sessionSetDTO) {
        log.info("Creating new Pomodoro session set for habit: {}", sessionSetDTO.getHabitId());

        // Check if there's already an active session set for this habit
        Optional<PomodoroSessionSet> existingActive = 
            sessionSetRepository.findByHabitIdAndIsActiveTrue(sessionSetDTO.getHabitId());
        
        if (existingActive.isPresent()) {
            log.warn("Deactivating existing active session set: {}", existingActive.get().getId());
            PomodoroSessionSet existing = existingActive.get();
            existing.setIsActive(false);
            existing.setUpdatedAt(LocalDateTime.now());
            sessionSetRepository.save(existing);
        }

        PomodoroSessionSet sessionSet = PomodoroSessionSet.builder()
                .habitId(sessionSetDTO.getHabitId())
                .plannedSessions(sessionSetDTO.getPlannedSessions())
                .workMinutes(sessionSetDTO.getWorkMinutes())
                .shortBreakMinutes(sessionSetDTO.getShortBreakMinutes())
                .longBreakMinutes(sessionSetDTO.getLongBreakMinutes())
                .sessionsBeforeLongBreak(sessionSetDTO.getSessionsBeforeLongBreak() != null ? 
                    sessionSetDTO.getSessionsBeforeLongBreak() : 4)
                .autoAdvance(sessionSetDTO.getAutoAdvance() != null ? 
                    sessionSetDTO.getAutoAdvance() : true)
                .startTime(LocalDateTime.now())
                .build();

        PomodoroSessionSet saved = sessionSetRepository.save(sessionSet);
        log.info("Created Pomodoro session set: {}", saved.getId());

        return PomodoroSessionSetDTO.fromEntity(saved);
    }

    /**
     * Get active session set for a habit
     */
    public Optional<PomodoroSessionSetDTO> getActiveSessionSet(Long habitId) {
        log.debug("Finding active session set for habit: {}", habitId);
        
        return sessionSetRepository.findByHabitIdAndIsActiveTrue(habitId)
                .map(PomodoroSessionSetDTO::fromEntity);
    }

    /**
     * Update session set (advance to next phase, update progress, etc.)
     */
    @Transactional
    public PomodoroSessionSetDTO updateSessionSet(Long sessionSetId, PomodoroSessionSetDTO updates) {
        log.info("Updating session set: {}", sessionSetId);

        PomodoroSessionSet sessionSet = sessionSetRepository.findById(sessionSetId)
                .orElseThrow(() -> new ResourceNotFoundException("Session set not found: " + sessionSetId));

        // Update fields that can be modified
        if (updates.getCurrentPhase() != null) {
            sessionSet.setCurrentPhase(updates.getCurrentPhase());
        }
        if (updates.getCompletedSessions() != null) {
            sessionSet.setCompletedSessions(updates.getCompletedSessions());
        }
        if (updates.getCurrentSession() != null) {
            sessionSet.setCurrentSession(updates.getCurrentSession());
        }
        if (updates.getIsCompleted() != null) {
            sessionSet.setIsCompleted(updates.getIsCompleted());
        }
        if (updates.getIsActive() != null) {
            sessionSet.setIsActive(updates.getIsActive());
        }

        sessionSet.setUpdatedAt(LocalDateTime.now());

        // Handle completion
        if (sessionSet.shouldComplete() && !sessionSet.getIsCompleted()) {
            sessionSet.setIsCompleted(true);
            sessionSet.setIsActive(false);
            sessionSet.setEndTime(LocalDateTime.now());
            sessionSet.setCurrentPhase(PomodoroSessionSet.Phase.COMPLETED);
            log.info("Session set completed: {}", sessionSetId);
        }

        PomodoroSessionSet saved = sessionSetRepository.save(sessionSet);
        return PomodoroSessionSetDTO.fromEntity(saved);
    }

    /**
     * Advance session set to next phase
     */
    @Transactional
    public PomodoroSessionSetDTO advanceToNextPhase(Long sessionSetId) {
        log.info("Advancing session set to next phase: {}", sessionSetId);

        PomodoroSessionSet sessionSet = sessionSetRepository.findById(sessionSetId)
                .orElseThrow(() -> new ResourceNotFoundException("Session set not found: " + sessionSetId));

        if (!sessionSet.getIsActive()) {
            throw new IllegalStateException("Cannot advance inactive session set: " + sessionSetId);
        }

        sessionSet.advanceToNextSession();
        PomodoroSessionSet saved = sessionSetRepository.save(sessionSet);
        
        log.info("Advanced session set {} to phase: {} (session {}/{})", 
                sessionSetId, saved.getCurrentPhase(), saved.getCurrentSession(), saved.getPlannedSessions());

        return PomodoroSessionSetDTO.fromEntity(saved);
    }

    /**
     * Get session set by ID
     */
    public PomodoroSessionSetDTO getSessionSetById(Long sessionSetId) {
        log.debug("Finding session set: {}", sessionSetId);

        PomodoroSessionSet sessionSet = sessionSetRepository.findById(sessionSetId)
                .orElseThrow(() -> new ResourceNotFoundException("Session set not found: " + sessionSetId));

        return PomodoroSessionSetDTO.fromEntity(sessionSet);
    }

    /**
     * Get all session sets for a habit
     */
    public List<PomodoroSessionSetDTO> getSessionSetsForHabit(Long habitId) {
        log.debug("Finding session sets for habit: {}", habitId);

        return sessionSetRepository.findByHabitIdOrderByStartTimeDesc(habitId)
                .stream()
                .map(PomodoroSessionSetDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get completed session sets for a habit
     */
    public List<PomodoroSessionSetDTO> getCompletedSessionSets(Long habitId) {
        log.debug("Finding completed session sets for habit: {}", habitId);

        return sessionSetRepository.findByHabitIdAndIsCompletedTrueOrderByStartTimeDesc(habitId)
                .stream()
                .map(PomodoroSessionSetDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Cancel/deactivate current session set
     */
    @Transactional
    public PomodoroSessionSetDTO cancelSessionSet(Long sessionSetId) {
        log.info("Cancelling session set: {}", sessionSetId);

        PomodoroSessionSet sessionSet = sessionSetRepository.findById(sessionSetId)
                .orElseThrow(() -> new ResourceNotFoundException("Session set not found: " + sessionSetId));

        sessionSet.setIsActive(false);
        sessionSet.setUpdatedAt(LocalDateTime.now());
        // Don't mark as completed since it was cancelled

        PomodoroSessionSet saved = sessionSetRepository.save(sessionSet);
        return PomodoroSessionSetDTO.fromEntity(saved);
    }

    /**
     * Get statistics for session sets of a habit
     */
    public SessionSetStatistics getSessionSetStatistics(Long habitId) {
        log.debug("Getting session set statistics for habit: {}", habitId);

        Object[] stats = sessionSetRepository.getStatisticsForHabit(habitId);
        long totalCompletedSets = sessionSetRepository.countByHabitIdAndIsCompletedTrue(habitId);

        // stats[0] = count, stats[1] = avg completed sessions, stats[2] = total planned, stats[3] = total completed
        return SessionSetStatistics.builder()
                .totalSessionSets(totalCompletedSets)
                .averageSessionsPerSet(stats.length > 1 && stats[1] != null ? ((Double) stats[1]).floatValue() : 0.0f)
                .totalPlannedSessions(stats.length > 2 && stats[2] != null ? ((Long) stats[2]).intValue() : 0)
                .totalCompletedSessions(stats.length > 3 && stats[3] != null ? ((Long) stats[3]).intValue() : 0)
                .build();
    }

    /**
     * Statistics data class
     */
    @lombok.Data
    @lombok.Builder
    public static class SessionSetStatistics {
        private Long totalSessionSets;
        private Float averageSessionsPerSet;
        private Integer totalPlannedSessions;
        private Integer totalCompletedSessions;
    }
}