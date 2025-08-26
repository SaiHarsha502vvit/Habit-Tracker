package com.habittracker.controller;

import com.habittracker.dto.PomodoroSessionSetDTO;
import com.habittracker.service.PomodoroSessionSetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

/**
 * REST controller for managing Pomodoro session sets
 */
@RestController
@RequestMapping("/api/pomodoro/session-sets")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Pomodoro Session Sets", description = "Manage Pomodoro cycle planning and tracking")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000", "https://habit-tracker-ui.vercel.app"})
public class PomodoroSessionSetController {

    private final PomodoroSessionSetService sessionSetService;

    /**
     * Create a new Pomodoro session set
     */
    @Operation(summary = "Create a new Pomodoro session set", 
               description = "Plan a new Pomodoro cycle with specified number of sessions and timing")
    @PostMapping
    public ResponseEntity<PomodoroSessionSetDTO> createSessionSet(
            @Valid @RequestBody PomodoroSessionSetDTO sessionSetDTO) {
        
        log.info("Creating session set for habit: {}", sessionSetDTO.getHabitId());
        
        try {
            PomodoroSessionSetDTO created = sessionSetService.createSessionSet(sessionSetDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            log.error("Error creating session set: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get active session set for a habit
     */
    @Operation(summary = "Get active session set", 
               description = "Retrieve the currently active Pomodoro session set for a specific habit")
    @GetMapping("/habit/{habitId}/active")
    public ResponseEntity<PomodoroSessionSetDTO> getActiveSessionSet(
            @Parameter(description = "Habit ID") @PathVariable Long habitId) {
        
        log.debug("Getting active session set for habit: {}", habitId);
        
        return sessionSetService.getActiveSessionSet(habitId)
                .map(sessionSet -> ResponseEntity.ok().body(sessionSet))
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get session set by ID
     */
    @Operation(summary = "Get session set by ID", 
               description = "Retrieve a specific Pomodoro session set by its ID")
    @GetMapping("/{sessionSetId}")
    public ResponseEntity<PomodoroSessionSetDTO> getSessionSetById(
            @Parameter(description = "Session Set ID") @PathVariable Long sessionSetId) {
        
        log.debug("Getting session set: {}", sessionSetId);
        
        try {
            PomodoroSessionSetDTO sessionSet = sessionSetService.getSessionSetById(sessionSetId);
            return ResponseEntity.ok(sessionSet);
        } catch (Exception e) {
            log.error("Error getting session set {}: {}", sessionSetId, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Update session set
     */
    @Operation(summary = "Update session set", 
               description = "Update the state and progress of a Pomodoro session set")
    @PutMapping("/{sessionSetId}")
    public ResponseEntity<PomodoroSessionSetDTO> updateSessionSet(
            @Parameter(description = "Session Set ID") @PathVariable Long sessionSetId,
            @Valid @RequestBody PomodoroSessionSetDTO updates) {
        
        log.info("Updating session set: {}", sessionSetId);
        
        try {
            PomodoroSessionSetDTO updated = sessionSetService.updateSessionSet(sessionSetId, updates);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            log.error("Error updating session set {}: {}", sessionSetId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Advance to next phase
     */
    @Operation(summary = "Advance to next phase", 
               description = "Advance the session set to its next phase (work -> break -> work, etc.)")
    @PostMapping("/{sessionSetId}/advance")
    public ResponseEntity<PomodoroSessionSetDTO> advanceToNextPhase(
            @Parameter(description = "Session Set ID") @PathVariable Long sessionSetId) {
        
        log.info("Advancing session set to next phase: {}", sessionSetId);
        
        try {
            PomodoroSessionSetDTO advanced = sessionSetService.advanceToNextPhase(sessionSetId);
            return ResponseEntity.ok(advanced);
        } catch (IllegalStateException e) {
            log.warn("Cannot advance session set {}: {}", sessionSetId, e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        } catch (Exception e) {
            log.error("Error advancing session set {}: {}", sessionSetId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Cancel session set
     */
    @Operation(summary = "Cancel session set", 
               description = "Cancel the current Pomodoro session set")
    @PostMapping("/{sessionSetId}/cancel")
    public ResponseEntity<PomodoroSessionSetDTO> cancelSessionSet(
            @Parameter(description = "Session Set ID") @PathVariable Long sessionSetId) {
        
        log.info("Cancelling session set: {}", sessionSetId);
        
        try {
            PomodoroSessionSetDTO cancelled = sessionSetService.cancelSessionSet(sessionSetId);
            return ResponseEntity.ok(cancelled);
        } catch (Exception e) {
            log.error("Error cancelling session set {}: {}", sessionSetId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get all session sets for a habit
     */
    @Operation(summary = "Get session sets for habit", 
               description = "Retrieve all Pomodoro session sets for a specific habit")
    @GetMapping("/habit/{habitId}")
    public ResponseEntity<List<PomodoroSessionSetDTO>> getSessionSetsForHabit(
            @Parameter(description = "Habit ID") @PathVariable Long habitId) {
        
        log.debug("Getting session sets for habit: {}", habitId);
        
        try {
            List<PomodoroSessionSetDTO> sessionSets = sessionSetService.getSessionSetsForHabit(habitId);
            return ResponseEntity.ok(sessionSets);
        } catch (Exception e) {
            log.error("Error getting session sets for habit {}: {}", habitId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get completed session sets for a habit
     */
    @Operation(summary = "Get completed session sets", 
               description = "Retrieve completed Pomodoro session sets for a specific habit")
    @GetMapping("/habit/{habitId}/completed")
    public ResponseEntity<List<PomodoroSessionSetDTO>> getCompletedSessionSets(
            @Parameter(description = "Habit ID") @PathVariable Long habitId) {
        
        log.debug("Getting completed session sets for habit: {}", habitId);
        
        try {
            List<PomodoroSessionSetDTO> sessionSets = sessionSetService.getCompletedSessionSets(habitId);
            return ResponseEntity.ok(sessionSets);
        } catch (Exception e) {
            log.error("Error getting completed session sets for habit {}: {}", habitId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get session set statistics for a habit
     */
    @Operation(summary = "Get session set statistics", 
               description = "Get statistical summary of session sets for a habit")
    @GetMapping("/habit/{habitId}/statistics")
    public ResponseEntity<PomodoroSessionSetService.SessionSetStatistics> getSessionSetStatistics(
            @Parameter(description = "Habit ID") @PathVariable Long habitId) {
        
        log.debug("Getting session set statistics for habit: {}", habitId);
        
        try {
            PomodoroSessionSetService.SessionSetStatistics stats = 
                sessionSetService.getSessionSetStatistics(habitId);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            log.error("Error getting session set statistics for habit {}: {}", habitId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}