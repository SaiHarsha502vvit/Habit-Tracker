package com.habittracker.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * 🚀 UNIFIED ENTERPRISE WEBSOCKET CONFIGURATION
 * 
 * Enables real-time cross-device synchronization for the unified file system:
 * - Real-time copy/paste notifications
 * - Cross-device cache invalidation
 * - File system event broadcasting
 * - Performance metrics streaming
 */
@Configuration
@EnableWebSocketMessageBroker
public class UnifiedWebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Enable simple broker for broadcasting messages
        config.enableSimpleBroker(
                "/topic/file-system/events", // File system events
                "/topic/file-system/cache-invalidation", // Cache invalidation notifications
                "/topic/file-system/performance", // Performance metrics
                "/topic/file-system/sync" // Cross-device sync events
        );

        // Set application destination prefix for client messages
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Register STOMP endpoint for unified file system WebSocket connections
        registry.addEndpoint("/unified-file-system-ws")
                .setAllowedOriginPatterns("*") // Configure for your frontend domain
                .withSockJS(); // Enable SockJS fallback

        // Additional endpoint for legacy compatibility
        registry.addEndpoint("/fs-websocket")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }
}
