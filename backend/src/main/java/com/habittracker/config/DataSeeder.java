package com.habittracker.config;

import com.habittracker.model.Habit;
import com.habittracker.model.HabitLog;
import com.habittracker.model.Category;
import com.habittracker.repository.HabitLogRepository;
import com.habittracker.repository.HabitRepository;
import com.habittracker.repository.CategoryRepository;
import com.habittracker.service.CategoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.Set;

/**
 * Component to seed the database with sample data for development.
 * Enhanced with Phase 1 features.
 */
@Component
public class DataSeeder implements CommandLineRunner {

        private final HabitRepository habitRepository;
        private final HabitLogRepository habitLogRepository;
        private final CategoryRepository categoryRepository;
        private final CategoryService categoryService;

        public DataSeeder(HabitRepository habitRepository,
                        HabitLogRepository habitLogRepository,
                        CategoryRepository categoryRepository,
                        CategoryService categoryService) {
                this.habitRepository = habitRepository;
                this.habitLogRepository = habitLogRepository;
                this.categoryRepository = categoryRepository;
                this.categoryService = categoryService;
        }

        @Override
        public void run(String... args) throws Exception {
                // Initialize default categories first
                categoryService.initializeDefaultCategories();

                if (habitRepository.count() == 0) {
                        System.out.println("Seeding database with sample data...");

                        // Get some categories for sample habits
                        List<Category> categories = categoryRepository.findByIsDefaultTrue();
                        Category learningCategory = categories.stream()
                                        .filter(c -> c.getName().equals("Learning"))
                                        .findFirst().orElse(null);
                        Category healthCategory = categories.stream()
                                        .filter(c -> c.getName().equals("Health & Fitness"))
                                        .findFirst().orElse(null);
                        Category productivityCategory = categories.stream()
                                        .filter(c -> c.getName().equals("Productivity"))
                                        .findFirst().orElse(null);

                        // Create enhanced sample habits
                        Habit readingHabit = Habit.builder()
                                        .name("Read for 20 minutes")
                                        .description("Read books, articles, or any educational material for at least 20 minutes daily")
                                        .createdAt(LocalDate.of(2025, 5, 1))
                                        .habitType(Habit.HabitType.STANDARD)
                                        .category(learningCategory)
                                        .tags(Set.of("learning", "books", "education"))
                                        .priority(Habit.Priority.HIGH)
                                        .build();

                        Habit exerciseHabit = Habit.builder()
                                        .name("Exercise for 30 minutes")
                                        .description("Any form of physical exercise: gym, walking, running, yoga, etc.")
                                        .createdAt(LocalDate.of(2025, 5, 15))
                                        .habitType(Habit.HabitType.STANDARD)
                                        .category(healthCategory)
                                        .tags(Set.of("health", "fitness", "exercise"))
                                        .priority(Habit.Priority.HIGH)
                                        .build();

                        Habit pomodoroHabit = Habit.builder()
                                        .name("Deep Focus Session")
                                        .description("Focused work using Pomodoro technique")
                                        .createdAt(LocalDate.of(2025, 6, 1))
                                        .habitType(Habit.HabitType.TIMED)
                                        .timerDurationMinutes(25)
                                        .timerPreset(Habit.TimerPreset.POMODORO_CLASSIC)
                                        .category(productivityCategory)
                                        .tags(Set.of("focus", "productivity", "pomodoro"))
                                        .priority(Habit.Priority.MEDIUM)
                                        .build();

                        // Save sample habits
                        readingHabit = habitRepository.save(readingHabit);
                        exerciseHabit = habitRepository.save(exerciseHabit);
                        pomodoroHabit = habitRepository.save(pomodoroHabit);

                        // Create sample logs for habits
                        List<HabitLog> readingLogs = generateRandomLogs(readingHabit.getId(),
                                        LocalDate.of(2025, 5, 1), LocalDate.of(2025, 7, 26), 18);
                        List<HabitLog> exerciseLogs = generateRandomLogs(exerciseHabit.getId(),
                                        LocalDate.of(2025, 5, 15), LocalDate.of(2025, 7, 26), 8);
                        List<HabitLog> pomodoroLogs = generateRandomLogs(pomodoroHabit.getId(),
                                        LocalDate.of(2025, 6, 1), LocalDate.of(2025, 7, 26), 12);

                        habitLogRepository.saveAll(readingLogs);
                        habitLogRepository.saveAll(exerciseLogs);
                        habitLogRepository.saveAll(pomodoroLogs);

                        System.out.println(String.format(
                                        "Database seeded successfully with %d categories, %d habits and %d total logs",
                                        categories.size(), 3,
                                        readingLogs.size() + exerciseLogs.size() + pomodoroLogs.size()));
                }
        }

        /**
         * Generate random habit logs between start and end dates.
         */
        private List<HabitLog> generateRandomLogs(Long habitId, LocalDate startDate, LocalDate endDate,
                        int targetCount) {
                List<HabitLog> logs = new ArrayList<>();
                Random random = new Random();

                long daysBetween = startDate.until(endDate).getDays();

                for (int i = 0; i < targetCount; i++) {
                        long randomDays = random.nextLong(daysBetween + 1);
                        LocalDate randomDate = startDate.plusDays(randomDays);

                        // Avoid duplicates
                        boolean dateAlreadyExists = logs.stream()
                                        .anyMatch(log -> log.getCompletionDate().equals(randomDate));

                        if (!dateAlreadyExists) {
                                HabitLog log = HabitLog.builder()
                                                .habitId(habitId)
                                                .completionDate(randomDate)
                                                .build();
                                logs.add(log);
                        }
                }

                return logs;
        }
}
