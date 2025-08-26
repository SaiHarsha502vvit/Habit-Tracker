package com.habittracker.config;

import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.cache.CacheManager;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.beans.factory.annotation.Value;

import java.util.concurrent.Executor;

/**
 * Performance optimization configuration
 */
@Configuration
@EnableCaching
@EnableAsync
public class PerformanceConfig {

    @Value("${app.performance.async.core-pool-size:5}")
    private int asyncCorePoolSize;

    @Value("${app.performance.async.max-pool-size:10}")
    private int asyncMaxPoolSize;

    /**
     * Configure cache manager for performance optimization
     */
    @Bean
    public CacheManager cacheManager() {
        ConcurrentMapCacheManager cacheManager = new ConcurrentMapCacheManager();
        cacheManager.setCacheNames(java.util.Arrays.asList(
                "habits",
                "habitLogs",
                "pomodoroSessions",
                "categories",
                "userStats"));
        return cacheManager;
    }

    /**
     * Configure async executor for background tasks
     */
    @Bean(name = "taskExecutor")
    public Executor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(asyncCorePoolSize);
        executor.setMaxPoolSize(asyncMaxPoolSize);
        executor.setQueueCapacity(500);
        executor.setThreadNamePrefix("HabitTracker-");
        executor.initialize();
        return executor;
    }
}
