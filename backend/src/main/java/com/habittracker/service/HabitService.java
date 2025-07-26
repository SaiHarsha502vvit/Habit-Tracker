package com.habittracker.service;

import com.habittracker.dto.HabitDto;
import com.habittracker.dto.HabitLogDto;
import com.habittracker.exception.ResourceNotFoundException;
import com.habittracker.model.Habit;
import com.habittracker.model.HabitLog;
import com.habittracker.repository.HabitLogRepository;
import com.habittracker.repository.HabitRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service layer for habit-related operations.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class HabitService {

    private final HabitRepository habitRepository;
    private final HabitLogRepository habitLogRepository;

    /**
     * Create a new habit.
     */
    public HabitDto createHabit(HabitDto habitDto) {
        log.info("Creating new habit: {}", habitDto.getName());

        Habit habit = Habit.builder()
                .name(habitDto.getName())
                .description(habitDto.getDescription())
                .createdAt(LocalDate.now())
                .build();

        Habit savedHabit = habitRepository.save(habit);

        return mapToDto(savedHabit);
    }

    /**
     * Get all habits.
     */
    public List<HabitDto> getAllHabits() {
        log.info("Fetching all habits");

        return habitRepository.findAll()
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    /**
     * Delete a habit and all its associated logs.
     */
    @Transactional
    public void deleteHabit(Long habitId) {
        log.info("Deleting habit with ID: {}", habitId);

        // Check if habit exists
        if (!habitRepository.existsById(habitId)) {
            throw new ResourceNotFoundException("Habit with ID " + habitId + " not found");
        }

        // Delete all associated logs first
        habitLogRepository.deleteByHabitId(habitId);

        // Delete the habit
        habitRepository.deleteById(habitId);
    }

    /**
     * Log a habit completion for a specific date.
     * This method is idempotent - if a log already exists for the date, it returns
     * the existing log.
     */
    public HabitLogDto logHabitCompletion(Long habitId, LocalDate completionDate) {
        log.info("Logging completion for habit {} on date {}", habitId, completionDate);

        // Check if habit exists
        if (!habitRepository.existsById(habitId)) {
            throw new ResourceNotFoundException("Habit with ID " + habitId + " not found");
        }

        // Check if log already exists for this date (idempotency)
        Optional<HabitLog> existingLog = habitLogRepository.findByHabitIdAndCompletionDate(habitId, completionDate);
        if (existingLog.isPresent()) {
            log.info("Log already exists for habit {} on date {}", habitId, completionDate);
            return mapToDto(existingLog.get());
        }

        // Create new log
        HabitLog habitLog = HabitLog.builder()
                .habitId(habitId)
                .completionDate(completionDate)
                .build();

        HabitLog savedLog = habitLogRepository.save(habitLog);

        return mapToDto(savedLog);
    }

    /**
     * Get completion logs for a habit within a specific year.
     */
    public List<LocalDate> getCompletionLogsForYear(Long habitId, int year) {
        log.info("Fetching completion logs for habit {} in year {}", habitId, year);

        // Check if habit exists
        if (!habitRepository.existsById(habitId)) {
            throw new ResourceNotFoundException("Habit with ID " + habitId + " not found");
        }

        LocalDate startDate = LocalDate.of(year, 1, 1);
        LocalDate endDate = LocalDate.of(year, 12, 31);

        return habitLogRepository.findByHabitIdAndCompletionDateBetween(habitId, startDate, endDate)
                .stream()
                .map(HabitLog::getCompletionDate)
                .collect(Collectors.toList());
    }

    /**
     * Map Habit entity to DTO.
     */
    private HabitDto mapToDto(Habit habit) {
        return HabitDto.builder()
                .id(habit.getId())
                .name(habit.getName())
                .description(habit.getDescription())
                .createdAt(habit.getCreatedAt().toString())
                .build();
    }

    /**
     * Map HabitLog entity to DTO.
     */
    private HabitLogDto mapToDto(HabitLog habitLog) {
        return HabitLogDto.builder()
                .id(habitLog.getId())
                .habitId(habitLog.getHabitId())
                .completionDate(habitLog.getCompletionDate().toString())
                .build();
    }
}
