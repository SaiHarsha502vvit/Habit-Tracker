package com.habittracker.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.annotation.PostConstruct;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.stream.Collectors;

/**
 * Service to fix database schema issues for the Unified Enterprise File System
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class DatabaseSchemaFixService {

    private final JdbcTemplate jdbcTemplate;

    @PostConstruct
    @Transactional
    public void fixDatabaseSchema() {
        log.info("🔧 Applying database schema fixes for Ultimate File Manager...");

        try {
            // Read the schema fix SQL file
            ClassPathResource resource = new ClassPathResource("sql/unified-filesystem-schema-fix.sql");

            String sql;
            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8))) {
                sql = reader.lines().collect(Collectors.joining("\n"));
            }

            // Split SQL statements and execute them one by one
            String[] statements = sql.split(";");

            int executedCount = 0;
            int errorCount = 0;

            for (String statement : statements) {
                statement = statement.trim();
                if (!statement.isEmpty() && !statement.startsWith("--")) {
                    try {
                        jdbcTemplate.execute(statement);
                        executedCount++;
                        log.debug("✅ Executed: {}", statement.substring(0, Math.min(statement.length(), 50)) + "...");
                    } catch (Exception e) {
                        errorCount++;
                        // Log warnings for expected errors (like "column already exists")
                        if (e.getMessage().contains("already exists") ||
                                e.getMessage().contains("Duplicate") ||
                                e.getMessage().contains("can't DROP")) {
                            log.debug("⚠️ Expected schema fix warning: {}", e.getMessage());
                        } else {
                            log.warn("⚠️ Schema fix warning for statement: {} - Error: {}",
                                    statement.substring(0, Math.min(statement.length(), 100)), e.getMessage());
                        }
                    }
                }
            }

            log.info("🎯 Database schema fix completed! Executed: {}, Warnings: {}", executedCount, errorCount);

            // Validate critical tables exist
            validateCriticalTables();

        } catch (Exception e) {
            log.error("❌ Failed to apply database schema fixes", e);
            throw new RuntimeException("Database schema fix failed", e);
        }
    }

    private void validateCriticalTables() {
        String[] criticalTables = {
                "fs_objects", "fs_refs", "fs_index", "fs_cache", "fs_sync_log",
                "habits", "categories", "habit_folders"
        };

        for (String table : criticalTables) {
            try {
                int count = jdbcTemplate.queryForObject(
                        "SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = ? AND TABLE_SCHEMA = DATABASE()",
                        Integer.class, table);

                if (count > 0) {
                    log.debug("✅ Table '{}' exists", table);
                } else {
                    log.warn("⚠️ Critical table '{}' does not exist", table);
                }
            } catch (Exception e) {
                log.warn("⚠️ Could not validate table '{}': {}", table, e.getMessage());
            }
        }

        log.info("🏆 Ultimate File Manager database validation completed!");
    }
}
