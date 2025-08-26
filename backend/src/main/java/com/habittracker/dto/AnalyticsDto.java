package com.habittracker.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.List;
import java.util.Map;

/**
 * Analytics Data Transfer Objects for comprehensive habit tracking insights
 */
public class AnalyticsDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class DashboardAnalytics {
        private int totalHabits;
        private int activeHabits;
        private double completionRate;
        private Map<String, Integer> currentStreaks;
        private Map<String, Integer> longestStreaks;
        private List<WeeklyTrend> weeklyTrends;
        private List<CategoryAnalytics> categoryBreakdown;
        private List<UpcomingGoal> upcomingGoals;
        private List<PerformanceInsight> performanceInsights;
        private List<ChartDataPoint> habitCompletionChart;
        private Map<String, Integer> streakDistribution;
        private TimeAnalysis timeOfDayAnalysis;
        private double consistencyScore;
        private String generatedAt;
        private String period;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class WeeklyTrend {
        private int week;
        private double completionRate;
        private int totalEntries;
        private int completedEntries;
        private String trend; // IMPROVING, STABLE, DECLINING
        private double changePercentage;
        private String insight;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class CategoryAnalytics {
        private String categoryName;
        private String categoryColor;
        private String categoryIcon;
        private int habitCount;
        private double completionRate;
        private int totalEntries;
        private int completedEntries;
        private double averageStreak;
        private String topPerformer;
        private String improvementSuggestion;
        private List<HabitPerformance> habits;
        private String trend;
        private double changeFromLastPeriod;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class HabitPerformance {
        private Long habitId;
        private String habitName;
        private double completionRate;
        private int currentStreak;
        private int longestStreak;
        private String priority;
        private double consistencyScore;
        private String lastCompleted;
        private String trend;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class UpcomingGoal {
        private String habitName;
        private String goalType; // STREAK_MILESTONE, COMPLETION_RATE, CUSTOM
        private int target;
        private int current;
        private int daysRemaining;
        private String description;
        private String priority; // HIGH, MEDIUM, LOW
        private double progressPercentage;
        private String motivationalMessage;
        private String reward;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class PerformanceInsight {
        private String title;
        private String insight;
        private String actionable;
        private String priority; // HIGH, MEDIUM, LOW
        private String category; // TIMING, DIFFICULTY, CONSISTENCY, MOTIVATION
        private double confidence; // AI confidence score
        private List<String> supportingData;
        private String recommendation;
        private boolean implemented;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class ChartDataPoint {
        private String date;
        private double value;
        private int count;
        private int completed;
        private String label;
        private Map<String, Object> metadata;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class TimeAnalysis {
        private int peakHour;
        private Long peakHourCompletions;
        private Long totalCompletions;
        private String averageCompletionTime;
        private String recommendation;
        private Map<Integer, Long> hourlyDistribution;
        private List<TimePattern> patterns;
        private String bestTimeRange;
        private String worstTimeRange;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class TimePattern {
        private String timeRange;
        private double completionRate;
        private int totalAttempts;
        private String dayOfWeek;
        private String pattern; // MORNING_PERSON, NIGHT_OWL, CONSISTENT, INCONSISTENT
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class HabitTrend {
        private Long habitId;
        private String habitName;
        private List<TrendDataPoint> dataPoints;
        private String trendDirection; // IMPROVING, DECLINING, STABLE, INSUFFICIENT_DATA
        private double averageCompletion;
        private double trendSlope;
        private String prediction;
        private double confidenceInterval;
        private List<String> insights;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class TrendDataPoint {
        private String date;
        private boolean completed;
        private double value;
        private String note;
        private Map<String, Object> context;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class ComparisonAnalytics {
        private String period; // WEEK, MONTH, QUARTER, YEAR
        private double currentPeriodRate;
        private double previousPeriodRate;
        private double changePercentage;
        private String changeDirection; // IMPROVED, DECLINED, STABLE
        private List<HabitComparison> habitComparisons;
        private String summary;
        private List<String> achievements;
        private List<String> areasForImprovement;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class HabitComparison {
        private Long habitId;
        private String habitName;
        private double currentRate;
        private double previousRate;
        private double improvement;
        private String status; // IMPROVED, DECLINED, STABLE, NEW
        private int currentStreak;
        private int previousStreak;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class StreakAnalytics {
        private Map<String, Integer> currentStreaks;
        private Map<String, Integer> longestStreaks;
        private List<StreakMilestone> milestones;
        private double averageStreakLength;
        private String streakPattern; // CONSISTENT, INCONSISTENT, IMPROVING, DECLINING
        private List<String> streakTips;
        private StreakLeaderboard leaderboard;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class StreakMilestone {
        private String habitName;
        private int milestone; // 7, 21, 30, 60, 90, 100, 365
        private int currentStreak;
        private int daysToMilestone;
        private String description;
        private String reward;
        private boolean achieved;
        private String achievedDate;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class StreakLeaderboard {
        private List<StreakEntry> topStreaks;
        private StreakEntry userBest;
        private int userRank;
        private String encouragement;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class StreakEntry {
        private String habitName;
        private int streakLength;
        private String startDate;
        private String status; // ACTIVE, BROKEN, COMPLETED
        private String category;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class PredictiveAnalytics {
        private List<HabitPrediction> predictions;
        private double overallSuccessProbability;
        private List<RiskFactor> riskFactors;
        private List<SuccessFactor> successFactors;
        private String recommendation;
        private double confidence;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class HabitPrediction {
        private Long habitId;
        private String habitName;
        private double successProbability;
        private String riskLevel; // LOW, MEDIUM, HIGH
        private List<String> predictedChallenges;
        private List<String> recommendations;
        private String timeframe;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class RiskFactor {
        private String factor;
        private double impact; // 0.0 to 1.0
        private String description;
        private String mitigation;
        private String category;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class SuccessFactor {
        private String factor;
        private double impact; // 0.0 to 1.0
        private String description;
        private String amplification;
        private String category;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class MotivationalInsights {
        private List<Achievement> achievements;
        private List<String> motivationalMessages;
        private String personalityType; // Based on completion patterns
        private List<String> suggestedRewards;
        private double motivationLevel;
        private String currentMood; // Based on recent performance
        private List<String> encouragements;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class Achievement {
        private String title;
        private String description;
        private String icon;
        private String category;
        private String unlockedDate;
        private boolean isNew;
        private int points;
        private String rarity; // COMMON, RARE, EPIC, LEGENDARY
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class SmartRecommendations {
        private List<HabitRecommendation> habitSuggestions;
        private List<TimingRecommendation> timingOptimizations;
        private List<DifficultyRecommendation> difficultyAdjustments;
        private List<CategoryRecommendation> categoryInsights;
        private String overallStrategy;
        private double implementationComplexity;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class HabitRecommendation {
        private String type; // NEW_HABIT, MODIFY_EXISTING, PAUSE, RESUME
        private String title;
        private String description;
        private String reasoning;
        private String category;
        private String priority;
        private double successProbability;
        private List<String> implementationSteps;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class TimingRecommendation {
        private String habitName;
        private String currentTime;
        private String suggestedTime;
        private String reasoning;
        private double expectedImprovement;
        private String timeframe;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class DifficultyRecommendation {
        private String habitName;
        private String currentDifficulty;
        private String suggestedDifficulty;
        private String reasoning;
        private List<String> modifications;
        private String expectedOutcome;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class CategoryRecommendation {
        private String categoryName;
        private String insight;
        private String recommendation;
        private double priority;
        private List<String> actionItems;
        private String expectedImpact;
    }
}
