package com.habittracker.service;

import com.habittracker.model.Habit;
import com.habittracker.model.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

/**
 * Enhanced notification service for handling various types of notifications
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    @Value("${app.notifications.enabled:true}")
    private boolean notificationsEnabled;

    @Value("${app.notifications.email.enabled:false}")
    private boolean emailNotificationsEnabled;

    @Value("${app.notifications.push.enabled:false}")
    private boolean pushNotificationsEnabled;

    /**
     * Send habit completion notification
     */
    @Async
    public CompletableFuture<Void> sendHabitCompletionNotification(Habit habit, User user) {
        if (!notificationsEnabled) {
            return CompletableFuture.completedFuture(null);
        }

        try {
            NotificationPayload payload = NotificationPayload.builder()
                    .type(NotificationType.HABIT_COMPLETION)
                    .title("🎉 Habit Completed!")
                    .message(String.format("Great job! You completed '%s'", habit.getName()))
                    .timestamp(LocalDateTime.now())
                    .userId(user != null ? user.getId() : null)
                    .build();

            // Send to different channels based on configuration
            sendNotification(payload, user);

            log.info("Sent habit completion notification for habit: {} to user: {}",
                    habit.getName(), user != null ? user.getUsername() : "anonymous");

        } catch (Exception e) {
            log.error("Failed to send habit completion notification", e);
        }

        return CompletableFuture.completedFuture(null);
    }

    /**
     * Send streak milestone notification
     */
    @Async
    public CompletableFuture<Void> sendStreakMilestoneNotification(Habit habit, User user, int streakCount) {
        if (!notificationsEnabled) {
            return CompletableFuture.completedFuture(null);
        }

        try {
            String emoji = getStreakEmoji(streakCount);
            NotificationPayload payload = NotificationPayload.builder()
                    .type(NotificationType.STREAK_MILESTONE)
                    .title(String.format("%s Streak Milestone!", emoji))
                    .message(String.format("Amazing! You've maintained '%s' for %d days!",
                            habit.getName(), streakCount))
                    .timestamp(LocalDateTime.now())
                    .userId(user != null ? user.getId() : null)
                    .build();

            sendNotification(payload, user);

            log.info("Sent streak milestone notification for habit: {} (streak: {}) to user: {}",
                    habit.getName(), streakCount, user != null ? user.getUsername() : "anonymous");

        } catch (Exception e) {
            log.error("Failed to send streak milestone notification", e);
        }

        return CompletableFuture.completedFuture(null);
    }

    /**
     * Send reminder notification
     */
    @Async
    public CompletableFuture<Void> sendReminderNotification(Habit habit, User user) {
        if (!notificationsEnabled) {
            return CompletableFuture.completedFuture(null);
        }

        try {
            NotificationPayload payload = NotificationPayload.builder()
                    .type(NotificationType.REMINDER)
                    .title("⏰ Habit Reminder")
                    .message(String.format("Don't forget to work on '%s' today!", habit.getName()))
                    .timestamp(LocalDateTime.now())
                    .userId(user != null ? user.getId() : null)
                    .build();

            sendNotification(payload, user);

            log.info("Sent reminder notification for habit: {} to user: {}",
                    habit.getName(), user != null ? user.getUsername() : "anonymous");

        } catch (Exception e) {
            log.error("Failed to send reminder notification", e);
        }

        return CompletableFuture.completedFuture(null);
    }

    /**
     * Send pomodoro session completion notification
     */
    @Async
    public CompletableFuture<Void> sendPomodoroCompletionNotification(Habit habit, User user,
            String sessionType, int sessionCount) {
        if (!notificationsEnabled) {
            return CompletableFuture.completedFuture(null);
        }

        try {
            String emoji = "WORK".equals(sessionType) ? "🍅" : "☕";
            String action = "WORK".equals(sessionType) ? "work session" : "break";

            NotificationPayload payload = NotificationPayload.builder()
                    .type(NotificationType.POMODORO_COMPLETE)
                    .title(String.format("%s %s Complete!", emoji,
                            sessionType.toLowerCase().replace("_", " ")))
                    .message(String.format("You completed a %s for '%s'. Sessions today: %d",
                            action, habit.getName(), sessionCount))
                    .timestamp(LocalDateTime.now())
                    .userId(user != null ? user.getId() : null)
                    .build();

            sendNotification(payload, user);

            log.info("Sent pomodoro completion notification for habit: {} (type: {}) to user: {}",
                    habit.getName(), sessionType, user != null ? user.getUsername() : "anonymous");

        } catch (Exception e) {
            log.error("Failed to send pomodoro completion notification", e);
        }

        return CompletableFuture.completedFuture(null);
    }

    /**
     * Send notification through appropriate channels
     */
    private void sendNotification(NotificationPayload payload, User user) {
        // Log notification (always enabled for debugging)
        logNotification(payload);

        // Email notifications (if enabled and user has email)
        if (emailNotificationsEnabled && user != null && user.getEmail() != null) {
            sendEmailNotification(payload, user);
        }

        // Push notifications (if enabled - would integrate with push service)
        if (pushNotificationsEnabled && user != null) {
            sendPushNotification(payload, user);
        }

        // Browser notifications are handled by frontend
        // We could implement WebSocket notifications here for real-time updates
    }

    /**
     * Log notification for debugging and audit purposes
     */
    private void logNotification(NotificationPayload payload) {
        log.info("Notification [{}] - {}: {} at {}",
                payload.getType().name(),
                payload.getTitle(),
                payload.getMessage(),
                payload.getTimestamp().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
    }

    /**
     * Send email notification with basic implementation
     */
    private void sendEmailNotification(NotificationPayload payload, User user) {
        try {
            if (!emailNotificationsEnabled || user.getEmail() == null) {
                log.debug("Email notifications disabled or user email not available");
                return;
            }
            
            // Basic email implementation using Spring Mail
            String subject = payload.getTitle();
            String body = String.format("""
                Hello %s,
                
                %s
                
                Time: %s
                
                Best regards,
                Habit Tracker Team
                """, 
                user.getUsername() != null ? user.getUsername() : "User",
                payload.getMessage(),
                payload.getTimestamp().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
            );
            
            // In a real implementation, you would use JavaMailSender here
            log.info("📧 Email notification prepared for: {} - Subject: {} - Body length: {}", 
                    user.getEmail(), subject, body.length());
            
            // Placeholder for actual email sending:
            // mailSender.send(createMimeMessage(user.getEmail(), subject, body));
            
        } catch (Exception e) {
            log.error("Failed to send email notification to {}: {}", user.getEmail(), e.getMessage());
        }
    }

    /**
     * Send push notification with basic implementation
     */
    private void sendPushNotification(NotificationPayload payload, User user) {
        try {
            if (!pushNotificationsEnabled) {
                log.debug("Push notifications disabled");
                return;
            }
            
            // Basic push notification structure
            PushNotificationRequest pushRequest = PushNotificationRequest.builder()
                    .userId(user.getId().toString())
                    .title(payload.getTitle())
                    .message(payload.getMessage())
                    .timestamp(payload.getTimestamp())
                    .build();
                    
            // In a real implementation, you would integrate with Firebase FCM, AWS SNS, etc.
            log.info("📱 Push notification prepared for user: {} - Title: {} - Message: {}", 
                    user.getUsername(), pushRequest.getTitle(), pushRequest.getMessage());
            
            // Placeholder for actual push notification sending:
            // firebaseMessaging.send(createFirebaseMessage(pushRequest));
            // or awsSnsClient.publish(createSnsPublishRequest(pushRequest));
            
        } catch (Exception e) {
            log.error("Failed to send push notification to user {}: {}", user.getUsername(), e.getMessage());
        }
    }
    
    /**
     * Simple push notification request structure
     */
    @lombok.Builder
    @lombok.Data
    private static class PushNotificationRequest {
        private String userId;
        private String title;
        private String message;
        private LocalDateTime timestamp;
    }

    /**
     * Get appropriate emoji for streak milestones
     */
    private String getStreakEmoji(int streak) {
        if (streak >= 100)
            return "🏆";
        if (streak >= 50)
            return "🌟";
        if (streak >= 30)
            return "🎯";
        if (streak >= 14)
            return "🔥";
        if (streak >= 7)
            return "⭐";
        return "🎉";
    }

    /**
     * Notification types enum
     */
    public enum NotificationType {
        HABIT_COMPLETION,
        STREAK_MILESTONE,
        REMINDER,
        POMODORO_COMPLETE,
        SYSTEM_MESSAGE
    }

    /**
     * Notification payload data structure
     */
    public static class NotificationPayload {
        private NotificationType type;
        private String title;
        private String message;
        private LocalDateTime timestamp;
        private Long userId;
        private Map<String, Object> metadata;

        public static NotificationPayloadBuilder builder() {
            return new NotificationPayloadBuilder();
        }

        // Getters
        public NotificationType getType() {
            return type;
        }

        public String getTitle() {
            return title;
        }

        public String getMessage() {
            return message;
        }

        public LocalDateTime getTimestamp() {
            return timestamp;
        }

        public Long getUserId() {
            return userId;
        }

        public Map<String, Object> getMetadata() {
            return metadata != null ? metadata : new HashMap<>();
        }

        // Builder class
        public static class NotificationPayloadBuilder {
            private NotificationType type;
            private String title;
            private String message;
            private LocalDateTime timestamp;
            private Long userId;
            private Map<String, Object> metadata = new HashMap<>();

            public NotificationPayloadBuilder type(NotificationType type) {
                this.type = type;
                return this;
            }

            public NotificationPayloadBuilder title(String title) {
                this.title = title;
                return this;
            }

            public NotificationPayloadBuilder message(String message) {
                this.message = message;
                return this;
            }

            public NotificationPayloadBuilder timestamp(LocalDateTime timestamp) {
                this.timestamp = timestamp;
                return this;
            }

            public NotificationPayloadBuilder userId(Long userId) {
                this.userId = userId;
                return this;
            }

            public NotificationPayloadBuilder metadata(String key, Object value) {
                this.metadata.put(key, value);
                return this;
            }

            public NotificationPayload build() {
                NotificationPayload payload = new NotificationPayload();
                payload.type = this.type;
                payload.title = this.title;
                payload.message = this.message;
                payload.timestamp = this.timestamp;
                payload.userId = this.userId;
                payload.metadata = this.metadata;
                return payload;
            }
        }
    }
}
