package com.habittracker.service;

import com.habittracker.dto.HabitLogDto;
import com.habittracker.model.HabitLog;
import com.habittracker.repository.HabitLogRepository;
import com.habittracker.repository.HabitRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for HabitService.
 */
@ExtendWith(MockitoExtension.class)
class HabitServiceTest {

    @Mock
    private HabitRepository habitRepository;

    @Mock
    private HabitLogRepository habitLogRepository;

    @InjectMocks
    private HabitService habitService;

    private HabitLog existingLog;
    private Long habitId;
    private LocalDate completionDate;

    @BeforeEach
    void setUp() {
        habitId = 1L;
        completionDate = LocalDate.of(2025, 7, 26);

        existingLog = HabitLog.builder()
                .id(1L)
                .habitId(habitId)
                .completionDate(completionDate)
                .build();
    }

    /**
     * Test that when a log already exists for a habit on a specific date,
     * the service does not save a new log (idempotency test).
     */
    @Test
    void whenLogAlreadyExists_thenDoNotSaveNewLog() {
        // Given: Habit exists and a log already exists for the date
        when(habitRepository.existsById(habitId)).thenReturn(true);
        when(habitLogRepository.findByHabitIdAndCompletionDate(habitId, completionDate))
                .thenReturn(Optional.of(existingLog));

        // When: Attempting to log completion for the same date
        HabitLogDto result = habitService.logHabitCompletion(habitId, completionDate);

        // Then: The existing log should be returned and no new log should be saved
        assertNotNull(result);
        assertEquals(existingLog.getId(), result.getId());
        assertEquals(habitId, result.getHabitId());
        assertEquals(completionDate.toString(), result.getCompletionDate());

        // Verify that save was never called (idempotency)
        verify(habitLogRepository, never()).save(any(HabitLog.class));

        // Verify that the existing log was fetched
        verify(habitLogRepository, times(1)).findByHabitIdAndCompletionDate(habitId, completionDate);
    }

    /**
     * Test that when no log exists for a habit on a specific date,
     * a new log is created and saved.
     */
    @Test
    void whenLogDoesNotExist_thenSaveNewLog() {
        // Given: Habit exists but no log exists for the date
        when(habitRepository.existsById(habitId)).thenReturn(true);
        when(habitLogRepository.findByHabitIdAndCompletionDate(habitId, completionDate))
                .thenReturn(Optional.empty());
        when(habitLogRepository.save(any(HabitLog.class))).thenReturn(existingLog);

        // When: Logging completion for a new date
        HabitLogDto result = habitService.logHabitCompletion(habitId, completionDate);

        // Then: A new log should be created and saved
        assertNotNull(result);
        assertEquals(existingLog.getId(), result.getId());
        assertEquals(habitId, result.getHabitId());
        assertEquals(completionDate.toString(), result.getCompletionDate());

        // Verify that save was called once
        verify(habitLogRepository, times(1)).save(any(HabitLog.class));

        // Verify that we checked for existing log first
        verify(habitLogRepository, times(1)).findByHabitIdAndCompletionDate(habitId, completionDate);
    }
}
