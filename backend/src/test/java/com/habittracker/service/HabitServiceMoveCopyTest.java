package com.habittracker.service;

import com.habittracker.dto.HabitDto;
import com.habittracker.model.Habit;
import com.habittracker.model.User;
import com.habittracker.repository.HabitRepository;
import com.habittracker.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Test for new move/copy functionality in HabitService
 */
@ExtendWith(MockitoExtension.class)
class HabitServiceMoveCopyTest {

    @Mock
    private HabitRepository habitRepository;

    @Mock
    private UserService userService;

    @InjectMocks
    private HabitService habitService;

    private Habit testHabit;
    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .username("testuser")
                .email("test@example.com")
                .build();

        testHabit = Habit.builder()
                .id(1L)
                .name("Test Habit")
                .description("Test Description")
                .habitType(Habit.HabitType.STANDARD)
                .createdAt(LocalDate.now())
                .updatedAt(LocalDateTime.now())
                .user(testUser)
                .streakCount(5)
                .build();
    }

    @Test
    void whenMoveHabitToFolder_thenShouldUpdateFolderReference() {
        // Given
        Long habitId = 1L;
        Long folderId = 2L;
        
        when(habitRepository.findById(habitId)).thenReturn(Optional.of(testHabit));
        when(userService.getCurrentUser()).thenReturn(testUser);
        when(habitRepository.save(any(Habit.class))).thenReturn(testHabit);

        // When
        HabitDto result = habitService.moveHabitToFolder(habitId, folderId);

        // Then
        assertNotNull(result);
        assertEquals(testHabit.getName(), result.getName());
        verify(habitRepository).save(any(Habit.class));
        verify(habitRepository).findById(habitId);
    }

    @Test
    void whenCopyHabitToFolder_thenShouldCreateNewHabit() {
        // Given
        Long habitId = 1L;
        Long folderId = 2L;
        
        Habit copiedHabit = Habit.builder()
                .id(2L)
                .name("Test Habit (Copy)")
                .description("Test Description")
                .habitType(Habit.HabitType.STANDARD)
                .createdAt(LocalDate.now())
                .user(testUser)
                .streakCount(0)
                .build();
        
        when(habitRepository.findById(habitId)).thenReturn(Optional.of(testHabit));
        when(userService.getCurrentUser()).thenReturn(testUser);
        when(habitRepository.save(any(Habit.class))).thenReturn(copiedHabit);

        // When
        HabitDto result = habitService.copyHabitToFolder(habitId, folderId);

        // Then
        assertNotNull(result);
        assertEquals("Test Habit (Copy)", result.getName());
        assertEquals(0, result.getStreakCount()); // Copied habit should reset streak
        verify(habitRepository).save(any(Habit.class));
        verify(habitRepository).findById(habitId);
    }

    @Test
    void whenMoveNonExistentHabit_thenShouldThrowException() {
        // Given
        Long habitId = 999L;
        Long folderId = 2L;
        
        when(habitRepository.findById(habitId)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(ResourceNotFoundException.class, () -> {
            habitService.moveHabitToFolder(habitId, folderId);
        });
    }
}