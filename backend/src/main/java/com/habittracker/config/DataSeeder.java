package com.habittracker.config;

import com.habittracker.model.Habit;
import com.habittracker.model.HabitLog;
import com.habittracker.repository.HabitLogRepository;
import com.habittracker.repository.HabitRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

/**
 * Component to seed the database with sample data for development.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final HabitRepository habitRepository;
    private final HabitLogRepository habitLogRepository;

    @Override
    public void run(String... args) throws Exception {
        if (habitRepository.count() == 0) {
            log.info("Seeding database with sample data...");

            // Create sample habits
            Habit readingHabit = Habit.builder()
                    .name("Read for 20 minutes")
                    .description("Read books, articles, or any educational material for at least 20 minutes daily")
                    .createdAt(LocalDate.of(2025, 5, 1))
                    .build();

            Habit exerciseHabit = Habit.builder()
                    .name("Exercise for 30 minutes")
                    .description("Any form of physical exercise: gym, walking, running, yoga, etc.")
                    .createdAt(LocalDate.of(2025, 5, 15))
                    .build();

            readingHabit = habitRepository.save(readingHabit);
            exerciseHabit = habitRepository.save(exerciseHabit);

            // Create sample logs for reading habit (15-20 random days over last 3 months)
            List<HabitLog> readingLogs = generateRandomLogs(readingHabit.getId(),
                    LocalDate.of(2025, 5, 1), LocalDate.of(2025, 7, 26), 18);

            // Create sample logs for exercise habit (5-10 random days)
            List<HabitLog> exerciseLogs = generateRandomLogs(exerciseHabit.getId(),
                    LocalDate.of(2025, 5, 15), LocalDate.of(2025, 7, 26), 8);

            habitLogRepository.saveAll(readingLogs);
            habitLogRepository.saveAll(exerciseLogs);

            log.info("Database seeded successfully with {} habits and {} total logs",
                    2, readingLogs.size() + exerciseLogs.size());
        }
    }

    /**
     * Generate random habit logs between start and end dates.
     */
    private List<HabitLog> generateRandomLogs(Long habitId, LocalDate startDate, LocalDate endDate, int targetCount) {
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
