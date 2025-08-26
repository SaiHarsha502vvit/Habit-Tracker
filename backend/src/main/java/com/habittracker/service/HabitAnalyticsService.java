package com.habittracker.service;

import com.habittracker.model.Habit;
import com.habittracker.model.HabitLog;
import com.habittracker.repository.HabitLogRepository;
import com.habittracker.repository.HabitRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class HabitAnalyticsService {

    private final HabitLogRepository habitLogRepository;
    private final HabitRepository habitRepository;

    public Map<String, Object> getHabitStatistics(Long habitId) {
        log.info("Getting statistics for habit with id: {}", habitId);

        Optional<Habit> habitOpt = habitRepository.findById(habitId);
        if (habitOpt.isEmpty()) {
            throw new RuntimeException("Habit not found with id: " + habitId);
        }

        Habit habit = habitOpt.get();
        List<HabitLog> logs = habitLogRepository.findByHabitIdOrderByCompletionDateDesc(habitId);

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalCompletions", logs.size());
        stats.put("currentStreak", calculateCurrentStreak(logs));
        stats.put("longestStreak", calculateLongestStreak(logs));
        stats.put("completionRate", calculateCompletionRate(logs, habit.getCreatedAt()));
        stats.put("lastCompletion", logs.isEmpty() ? null : logs.get(0).getCompletionDate());

        return stats;
    }

    public Map<String, Object> getWeeklyProgress(Long habitId) {
        log.info("Getting weekly progress for habit with id: {}", habitId);

        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(6);

        List<HabitLog> logs = habitLogRepository.findByHabitIdAndCompletionDateBetween(
                habitId, startDate, endDate);

        Map<LocalDate, Boolean> weeklyData = new HashMap<>();
        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            weeklyData.put(date, false);
        }

        for (HabitLog log : logs) {
            weeklyData.put(log.getCompletionDate(), true);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("weeklyData", weeklyData);
        result.put("completedDays", (int) weeklyData.values().stream().mapToInt(b -> b ? 1 : 0).sum());
        result.put("totalDays", 7);

        return result;
    }

    public Map<String, Object> getAllHabitsOverview(Long userId) {
        log.info("Getting all habits overview for user: {}", userId);

        List<Habit> userHabits = habitRepository.findActiveHabitsByUser(userId);
        Map<String, Object> overview = new HashMap<>();

        int totalHabits = userHabits.size();
        int completedToday = 0;
        int totalCompletions = 0;

        LocalDate today = LocalDate.now();

        for (Habit habit : userHabits) {
            Optional<HabitLog> todayLog = habitLogRepository.findByHabitIdAndCompletionDate(habit.getId(), today);
            if (todayLog.isPresent()) {
                completedToday++;
            }

            List<HabitLog> allLogs = habitLogRepository.findByHabitId(habit.getId());
            totalCompletions += allLogs.size();
        }

        overview.put("totalHabits", totalHabits);
        overview.put("completedToday", completedToday);
        overview.put("completionRateToday", totalHabits > 0 ? (double) completedToday / totalHabits * 100 : 0);
        overview.put("totalCompletions", totalCompletions);
        overview.put("averageCompletionsPerHabit", totalHabits > 0 ? (double) totalCompletions / totalHabits : 0);

        return overview;
    }

    public Map<String, Object> getDashboardAnalytics(Long userId, LocalDate startDate, LocalDate endDate) {
        log.info("Getting dashboard analytics for user: {} from {} to {}", userId, startDate, endDate);

        List<Habit> userHabits = habitRepository.findActiveHabitsByUser(userId);
        Map<String, Object> analytics = new HashMap<>();

        int totalHabits = userHabits.size();
        int totalCompletions = 0;
        Map<LocalDate, Integer> dailyCompletions = new HashMap<>();

        for (Habit habit : userHabits) {
            List<HabitLog> logs = habitLogRepository.findByHabitIdAndCompletionDateBetween(habit.getId(), startDate,
                    endDate);
            totalCompletions += logs.size();

            for (HabitLog log : logs) {
                dailyCompletions.merge(log.getCompletionDate(), 1, Integer::sum);
            }
        }

        analytics.put("totalHabits", totalHabits);
        analytics.put("totalCompletions", totalCompletions);
        analytics.put("dailyCompletions", dailyCompletions);
        analytics.put("averageDaily", totalCompletions > 0 ? (double) totalCompletions /
                (startDate.datesUntil(endDate.plusDays(1)).count()) : 0.0);

        return analytics;
    }

    public Map<String, Object> getHabitTrends(Long userId, List<Long> habitIds, int days) {
        log.info("Getting habit trends for user: {}, habits: {}, days: {}", userId, habitIds, days);

        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(days - 1);

        Map<String, Object> trends = new HashMap<>();
        List<Map<String, Object>> habitTrendData = new ArrayList<>();

        for (Long habitId : habitIds) {
            Optional<Habit> habitOpt = habitRepository.findById(habitId);
            if (habitOpt.isPresent()) {
                Habit habit = habitOpt.get();
                List<HabitLog> logs = habitLogRepository.findByHabitIdAndCompletionDateBetween(habitId, startDate,
                        endDate);

                Map<String, Object> habitTrend = new HashMap<>();
                habitTrend.put("habitId", habitId);
                habitTrend.put("habitName", habit.getName());
                habitTrend.put("completions", logs.size());
                habitTrend.put("completionRate", (double) logs.size() / days * 100);

                habitTrendData.add(habitTrend);
            }
        }

        trends.put("habitTrends", habitTrendData);
        trends.put("periodStart", startDate);
        trends.put("periodEnd", endDate);

        return trends;
    }

    private int calculateCurrentStreak(List<HabitLog> logs) {
        if (logs.isEmpty())
            return 0;

        logs.sort((a, b) -> b.getCompletionDate().compareTo(a.getCompletionDate()));

        LocalDate today = LocalDate.now();
        LocalDate currentDate = today;

        // Check if completed today or yesterday
        if (!logs.get(0).getCompletionDate().equals(today) &&
                !logs.get(0).getCompletionDate().equals(today.minusDays(1))) {
            return 0;
        }

        int streak = 0;
        Set<LocalDate> completionDates = logs.stream()
                .map(HabitLog::getCompletionDate)
                .collect(Collectors.toSet());

        while (completionDates.contains(currentDate)) {
            streak++;
            currentDate = currentDate.minusDays(1);
        }

        return streak;
    }

    private int calculateLongestStreak(List<HabitLog> logs) {
        if (logs.isEmpty())
            return 0;

        Set<LocalDate> completionDates = logs.stream()
                .map(HabitLog::getCompletionDate)
                .collect(Collectors.toSet());

        List<LocalDate> sortedDates = new ArrayList<>(completionDates);
        Collections.sort(sortedDates);

        int maxStreak = 1;
        int currentStreak = 1;

        for (int i = 1; i < sortedDates.size(); i++) {
            if (sortedDates.get(i).equals(sortedDates.get(i - 1).plusDays(1))) {
                currentStreak++;
                maxStreak = Math.max(maxStreak, currentStreak);
            } else {
                currentStreak = 1;
            }
        }

        return maxStreak;
    }

    private double calculateCompletionRate(List<HabitLog> logs, LocalDate createdAt) {
        if (createdAt == null)
            return 0.0;

        LocalDate startDate = createdAt;
        LocalDate endDate = LocalDate.now();

        long totalDays = startDate.datesUntil(endDate.plusDays(1)).count();

        if (totalDays == 0)
            return 0.0;

        return (double) logs.size() / totalDays * 100;
    }
}